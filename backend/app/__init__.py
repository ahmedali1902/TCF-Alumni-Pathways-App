import logging

from flask import Flask

from .config import config_by_name
from .extensions import bcrypt, cors, jwt, mongo
from .routes import register_routes

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


def create_app(env_name):
    app = Flask(__name__)
    app.config.from_object(config_by_name[env_name])

    bcrypt.init_app(app)
    cors.init_app(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
    jwt.init_app(app)
    mongo.init_app(app)

    with app.app_context():
        from flask import Blueprint

        api_bp = Blueprint("api", __name__, url_prefix="/api")
        register_routes(api_bp)
        app.register_blueprint(api_bp)

    logger.info(f"Flask app created and configured with environment: {env_name}")
    return app
