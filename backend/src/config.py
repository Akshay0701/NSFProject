import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    DEBUG = os.getenv("FLASK_DEBUG", "False").lower() == "true"
    PORT = int(os.getenv("FLASK_PORT", 8001))
    HOST = os.getenv("FLASK_HOST", "0.0.0.0")
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")