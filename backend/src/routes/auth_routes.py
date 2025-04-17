from flask import Blueprint, json, request
from src.services.room_service import create_room
from src.services.login_service import confirm_reset_password, initiate_forgot_password, login_user, refresh_login
from src.services.register_service import register_user
from src.services.research_service import ResearchService
from src.services.team_service import TeamService
from src.services.proposal_service import NSFProjectChain  # Updated import
from src.utils.response_utils import success_response, error_response
from src.exceptions.custom_exceptions import APIException

auth_bp = Blueprint("nsf/auth", __name__, url_prefix="/nsf/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    return register_user(data)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    return login_user(data)

@auth_bp.route("/refresh-login", methods=["POST"])
def refreshLogin():
    data = request.json
    return refresh_login(data)

@auth_bp.route('/forgot-password', methods=['POST'])
def handle_forgot_password():
    """
    API endpoint to initiate the forgot password flow.
    Expects JSON: {"email": "user@example.com"}
    """
    data = request.get_json()
    return initiate_forgot_password(data)

@auth_bp.route('/reset-password', methods=['POST'])
def handle_reset_password():
    """
    API endpoint to confirm the password reset.
    Expects JSON: {
        "email": "user@example.com",
        "confirmation_code": "123456",
        "new_password": "YourNewSecurePassword123!"
    }
    """
    data = request.get_json()
    return confirm_reset_password(data)