from flask import Blueprint, request, jsonify
from src.services.room_service import (
    create_room,
    get_room_data,
    add_profile_to_room,
    remove_profile_from_room,
    get_rooms_by_email,
    remove_room,
    get_teams_data,
    get_added_room_data
)

room_bp = Blueprint('nsf/room', __name__, url_prefix="/nsf/room")

@room_bp.route('/create-room', methods=['POST'])
def create_room_route():
    data = request.get_json()
    return create_room(data)

@room_bp.route('/get-added-room', methods=['POST'])
def get_added_room_data_route():
    data = request.get_json()
    return get_added_room_data(data)

@room_bp.route('/get-room/<room_id>', methods=['GET'])
def get_room_data_route(room_id):
    return get_room_data(room_id)

@room_bp.route('/add-profile', methods=['POST'])
def add_profile_route():
    data = request.get_json()
    return add_profile_to_room(data)

@room_bp.route('/remove-profile', methods=['POST'])
def remove_profile_route():
    data = request.get_json()
    return remove_profile_from_room(data)

@room_bp.route('/get-rooms-by-email', methods=['POST'])
def get_rooms_by_email_route():
    data = request.get_json()
    email = data.get("email")
    return get_rooms_by_email(email)

@room_bp.route('/remove-room', methods=['POST'])
def remove_room_route():
    data = request.get_json()
    return remove_room(data)

@room_bp.route('/get-teams', methods=['POST'])
def get_teams():
    data = request.get_json()
    return get_teams_data(data)

