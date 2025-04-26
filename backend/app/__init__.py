import logging
from flask import Flask
from .config import config_by_name
from .extensions import mongo, jwt, cors

# Initialize logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def create_app(env_name):
    # Initialize application
    app = Flask(__name__)
    app.config.from_object(config_by_name[env_name])
    # Initialize extensions
    cors.init_app(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
    jwt.init_app(app)
    mongo.init_app(app)
    logger.info(f"Flask app created and configured with environment: {env_name}")
    return app
