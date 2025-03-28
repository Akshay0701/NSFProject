from flask import Blueprint, json, request
from src.services.research_service import ResearchService
from src.services.team_service import TeamService
from src.services.proposal_service import NSFProjectChain  # Updated import
from src.utils.response_utils import success_response, error_response
from src.exceptions.custom_exceptions import APIException

nsf_bp = Blueprint("nsf", __name__, url_prefix="/nsf")

@nsf_bp.route("/extract_interests", methods=["POST"])
def extract_interests():
    """Extract research interests from profiles with either text or PDF input."""
    try:
        profiles_data = request.form.get("profiles")
        if not profiles_data:
            return error_response("No profiles data provided", 400)

        try:
            profiles_data = json.loads(profiles_data)
        except json.JSONDecodeError:
            return error_response("Invalid JSON in profiles field", 400)

        results = ResearchService.extract_interests_from_profiles(profiles_data, request.files)
        return success_response(results)

    except APIException as e:
        return error_response(e.message, e.status_code)
    except Exception as e:
        return error_response(f"Internal server error: {str(e)}", 500)

@nsf_bp.route("/teamcreation", methods=["POST"])
def teamcreation():
    """Create teams from a list of researchers based on their research topics."""
    try:
        data = request.get_json()
        teams = TeamService.create_teams(data)
        return success_response(teams)

    except APIException as e:
        return error_response(e.message, e.status_code)
    except Exception as e:
        return error_response(f"Internal server error: {str(e)}", 500)

@nsf_bp.route("/generate-proposals", methods=["POST"])
def generate_proposals():
    """Generate project proposals for teams."""
    try:
        teams = request.get_json()
        nsf_chain = NSFProjectChain()  # Updated to use NSFProjectChain directly
        updated_teams = nsf_chain.generate_proposals(teams)
        return success_response(updated_teams)

    except APIException as e:
        return error_response(e.message, e.status_code)
    except Exception as e:
        return error_response(f"Internal server error: {str(e)}", 500)