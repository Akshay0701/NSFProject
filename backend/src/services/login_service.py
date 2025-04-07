import boto3
import hmac
import hashlib
import base64
import os
from dotenv import load_dotenv
from src.utils.response_utils import success_response, error_response

load_dotenv()

# Cognito Config from environment
CLIENT_ID = os.getenv("COGNITO_CLIENT_ID")
CLIENT_SECRET = os.getenv("COGNITO_CLIENT_SECRET")

# Initialize Boto3 client
cognito_client = boto3.client("cognito-idp", region_name="us-east-2")

def get_secret_hash(username, client_id, client_secret):
    message = username + client_id
    dig = hmac.new(
        client_secret.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256
    ).digest()
    return base64.b64encode(dig).decode()

def login_user(data):
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return error_response("Email and password are required", 400)

    try:
        response = cognito_client.initiate_auth(
            ClientId=CLIENT_ID,
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters={
                "USERNAME": email,
                "PASSWORD": password,
                "SECRET_HASH": get_secret_hash(email, CLIENT_ID, CLIENT_SECRET)
            },
        )

        return success_response({
            "message": "Login successful",
            "tokens": response["AuthenticationResult"]
        }, 200)

    except cognito_client.exceptions.NotAuthorizedException:
        return error_response("Invalid credentials", 401)

    except cognito_client.exceptions.UserNotFoundException:
        return error_response("User does not exist", 404)

    except Exception as e:
        return error_response(str(e), 500)
