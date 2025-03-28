import logging
from flask import Flask
from flask_cors import CORS
from src.config import Config  # Corrected import
from src.routes.nsf_routes import nsf_bp  # Corrected import


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
    CORS(app)

    # Register blueprints
    app.register_blueprint(nsf_bp)

    logger.info("Flask app initialized successfully")
    return app

app = create_app()

if __name__ == "__main__":
    app.run(
        debug=Config.DEBUG,
        host=Config.HOST,
        port=Config.PORT
    )
    