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
        return [phrase for phrase, _ in phrase_counts.most_common(10)]

    @staticmethod
    def extract_interests_from_profiles(profiles_data: List[Dict], request_files: Dict) -> Dict[str, Dict]:
        if not profiles_data:
            raise InvalidInputError("No profiles data provided")

        results = {}
        for index, profile in enumerate(profiles_data):
            try:
                name = profile.get("name")
                email = profile.get("email")
                description = profile.get("description", "")
                if not name or not description or not email:
                    continue

                topics_map = ResearchService.extract_research_interests(description)

                results[email] = {
                    "name": name,
                    "email": email,
                    "research_topics": topics_map
                }
            except Exception as e:
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
                {"name": p["name"], "email": p["email"], "description": p.get("description", "")}
                for p in profiles.values()
                if p.get("name") and p.get("description") and p["email"]
            ]

            # Use your extraction service
            extracted = ResearchService.extract_interests_from_profiles(profile_list, {})

            # Store result in DynamoDB as a map (list of maps)
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

            return success_response(room_data)
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
        
    @staticmethod
    def update_research_topics_for_user(data):
        room_id = data.get("RoomID")
        email = data.get("email")
        topics = data.get("research_topics")  # expecting a list

        if not all([room_id, email, topics]):
            return error_response("RoomID, email, and research_topics are required", 400)

        try:
            # Directly update nested map under extracted_keywords[email].research_topics
            update_response = update_room_item(
                room_id=room_id,
                update_expression="SET extracted_keywords.#email.#topics = :topics",
                expression_attr_values={
                    ":topics": topics
                },
                expression_attr_names={
                    "#email": email,
                    "#topics": "research_topics"
                }
            )

            return success_response({
                "message": f"Updated research topics for {email}",
                "updated": update_response.get("Attributes")
            })

        except Exception as e:
            import traceback
            print("Exception during updating research topics:", traceback.format_exc())
            return error_response(str(e), 500)
