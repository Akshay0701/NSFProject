import os
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.exceptions import OutputParserException
from dotenv import load_dotenv

# Load environment variables (including your GROQ_API_KEY)
load_dotenv()

class NSFProjectChain:
    def __init__(self):
        # Initialize ChatGroq with your API key from the environment
        self.chat = ChatGroq(
            temperature=0,
            groq_api_key=os.getenv("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"),  # Make sure your .env has GROQ_API_KEY defined
            model_name="llama-3.3-70b-versatile"
        )

    def generate_project_proposals(self, team):
        # Build a string with team details including member names, research areas, and member fields.
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
        Generate 5 detailed project abstract recommendations for an NSF project proposal based on the team's profiles and research interests.
        Each project abstract should be at least 3 sentences long, outlining the project scope, objectives, and potential impact.
        
        Return the output in valid JSON format with a single key "project_proposals" mapping to a list of 5 abstract strings.
        Only return valid JSON without extra text.
        """
        prompt = PromptTemplate.from_template(prompt_template)
        chain = prompt | self.chat

        # Invoke the Groq model with the prompt.
        response = chain.invoke(input={"team_info": team_info})
        try:
            json_parser = JsonOutputParser()
            result = json_parser.parse(response.content)
        except OutputParserException:
            raise OutputParserException("Unable to parse project proposals from Groq response.")
        
        return result.get("project_proposals", [])
