import logging
from flask import Flask
from flask_cors import CORS
from src.config import Config 
from src.routes.auth_routes import auth_bp 
from src.routes.room_routes import room_bp  
from src.routes.computing_routes import compute_bp

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Configure CORS
    CORS(app, origins=Config.CORS_ORIGINS)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(room_bp)
    app.register_blueprint(compute_bp)

    logger.info("Flask app initialized successfully")
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(
        debug=Config.DEBUG,
        host=Config.HOST,
        port=Config.PORT
    )
