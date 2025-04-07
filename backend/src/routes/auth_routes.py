from flask import Blueprint, json, request
from src.services.room_service import create_room
from src.services.login_service import login_user
from src.services.register_service import register_user
from src.services.research_service import ResearchService
from src.services.team_service import TeamService
from src.services.proposal_service import NSFProjectChain  # Updated import
from src.utils.response_utils import success_response, error_response
from src.exceptions.custom_exceptions import APIException

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    return register_user(data)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    return login_user(data)