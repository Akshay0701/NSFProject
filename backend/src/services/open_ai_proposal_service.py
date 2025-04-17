import os
import openai
from dotenv import load_dotenv
from flask import jsonify
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.exceptions import OutputParserException
from src.utils.response_utils import error_response, success_response
from src.database.database import get_room_by_id, update_room_item
from aiohttp import ClientError

load_dotenv()

class NSFProjectOpenAIChain:
    def __init__(self):
        openai.api_key = os.environ.get("OPENAI_API_KEY")
        self.chat = ChatOpenAI(
            temperature=0.2,
            model="gpt-4o-mini",  # Use GPT-4o or 'gpt-4o-mini' if available in LangChain/OpenAI account
            openai_api_key=openai.api_key
        )

    def generate_project_proposals(self, team):
        team_info = (
            f"Members: {', '.join(team.get('members', []))}. "
            f"Research Areas: {', '.join(team.get('team_research_areas', []))}. "
            f"Member Details: {team.get('member_fields', {})}"
        )

        prompt_template = """
        You are a research assistant with expertise in generating technical research proposals.

        ### TEAM PROFILE
        The team has the following members and expertise:
        {team_info}

        ### TASK
        Generate 5 unique and technically detailed research project abstracts suitable for NSF-style proposals. 
        Each abstract should:
        - Be 10-12 sentences long.
        - Clearly define the **research problem**, **technical approach**, **objectives**, and **potential scientific or societal impact**.
        - Be relevant to the research interests and expertise of the team.
        - Use professional and academic language.

        ### FORMAT
        Respond strictly in **valid JSON format**, without markdown or extra commentary. Follow this schema:
        {{
        "project_proposals": [
            "Abstract 1",
            "Abstract 2",
            "Abstract 3"
        ]
        }}
        """

        prompt = PromptTemplate.from_template(prompt_template)
        chain = prompt | self.chat

        try:
            response = chain.invoke({"team_info": team_info})
            json_parser = JsonOutputParser()
            result = json_parser.parse(response.content)
        except OutputParserException:
            raise OutputParserException("Unable to parse project proposals from OpenAI response.")

        return result.get("project_proposals", [])

    def generate_proposals(self, teams: list) -> list:
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
            response = get_room_by_id(room_id)
            room_item = response.get("Item")

            if not room_item:
                return error_response("Room not found", 404)

            teams = room_item.get("teams", [])
            if not teams:
                return error_response("No teams available to generate proposals", 400)

            updated_teams = self.generate_proposals(teams)

            update_room_item(
                room_id=room_id,
                update_expression="SET teams = :teams",
                expression_attr_values={":teams": updated_teams}
            )

            return success_response({
                "message": "Proposals generated successfully using OpenAI GPT-4o",
                "teams": updated_teams
            }, 200)

        except ClientError as e:
            return error_response(str(e), 500)
        except Exception as e:
            return error_response(str(e), 500)
