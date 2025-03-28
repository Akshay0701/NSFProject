import logging
import re
import spacy
from src.utils.pdf_utils import extract_text_from_pdf
from src.exceptions.custom_exceptions import InvalidInputError, ProcessingError

logger = logging.getLogger(__name__)

# Load spaCy's English model
nlp = spacy.load("en_core_web_sm")

# Define a set of keywords that indicate non-research-field content
BANNED_WORDS = {
    "bachelor", "master", "phd", "gpa", "university", "college", "experience",
    "technical", "skills", "research", "assistant", "degree", "certificate",
    "project", "projects", "education", "contact", "email", "phone"
}

# Define known acronyms and their preferred casing
ACRONYMS = {"ai": "AI", "ml": "ML"}

class ResearchService:
    @staticmethod
    def normalize_candidate(candidate: str) -> str:
        """
        Normalize a candidate phrase by lemmatizing and handling acronyms.

        Args:
            candidate (str): The candidate phrase to normalize.

        Returns:
            str: Normalized phrase.
        """
        doc = nlp(candidate)
        lemmas = [token.lemma_.lower() for token in doc if not token.is_stop and token.is_alpha]
        normalized = " ".join(lemmas)
        # Use uppercase for known acronyms, otherwise title case
        if normalized.lower() in ACRONYMS:
            return ACRONYMS[normalized.lower()]
        else:
            return normalized.title()

    @staticmethod
    def is_valid_field(candidate: str) -> bool:
        """
        Check if a candidate phrase is a valid research topic.

        Args:
            candidate (str): The candidate phrase to validate.

        Returns:
            bool: True if the candidate is a valid research topic, False otherwise.
        """
        candidate = candidate.strip()
        # Skip if empty or contains digits
        if not candidate or any(char.isdigit() for char in candidate):
            return False
        # Use spaCy NER to exclude specific entity types
        doc = nlp(candidate)
        for ent in doc.ents:
            if ent.label_ in {"PERSON", "ORG", "GPE", "DATE", "TIME"}:
                return False
        # Tokenize and check length and acronyms
        tokens = candidate.split()
        if len(tokens) < 2 and candidate.lower() not in {"ai", "ml"}:
            return False
        # Exclude banned words
        for token in tokens:
            if token.lower() in BANNED_WORDS:
                return False
        return True

    @staticmethod
    def extract_research_interests(text: str) -> list[str]:
        """
        Extract research interests from a text description.

        Args:
            text (str): The text to extract research interests from.

        Returns:
            list[str]: List of extracted research interests.
        """
        logger.info("Extracting research interests from text")
        interests = []
        # Look for a "Research Interests" section
        pattern = re.compile(
            r"Research Interests\s*[:\-]?\s*(.*?)(?=\n[A-Z][a-z]+:|\n\n|\Z)",
            re.IGNORECASE | re.DOTALL
        )
        match = pattern.search(text)
        if match:
            section_text = match.group(1).strip()
            candidates = re.split(r'[,\n;]+', section_text)
        else:
            # Fallback to noun chunks from the entire text
            doc = nlp(text)
            candidates = [chunk.text for chunk in doc.noun_chunks]

        # Normalize and filter candidates
        seen = set()
        for candidate in candidates:
            normalized = ResearchService.normalize_candidate(candidate)
            if ResearchService.is_valid_field(normalized):
                if normalized.lower() not in seen:
                    seen.add(normalized.lower())
                    interests.append(normalized)
            if len(interests) >= 10:
                break
        logger.debug(f"Extracted research interests: {interests}")
        return interests

    @staticmethod
    def extract_interests_from_profiles(profiles_data: list, request_files: dict) -> list[dict]:
        """
        Extract research interests from profiles with either text or PDF input.

        Args:
            profiles_data (list): List of profile dictionaries with 'name' and 'description' keys.
            request_files (dict): Dictionary of uploaded files from the request.

        Returns:
            list[dict]: List of dictionaries containing names and their research topics.

        Raises:
            InvalidInputError: If profiles data is missing or invalid.
        """
        if not profiles_data:
            raise InvalidInputError("No profiles data provided")

        results = []
        for index, profile in enumerate(profiles_data):
            name = profile.get("name")
            description = profile.get("description", "")

            # Check if a PDF file is provided for this profile
            pdf_field = f"pdf{index}"
            if pdf_field in request_files:
                pdf_file = request_files[pdf_field]
                description = extract_text_from_pdf(pdf_file)

            # Skip if name or description is missing
            if not name or not description:
                logger.warning(f"Skipping profile {index}: missing name or description")
                continue

            # Extract research interests
            topics = ResearchService.extract_research_interests(description)
            results.append({"name": name, "research_topics": topics})

        return results