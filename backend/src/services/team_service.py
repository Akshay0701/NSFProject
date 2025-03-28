import logging
import numpy as np
import scipy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from collections import Counter
from src.exceptions.custom_exceptions import InvalidInputError

logger = logging.getLogger(__name__)

class TeamService:
    @staticmethod
    def preprocess_research_interests(profiles: dict) -> tuple[list, list]:
        """
        Converts lists of research interests into text strings suitable for vectorization.

        Args:
            profiles (dict): Dictionary with researcher names as keys and research topics as values.

        Returns:
            tuple: List of profile names and list of research texts.
        """
        logger.info("Preprocessing research interests")
        profile_names = list(profiles.keys())
        research_texts = [" ".join(interests) for interests in profiles.values()]
        return profile_names, research_texts

    @staticmethod
    def vectorize_texts(texts: list) -> "scipy.sparse.csr_matrix":
        """
        Converts research interest texts into TF-IDF vectors.

        Args:
            texts (list): List of research interest strings.

        Returns:
            scipy.sparse.csr_matrix: TF-IDF vectorized representation of the texts.
        """
        logger.info("Vectorizing research interest texts")
        vectorizer = TfidfVectorizer()
        vectors = vectorizer.fit_transform(texts)
        return vectors

    @staticmethod
    def determine_optimal_clusters(vectors: "scipy.sparse.csr_matrix", max_team_size: int = 4) -> int:
        """
        Determines the optimal number of clusters using silhouette scores.

        Args:
            vectors (scipy.sparse.csr_matrix): Vectorized research interests.
            max_team_size (int): Maximum number of members per team (default is 4).

        Returns:
            int: Optimal number of clusters.
        """
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
        """
        Forms teams by clustering researchers based on their research interests.

        Args:
            profiles (dict): Dictionary with researcher names as keys and research topics as values.
            max_team_size (int): Maximum number of members per team (default is 4).

        Returns:
            list: List of teams, where each team is a list of member names.
        """
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
        """
        Extracts the main research areas for each team and lists member fields.

        Args:
            profiles (dict): Dictionary with researcher names as keys and research topics as values.
            teams (list): List of teams, where each team is a list of member names.

        Returns:
            dict: Dictionary with team IDs as keys and research area details as values.
        """
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
    def create_teams(profiles_data: list, max_team_size: int = 4) -> list[dict]:
        """
        Create teams from a list of researchers based on their research topics.

        Args:
            profiles_data (list): List of dictionaries with 'name' and 'research_topics' keys.
            max_team_size (int): Maximum number of members per team (default is 4).

        Returns:
            list[dict]: List of team dictionaries with team details.

        Raises:
            InvalidInputError: If profiles data is missing or invalid.
        """
        if not profiles_data:
            raise InvalidInputError("No data provided")

        # Convert input list to dictionary
        profiles = {profile["name"]: profile["research_topics"] for profile in profiles_data}

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