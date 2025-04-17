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
    
def refresh_login(data):
    refresh_token = data.get("refresh_token")
    email = data.get("email")

    if not refresh_token or not email:
        return error_response("Refresh token and email are required", 400)

    try:
        response = cognito_client.initiate_auth(
            ClientId=CLIENT_ID,
            AuthFlow="REFRESH_TOKEN_AUTH",
            AuthParameters={
                "REFRESH_TOKEN": refresh_token,
                "SECRET_HASH": get_secret_hash(email, CLIENT_ID, CLIENT_SECRET)
            },
        )

        return success_response({
            "message": "Token refreshed successfully",
            "tokens": response["AuthenticationResult"]
        }, 200)

    except cognito_client.exceptions.NotAuthorizedException:
        return error_response("Invalid refresh token", 401)

    except Exception as e:
        return error_response(f"Failed to refresh token: {str(e)}", 500)


def initiate_forgot_password(data):
    """
    Initiates the forgot password flow for a user.
    Sends a confirmation code via the configured method (e.g., email).
    """
    email = data.get("email")

    if not email:
        return error_response("Email is required", 400)

    try:
        # Calculate SecretHash (required if your app client has a secret)
        secret_hash = get_secret_hash(email, CLIENT_ID, CLIENT_SECRET)

        response = cognito_client.forgot_password(
            ClientId=CLIENT_ID,
            SecretHash=secret_hash,
            Username=email
        )

        return success_response({
            "message": "Password reset code sent successfully. Check your delivery method (e.g., email)."
        }, 200)

    except cognito_client.exceptions.UserNotFoundException:
        return error_response("User does not exist", 404)

    except cognito_client.exceptions.InvalidParameterException as e:
        return error_response(f"Invalid parameter: {str(e)}", 400)

    except cognito_client.exceptions.LimitExceededException:
        return error_response("Attempt limit exceeded, please try again later.", 429)

    except cognito_client.exceptions.ResourceNotFoundException:
         return error_response("Cognito client configuration error.", 500)

    except Exception as e:
        print(f"Error initiating forgot password: {e}")
        return error_response("An error occurred while initiating the password reset.", 500)
    

def confirm_reset_password(data):
    """
    Confirms the forgot password flow using the confirmation code
    and sets the new password for the user.
    """
    email = data.get("email")
    confirmation_code = data.get("confirmation_code")
    new_password = data.get("new_password")

    if not email or not confirmation_code or not new_password:
        return error_response("Email, confirmation code, and new password are required", 400)

    try:
        # Calculate SecretHash
        secret_hash = get_secret_hash(email, CLIENT_ID, CLIENT_SECRET)

        response = cognito_client.confirm_forgot_password(
            ClientId=CLIENT_ID,
            SecretHash=secret_hash,
            Username=email,
            ConfirmationCode=confirmation_code,
            Password=new_password
        )

        # Password has been successfully reset.
        return success_response({
            "message": "Password has been successfully reset."
        }, 200)

    except cognito_client.exceptions.UserNotFoundException:
        return error_response("User does not exist", 404)

    except cognito_client.exceptions.CodeMismatchException:
        return error_response("Invalid confirmation code", 400)

    except cognito_client.exceptions.ExpiredCodeException:
        return error_response("Confirmation code has expired", 400)

    except cognito_client.exceptions.InvalidPasswordException as e:
        return error_response(f"New password does not meet policy requirements: {str(e)}", 400)

    except cognito_client.exceptions.InvalidParameterException as e:
        return error_response(f"Invalid parameter: {str(e)}", 400)

    except cognito_client.exceptions.LimitExceededException:
        return error_response("Attempt limit exceeded, please try again later.", 429)

    except cognito_client.exceptions.ResourceNotFoundException:
         return error_response("Cognito client configuration error.", 500)

    except Exception as e:
        # Log the exception for debugging
        print(f"Error confirming forgot password: {e}")
        return error_response("An error occurred while resetting the password.", 500)