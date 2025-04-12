import logging
import re
import spacy
from collections import Counter
from typing import List, Dict
from flask import jsonify
from src.utils.response_utils import error_response, success_response
from src.utils.pdf_utils import extract_text_from_pdf
from src.exceptions.custom_exceptions import InvalidInputError
from src.database.database import get_room_by_id, update_room_item
from bs4 import BeautifulSoup
import requests

logger = logging.getLogger(__name__)

# Load spaCy model
nlp = spacy.load("en_core_web_sm")
nlp.add_pipe("sentencizer")

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
        phrase = re.sub(r"\s+", " ", phrase).strip()
        doc = nlp(phrase)
        words = [token.lemma_.lower() for token in doc if token.is_alpha and not token.is_stop]
        normalized = " ".join(words)
        if normalized.lower() in ACRONYMS:
            return ACRONYMS[normalized.lower()]
        return normalized.title()

    @staticmethod
    def extract_candidate_phrases(text: str) -> List[str]:
        doc = nlp(text)
        return [chunk.text.strip() for chunk in doc.noun_chunks if len(chunk.text.strip().split()) >= 2]

    @staticmethod
    def filter_valid_phrases(phrases: List[str]) -> List[str]:
        valid = []
        for phrase in phrases:
            normalized = ResearchService.normalize_phrase(phrase)
            if not normalized:
                continue
            if any(banned in normalized.lower() for banned in BANNED_WORDS):
                continue
            if len(normalized.split()) < 2 and normalized.lower() not in {"ai", "ml", "nlp"}:
                continue
            valid.append(normalized)
        return valid

    @staticmethod
    def extract_research_interests(text: str) -> List[str]:
        logger.info("Extracting research interests")
        clean_text = " ".join(text.split())
        candidates = ResearchService.extract_candidate_phrases(clean_text)
        valid_phrases = ResearchService.filter_valid_phrases(candidates)

        if not valid_phrases:
            logger.warning("No valid candidate phrases extracted.")
            return []

        phrase_counts = Counter(valid_phrases)
        return [phrase for phrase, count in phrase_counts.most_common(10)]

    @staticmethod
    def extract_interests_from_profiles(profiles_data: List[Dict], request_files: Dict) -> List[Dict]:
        if not profiles_data:
            raise InvalidInputError("No profiles data provided")

        results = []
        for index, profile in enumerate(profiles_data):
            try:
                name = profile.get("name")
                description = profile.get("description", "")
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

    @staticmethod
    def extract_research_from_room(data):
        room_id = data.get("RoomID")
        if not room_id:
            return error_response("Room ID is required", 400)

        try:
            data = get_room_by_id(room_id)
            if "Item" not in data:
                return error_response("Room not found", 404)

            room_data = data["Item"]
            profiles = room_data.get("profiles", {})

            profile_list = [
                {"name": p["name"], "description": p.get("description", "")}
                for p in profiles.values()
                if p.get("name") and p.get("description")
            ]

            extracted = ResearchService.extract_interests_from_profiles(profile_list, {})

            update_room_item(
                room_id=room_id,
                update_expression="SET extracted_keywords = :keywords",
                expression_attr_values={":keywords": extracted}
            )

            return success_response({
                "message": "Research interests extracted successfully",
                "keywords": extracted
            })

        except Exception as e:
            import traceback
            print("Exception during research extraction:", traceback.format_exc())
            return error_response(str(e), 500)

    @staticmethod
    def get_extracted_keywords(data):
        room_id = data.get("RoomID")
        if not room_id:
            return error_response("RoomID is required", 400)

        try:
            data = get_room_by_id(room_id)
            if "Item" not in data:
                return error_response("Room not found", 404)

            room_data = data["Item"]
            keywords = room_data.get("extracted_keywords", [])

            return success_response(keywords)

        except Exception as e:
            return error_response(str(e), 500)

    @staticmethod
    def extract_text_from_uploaded_pdf(pdf_file):
        try:
            extracted_text = extract_text_from_pdf(pdf_file)
            return success_response({"text": extracted_text})
        except Exception as e:
            return error_response(str(e), 500)
        
    @staticmethod
    def extract_text_from_url(data):
        url = data.get('url')

        if not url:
            return jsonify({'error': 'URL is required'}), 400

        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')

            # Remove script and style elements
            for tag in soup(['script', 'style']):
                tag.decompose()

            text = soup.get_text(separator=' ', strip=True)

            return success_response({'url': url, 'text': text[:10000]}) # Limiting for safety

        except requests.exceptions.RequestException as e:
            return error_response(str(e), 500)