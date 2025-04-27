from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_pymongo import PyMongo

bcrypt = Bcrypt()
cors = CORS()
jwt = JWTManager()
mongo = PyMongo()