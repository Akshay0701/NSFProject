import os
import boto3
import hmac
import hashlib
import base64
from dotenv import load_dotenv
from flask import jsonify
from src.services.login_service import login_user
from src.utils.response_utils import success_response, error_response

load_dotenv()

# AWS Cognito configuration
USER_POOL_ID = os.getenv("USER_POOL_ID")
CLIENT_ID = os.getenv("COGNITO_CLIENT_ID")
CLIENT_SECRET = os.getenv("COGNITO_CLIENT_SECRET")

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

# Initialize the Cognito client
cognito_client = boto3.client(
    "cognito-idp",
    region_name="us-east-2",
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY
)

def get_secret_hash(username, client_id, client_secret):
    message = username + client_id
    dig = hmac.new(
        client_secret.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256
    ).digest()
    return base64.b64encode(dig).decode()

def register_user(data):
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return error_response("Email and password are required", 400)

    try:
        # Step 1: Sign up the user
        cognito_client.sign_up(
            ClientId=CLIENT_ID,
            SecretHash=get_secret_hash(email, CLIENT_ID, CLIENT_SECRET),
            Username=email,
            Password=password,
            UserAttributes=[
                {"Name": "email", "Value": email}
            ],
        )

        # Step 2: Automatically log the user in after registration
        return login_user({"email": email, "password": password})

    except cognito_client.exceptions.UsernameExistsException:
        return error_response("User already exists", 400)

    except Exception as e:
        import traceback
        print("Exception during registration:", traceback.format_exc())
        return error_response(str(e), 500)
