import logging
from aiohttp import ClientError
from flask import jsonify
import scipy
from sklearn.feature_extraction.text import TfidfVectorizer
from src.utils.response_utils import error_response, success_response
from src.database.database import get_room_by_id, update_room_item
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from collections import Counter
from src.exceptions.custom_exceptions import InvalidInputError

logger = logging.getLogger(__name__)

class TeamService:
    @staticmethod
    def preprocess_research_interests(profiles: dict) -> tuple[list, list]:
        logger.info("Preprocessing research interests")
        profile_names = list(profiles.keys())
        research_texts = [" ".join(interests) for interests in profiles.values()]
        return profile_names, research_texts

    @staticmethod
    def vectorize_texts(texts: list) -> "scipy.sparse.csr_matrix":
        logger.info("Vectorizing research interest texts")
        vectorizer = TfidfVectorizer()
        vectors = vectorizer.fit_transform(texts)
        return vectors

    @staticmethod
    def determine_optimal_clusters(vectors: "scipy.sparse.csr_matrix", max_team_size: int = 4) -> int:
        logger.info("Determining optimal number of clusters")
        n_samples = vectors.shape[0]
        if n_samples < 2:
            return 1
        cluster_range = range(2, min(n_samples, 10))
        best_k = 2
        best_silhouette = -1

        for k in cluster_range:
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            labels = kmeans.fit_predict(vectors)
            silhouette_avg = silhouette_score(vectors, labels)
            if silhouette_avg > best_silhouette:
                best_k = k
                best_silhouette = silhouette_avg

        logger.debug(f"Optimal number of clusters: {best_k}")
        return best_k

    @staticmethod
    def form_teams(profiles: dict, max_team_size: int = 4) -> list[list]:
        logger.info("Forming teams based on research interests")
        profile_names, research_texts = TeamService.preprocess_research_interests(profiles)
        vectors = TeamService.vectorize_texts(research_texts)

        n_samples = len(profile_names)
        if n_samples == 0:
            return []
        elif n_samples == 1:
            return [[profile_names[0]]]

        num_teams = TeamService.determine_optimal_clusters(vectors, max_team_size)
        kmeans = KMeans(n_clusters=num_teams, random_state=42, n_init=10)
        labels = kmeans.fit_predict(vectors)

        clusters = {i: [] for i in range(num_teams)}
        for i, profile in enumerate(profile_names):
            clusters[labels[i]].append(profile)

        final_teams = []
        for members in clusters.values():
            for i in range(0, len(members), max_team_size):
                final_teams.append(members[i:i + max_team_size])

        logger.debug(f"Formed teams: {final_teams}")
        return final_teams

    @staticmethod
    def extract_main_research_areas(profiles: dict, teams: list) -> dict:

        logger.info("Extracting main research areas for teams")
        team_research_areas = {}
        for team_id, members in enumerate(teams):
            research_fields = []
            member_fields = {}
            for member in members:
                member_fields[member] = profiles[member]
                research_fields.extend(profiles[member])
            # Use Counter to get the top 5 most common fields
            most_common_fields = [field for field, _ in Counter(research_fields).most_common(5)]
            team_research_areas[team_id] = {
                "team_fields": most_common_fields,
                "member_fields": member_fields
            }
        logger.debug(f"Team research areas: {team_research_areas}")
        return team_research_areas

    @staticmethod
    def create_teams(profiles_data: dict, max_team_size: int = 4) -> list[dict]:
        if not profiles_data:
            raise InvalidInputError("No data provided")

        # profiles_data is now a map: { email: { name, email, research_topics: [...] } }
        profiles = {
            profile["name"]: profile["research_topics"]
            for profile in profiles_data.values()
            if "name" in profile and "research_topics" in profile
        }

        # Form teams
        teams = TeamService.form_teams(profiles, max_team_size=max_team_size)

        # Extract research areas
        team_research_areas = TeamService.extract_main_research_areas(profiles, teams)

        # Structure the output
        output = []
        for team_id, members in enumerate(teams):
            team_data = {
                "team_id": team_id + 1,
                "team_size": len(members),
                "members": members,
                "team_research_areas": team_research_areas[team_id]["team_fields"],
                "member_fields": team_research_areas[team_id]["member_fields"],
            }
            output.append(team_data)

        return output

    
    @staticmethod
    def create_teams_from_room(data):
        room_id = data.get("RoomID")
        if not room_id:
            return error_response("Room ID is required", 400)

        try:
            # Step 1: Fetch room item
            response = get_room_by_id(room_id)
            room_item = response.get("Item")

            if not room_item:
                return error_response("Room not found", 404)

            extracted_profiles = room_item.get("extracted_keywords", {})

            if not extracted_profiles:
                return error_response("No extracted keywords found for this room", 400)

            # Step 2: Use service to create teams
            teams = TeamService.create_teams(extracted_profiles)

            # Step 3: Update room with new teams
            update_room_item(
                room_id=room_id,
                update_expression="SET teams = :teams",
                expression_attr_values={":teams": teams}
            )

            return success_response({
                "message": "Teams created successfully",
                "teams": teams
            })

        except ClientError as e:
            return error_response(str(e), 500)
        except InvalidInputError as ie:
            return error_response(str(ie), 400)
        except Exception as e:
            return error_response(str(e), 500)
