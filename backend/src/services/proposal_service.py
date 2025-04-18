import os
from aiohttp import ClientError
import boto3
from dotenv import load_dotenv
from flask import jsonify
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.exceptions import OutputParserException
from src.utils.response_utils import error_response, success_response
from src.database.database import get_room_by_id, update_room_item

load_dotenv()

class NSFProjectChain:
    def __init__(self, excel_path='AwardsMRSEC.xls'):
        self.chat = ChatGroq(
            temperature=0,
            groq_api_key= os.environ.get("GROQ_API_KEY"),
            model_name="llama-3.3-70b-versatile"
        )
        self.excel_path = excel_path
        self.existing_abstracts = self._load_existing_abstracts()
        self.vectorizer = TfidfVectorizer(stop_words='english')

    def _load_existing_abstracts(self):
        try:
            df = pd.read_excel(self.excel_path)
            if 'Abstract' not in df.columns:
                raise ValueError("Excel file must contain 'abstract' column")
            return df['Abstract'].tolist()
        except FileNotFoundError:
            print(f"Warning: Excel file {self.excel_path} not found.")
            return []
        except Exception as e:
            print(f"Error loading Excel file: {e}")
            return []

    def _calculate_similarity(self, new_abstracts):
        if not self.existing_abstracts:
            return {abstract: 0 for abstract in new_abstracts}
        
        # Combine existing and new abstracts
        all_texts = self.existing_abstracts + new_abstracts
        
        # Create TF-IDF matrix
        tfidf_matrix = self.vectorizer.fit_transform(all_texts)
        
        # Split matrix into existing and new
        existing_matrix = tfidf_matrix[:len(self.existing_abstracts)]
        new_matrix = tfidf_matrix[len(self.existing_abstracts):]
        
        # Calculate cosine similarity
        similarity_scores = cosine_similarity(new_matrix, existing_matrix)
        
        # Get maximum similarity for each new abstract
        max_similarities = similarity_scores.max(axis=1)
        return dict(zip(new_abstracts, max_similarities))

    def generate_project_proposals(self, team):
        team_info = (
            f"Members: {', '.join(team.get('members', []))}. "
            f"Research Areas: {', '.join(team.get('team_research_areas', []))}. "
            f"Member Details: {team.get('member_fields', {})}"
        )

        # Create a prompt template to request 5 NSF project abstract recommendations.
        prompt_template = """
        ### TEAM MEMBER PROFILE AND RESEARCH INTERESTS:
        {team_info}
        
        ### INSTRUCTION:
        Generate 5 detailed project abstract recommendations for an research project proposal based on the team's profiles and research interests.
        Each project abstract should be at least 3 sentences long, outlining the project scope, objectives, and potential impact.
        
        Return the output in valid JSON format with a single key "project_proposals" mapping to a list of 5 abstract strings.
        Only return valid JSON without extra text.
        """

        prompt = PromptTemplate.from_template(prompt_template)
        chain = prompt | self.chat

        response = chain.invoke(input={"team_info": team_info})
        try:
            json_parser = JsonOutputParser()
            result = json_parser.parse(response.content)
        except OutputParserException:
            raise OutputParserException("Unable to parse project proposals from Groq response.")
        
        proposals = result.get("project_proposals", [])
        
        if proposals:
            similarity_scores = self._calculate_similarity(proposals)
            # Sort by least similar first (ascending order)
            sorted_proposals = sorted(proposals, key=lambda x: similarity_scores[x])
            return sorted_proposals
        
        return proposals

    def generate_proposals(self, teams: list) -> list:
        """
        Generate project proposals for teams.

        Args:
            teams (list): List of team dictionaries.

        Returns:
            list: Updated teams list with project proposals.
        """
        if not teams:
            raise ValueError("No teams data provided")

        for team in teams:
            try:
                proposals = self.generate_project_proposals(team)
                team["project_proposals"] = proposals
            except Exception as e:
                print(f"Error generating proposals for team {team.get('team_id')}: {str(e)}")
                team["project_proposals"] = [f"Error generating proposals: {str(e)}"]

        return teams
    
    def generate_proposals_for_room(self, data):
        room_id = data.get("RoomID")
        if not room_id:
            return error_response("Room ID is required", 400)

        try:
            # Step 1: Fetch room data
            response = get_room_by_id(room_id)
            room_item = response.get("Item")

            if not room_item:
                return error_response("Room not found", 404)

            teams = room_item.get("teams", [])
            if not teams:
                return error_response("No teams available to generate proposals", 400)

            # Step 2: Generate proposals using NSFProjectChain
            updated_teams = self.generate_proposals(teams)

            # Step 3: Update teams in the database
            update_room_item(
                room_id=room_id,
                update_expression="SET teams = :teams",
                expression_attr_values={":teams": updated_teams}
            )

            return success_response({
                "message": "Proposals generated successfully",
                "teams": updated_teams
            }, 200)

        except ClientError as e:
            return error_response(str(e), 500)
        except Exception as e:
            return error_response(str(e), 500)
        
    def generate_proposal_for_single_team(self, data):
        room_id = data.get("RoomID")
        team_index = data.get("team_index")  # expecting int like 0, 1, 2...

        if room_id is None or team_index is None:
            return error_response("RoomID and team_index are required", 400)

        try:
            # Step 1: Load room data
            response = get_room_by_id(room_id)
            room_item = response.get("Item")

            if not room_item:
                return error_response("Room not found", 404)

            teams = room_item.get("teams", [])
            if not (0 <= team_index < len(teams)):
                return error_response("Invalid team index", 400)

            # Step 2: Generate proposal for the selected team
            team = teams[team_index]
            try:
                proposals = self.generate_project_proposals(team)
                teams[team_index]["project_proposals"] = proposals
            except Exception as e:
                return error_response(f"Failed to generate proposals for team {team_index}: {str(e)}", 500)

            # Step 3: Update that team in DB
            update_room_item(
                room_id=room_id,
                update_expression="SET teams = :teams",
                expression_attr_values={":teams": teams}
            )

            return success_response({
                "message": f"Proposals generated for team index {team_index}",
                "team": teams[team_index]
            }, 200)

        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return error_response(f"Internal server error: {str(e)}", 500)