import logging
import spacy
import re
from collections import Counter
from typing import List, Dict
from src.utils.pdf_utils import extract_text_from_pdf
from src.exceptions.custom_exceptions import InvalidInputError, ProcessingError

logger = logging.getLogger(__name__)

# Load spaCy's English model and add sentencizer
nlp = spacy.load("en_core_web_sm")
nlp.add_pipe("sentencizer")

# Domain-specific terms and banned words (same as before)
BANNED_WORDS = {
    "bachelor", "master", "phd", "gpa", "university", "college", "experience",
    "technical", "skills", "research", "assistant", "degree", "certificate",
    "project", "projects", "education", "contact", "email", "phone", "curriculum",
    "vitae", "publication", "journal", "conference", "award", "grant", "teaching",
    "mentoring", "supervising", "committee", "service", "workshop", "seminar"
}
ACRONYMS = {"ai": "AI", "ml": "ML", "nlp": "NLP", "cv": "CV", "dl": "DL"}

class ResearchService:
    @staticmethod
    def normalize_phrase(phrase: str) -> str:
        """
        Normalize a phrase: clean spacing, perform lemmatization and proper casing.
        """
        # Clean up spacing and special characters
        phrase = re.sub(r"\s+", " ", phrase).strip()
        doc = nlp(phrase)
        words = [token.lemma_.lower() for token in doc if token.is_alpha and not token.is_stop]
        normalized = " ".join(words)
        # Handle known acronyms
        if normalized.lower() in ACRONYMS:
            return ACRONYMS[normalized.lower()]
        return normalized.title()

    @staticmethod
    def extract_candidate_phrases(text: str) -> List[str]:
        """
        Extract candidate multi-word phrases from the text.
        Uses noun chunks with at least 2 words.
        """
        doc = nlp(text)
        candidates = [chunk.text.strip() for chunk in doc.noun_chunks if len(chunk.text.strip().split()) >= 2]
        return candidates

    @staticmethod
    def filter_valid_phrases(phrases: List[str]) -> List[str]:
        """
        Filter out phrases that contain banned words or don't pass the validation.
        """
        valid = []
        for phrase in phrases:
            normalized = ResearchService.normalize_phrase(phrase)
            if not normalized:
                continue
            # Exclude phrases with banned words
            if any(banned in normalized.lower() for banned in BANNED_WORDS):
                continue
            # Ensure phrase has at least 2 words (after normalization)
            if len(normalized.split()) < 2 and normalized.lower() not in {"ai", "ml", "nlp"}:
                continue
            valid.append(normalized)
        return valid

    @staticmethod
    def extract_research_interests(text: str) -> List[str]:
        """
        Extract research interests by:
          1. Extracting candidate multi-word phrases.
          2. Filtering valid phrases.
          3. Counting frequency and selecting top 10.
        """
        logger.info("Extracting research interests using frequency-based noun phrase extraction")
        # Normalize text
        clean_text = " ".join(text.split())
        candidates = ResearchService.extract_candidate_phrases(clean_text)
        valid_phrases = ResearchService.filter_valid_phrases(candidates)
        
        if not valid_phrases:
            logger.warning("No valid candidate phrases extracted.")
            return []
        
        # Count frequency of valid phrases
        phrase_counts = Counter(valid_phrases)
        # Get the top 10 most common phrases
        top_phrases = [phrase for phrase, count in phrase_counts.most_common(10)]
        return top_phrases

    @staticmethod
    def extract_interests_from_profiles(profiles_data: List[Dict], request_files: Dict) -> List[Dict]:
        """
        Processes a list of researcher profiles (or PDFs) and extracts research interests.
        Expects profiles_data as a list of dictionaries:
            [{"name": "John Doe", "description": "Profile text..."}]
        And request_files as a dict for PDF files, if applicable.
        Returns a list of dictionaries:
            [{"name": "John Doe", "research_topics": ["Topic1", "Topic2", ...]}]
        """
        if not profiles_data:
            raise InvalidInputError("No profiles data provided")

        results = []
        for index, profile in enumerate(profiles_data):
            try:
                name = profile.get("name")
                description = profile.get("description", "")
                # Handle PDF input if available
                pdf_field = f"pdf{index}"
                if pdf_field in request_files:
                    description = extract_text_from_pdf(request_files[pdf_field])
                
                if not name or not description:
                    logger.warning(f"Skipping profile {index}: missing name or description")
                    continue

                topics = ResearchService.extract_research_interests(description)
                results.append({"name": name, "research_topics": topics})
            except Exception as e:
                logger.error(f"Error processing profile {index}: {str(e)}")
                continue
        return results