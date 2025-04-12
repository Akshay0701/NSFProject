import os
import boto3
from dotenv import load_dotenv
from botocore.exceptions import ClientError

load_dotenv()

# Initialize the DynamoDB resource
dynamodb = boto3.resource(
    'dynamodb',
    region_name='us-east-2',
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

# Get the Room database table
room_table = dynamodb.Table('Roomdatabase')
room_members = dynamodb.Table('RoomMembers')

def get_room_by_id(room_id):
    return room_table.get_item(Key={"RoomID": room_id})

def put_room_item(item):
    return room_table.put_item(Item=item)

def update_room_item(room_id, update_expression, expression_attr_values=None, expression_attr_names=None):
    params = {
        "Key": {"RoomID": room_id},
        "UpdateExpression": update_expression,
        "ReturnValues": "UPDATED_NEW"
    }
    if expression_attr_values:
        params["ExpressionAttributeValues"] = expression_attr_values
    if expression_attr_names:
        params["ExpressionAttributeNames"] = expression_attr_names
    return room_table.update_item(**params)

def delete_room_by_id(room_id):
    return room_table.delete_item(Key={"RoomID": room_id})

def scan_rooms_by_creator(creator_email):
    return room_table.scan(
        FilterExpression='creatorID = :emailVal',
        ExpressionAttributeValues={':emailVal': creator_email}
    )

def add_room_to_creator(creator_email, room_id):
    # Fetch existing entry
    response = room_members.get_item(Key={"email": creator_email})
    existing_rooms = response.get("Item", {}).get("rooms", [])

    # Avoid duplicates
    if room_id in existing_rooms:
        return

    updated_rooms = existing_rooms + [room_id]

    # Update the record
    return room_members.update_item(
        Key={"email": creator_email},
        UpdateExpression="SET #rooms = :updatedRooms",
        ExpressionAttributeNames={"#rooms": "rooms"},
        ExpressionAttributeValues={":updatedRooms": updated_rooms},
        ReturnValues="UPDATED_NEW"
    )
        
def get_rooms_by_member_email(email):
    response = room_members.get_item(Key={"email": email})
    return response.get("Item", {}).get("rooms", [])


