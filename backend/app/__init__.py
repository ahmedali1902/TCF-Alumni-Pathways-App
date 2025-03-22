from flask import Flask
from flask_cors import CORS
from app.utils.db import init_db
# from app.routes import register_routes
import os

def create_app():
    app = Flask(__name__)

    # Load configuration
    app.config.from_pyfile('config.py')

    # Initialize database
    init_db(app)

    # Enable CORS
    CORS(app)

    # Register routes
    # register_routes(app)

    return app
