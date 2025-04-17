import uuid
from botocore.exceptions import ClientError
from src.utils.response_utils import error_response, success_response
from src.database.database import (
    get_room_by_id,
    get_rooms_by_member_email,
    put_room_item,
    update_room_item,
    delete_room_by_id,
    scan_rooms_by_creator,
    add_room_to_creator
)

import uuid

def create_room(data):
    creator_id = data.get("creator_id")
    room_id = data.get("RoomID") or str(uuid.uuid4())  # Generate if not provided

    if not creator_id:
        return error_response("Creator ID not found", 404)

    try:
        # Check if roomID already exists (only if passed manually)
        if data.get("RoomID"):  # only check if client provided it
            response = get_room_by_id(room_id)
            if "Item" in response:
                return error_response("Room ID is already taken", 409)

        put_room_item({
            "RoomID": room_id,
            "creatorID": creator_id,
            "profiles": {}
        })

        return success_response({"message": "Room created successfully", "RoomID": room_id}, 201)

    except ClientError as e:
        return error_response(str(e), 500)


def get_room_data(room_id):
    try:
        response = get_room_by_id(room_id)
        if "Item" not in response:
            return error_response("Room not found", 404)
        return success_response(response["Item"])

    except ClientError as e:
        return error_response(str(e), 500)

def get_added_room_data(data):
    email = data.get('email')
    if not email:
        return error_response("Creator ID not found", 404)

    try:
        room_ids = get_rooms_by_member_email(email)
        room_data_list = []

        for room_id in room_ids:
            response = get_room_by_id(room_id)
            if "Item" in response:
                room_data_list.append(response["Item"])

        return success_response({"rooms": room_data_list})

    except ClientError as e:
        return error_response(str(e), 500)

def add_profile_to_room(data):
    room_id = data.get("RoomID")
    name = data.get("name")
    email = data.get("email")
    description = data.get("description")

    if not all([room_id, name, email, description]):
        return error_response("Missing required fields", 400)

    try:
        add_room_to_creator(email, room_id)

        update_response = update_room_item(
            room_id,
            "SET profiles.#email = :profile",
            {
                ":profile": {"name": name, "email": email, "description": description}
            },
            {"#email": email}
        )
        return success_response({
            "message": "Profile added successfully",
            "updated": update_response.get("Attributes")
        })

    except ClientError as e:
        return error_response(str(e), 500)


def remove_profile_from_room(data):
    room_id = data.get("RoomID")
    email_to_remove = data.get("email")
    sender_email = data.get("sender_email")

    if not all([room_id, email_to_remove, sender_email]):
        return error_response("Missing RoomID, email, or sender_email", 400)

    try:
        room_item = get_room_by_id(room_id).get("Item")
        if not room_item:
            return error_response("Room not found", 404)

        if room_item.get("creatorID") != sender_email:
            return error_response("Only the room creator can remove profiles", 403)

        update_response = update_room_item(
            room_id,
            "REMOVE profiles.#email",
            {},  # No ExpressionAttributeValues needed for REMOVE
            {"#email": email_to_remove}
        )

        return success_response({
            "message": "Profile removed successfully",
            "updated": update_response.get("Attributes")
        })

    except ClientError as e:
        return error_response(str(e), 500)


def get_rooms_by_email(email):
    if not email:
        return error_response("Email is required", 400)

    try:
        response = scan_rooms_by_creator(email)
        rooms = response.get("Items", [])
        return success_response({"rooms": rooms})

    except ClientError as e:
        return error_response(str(e), 500)


def remove_room(data):
    room_id = data.get("RoomID")
    email = data.get("email")

    if not all([room_id, email]):
        return error_response("Missing RoomID or email", 400)

    try:
        room = get_room_by_id(room_id).get("Item")
        if not room:
            return error_response("Room not found", 404)

        if room.get("creatorID") != email:
            return error_response("Unauthorized: Only the creator can delete the room", 403)

        delete_room_by_id(room_id)

        return success_response({"message": "Room deleted successfully"})

    except ClientError as e:
        return error_response(str(e), 500)


def get_teams_data(data):
    room_id = data.get("RoomID")
    if not room_id:
        return error_response("RoomID is required", 400)

    try:
        room = get_room_by_id(room_id).get("Item")
        if not room:
            return error_response("Room not found", 404)

        return success_response(room.get("teams", []))

    except ClientError as e:
        return error_response(str(e), 500)

def save_funded_projects_data(data):
    try:
        room_id = data.get("RoomID")
        projects = data.get("projects")

        if not room_id or not isinstance(projects, list):
            return error_response("room_id and projects list are required", 400)

        # Convert the list of projects into a dictionary with abstract as keys
        funded_map = {}
        for idx, projAbstract in enumerate(projects):
            abstract = projAbstract
            if abstract:
                key = f"project_{idx+1}"
                funded_map[key] = abstract

        # Update the room's funded_project field in DynamoDB
        update_room_item(
            room_id=room_id,
            update_expression="SET funded_projects = :data",
            expression_attr_values={":data": funded_map}
        )

        return success_response({
            "message": f"{len(funded_map)} funded projects saved for room {room_id}.",
            "funded_projects": funded_map
        })

    except Exception as e:
        import traceback
        print("Exception in save_funded_projects:", traceback.format_exc())
        return error_response("Server error: " + str(e), 500)
    
def get_funded_projects_data(data):
    try:
        room_id = data.get("RoomID")

        if not room_id:
            return error_response("room_id is required", 400)

        # Fetch room data
        result = get_room_by_id(room_id)
        if "Item" not in result:
            return error_response("Room not found", 404)

        room_data = result["Item"]
        funded_projects_map = room_data.get("funded_projects", {})

        return success_response({
            "room_id": room_id,
            "projects": funded_projects_map
        })

    except Exception as e:
        import traceback
        print("Exception in get_funded_projects:", traceback.format_exc())
        return error_response(str(e), 500)


    
