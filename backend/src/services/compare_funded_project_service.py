# compare_similarity.py
import re
import torch
from sentence_transformers import SentenceTransformer, util
from decimal import Decimal
from src.database.database import get_room_by_id, update_room_item
from src.utils.response_utils import error_response, success_response

class CompareSimilarity:
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        print("Loading model...")
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.model = SentenceTransformer(model_name)
        print("Model loaded.")

    def preprocess_text(self, text):
        if not isinstance(text, str):
            return ""
        text = re.sub('<br\s*/?>', ' ', text)
        text = re.sub('<[^>]+>', '', text)
        text = text.lower()
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def compute_similarity(self, funded_projects, proposals):
        results = []

        funded_ids = list(funded_projects.keys())
        funded_texts = [self.preprocess_text(funded_projects[pid]) for pid in funded_ids]

        valid_indices = [i for i, text in enumerate(funded_texts) if text]
        if not valid_indices:
            return [{"proposal": p, "max_similarity_score": 0.0, "most_similar_project_id": None} for p in proposals]

        valid_texts = [funded_texts[i] for i in valid_indices]
        valid_ids = [funded_ids[i] for i in valid_indices]
        funded_embeddings = self.model.encode(valid_texts, convert_to_tensor=True, device=self.device)

        for proposal_text in proposals:
            cleaned = self.preprocess_text(proposal_text)
            if not cleaned:
                results.append({"proposal": proposal_text, "max_similarity_score": 0.0, "most_similar_project_id": None})
                continue

            emb = self.model.encode(cleaned, convert_to_tensor=True, device=self.device)
            scores = util.cos_sim(emb, funded_embeddings)[0]
            max_score_tensor, max_idx_tensor = torch.max(scores, dim=0)
            max_score = Decimal(str(max_score_tensor.item())) 
            max_idx = max_idx_tensor.item()

            results.append({
                "proposal": proposal_text,
                "max_similarity_score": max_score,
                "most_similar_project_id": valid_ids[max_idx]
            })
        return results
    
    @staticmethod
    def compare_similarity_teams_project(data):
        try:
            room_id = data.get("RoomID")

            if not room_id:
                return error_response("RoomID is required", 400)

            room_data = get_room_by_id(room_id)
            if "Item" not in room_data:
                return error_response("Room not found", 404)

            item = room_data["Item"]
            funded_projects = item.get("funded_projects", {})
            teams = item.get("teams", [])

            if not funded_projects:
                return error_response("There is no funded projects to compare", 400)

            updated_teams = []

            similarity_engine = CompareSimilarity()

            for team in teams:
                proposals = team.get("project_proposals", [])
                if not isinstance(proposals, list):
                    proposals = [proposals]  # handle single string case

                results = similarity_engine.compute_similarity(funded_projects, proposals)

                team["similarity_project_score"] = results
                updated_teams.append(team)

            # Save updated team data
            update_room_item(
                room_id=room_id,
                update_expression="SET teams = :teams",
                expression_attr_values={":teams": updated_teams}
            )

            return success_response({
                "message": f"Similarity scores computed and saved for room {room_id}.",
                "teams_updated": updated_teams
            })

        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return error_response("Internal server error: " + str(e), 500)
