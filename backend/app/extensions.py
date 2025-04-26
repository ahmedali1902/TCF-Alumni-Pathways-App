from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_pymongo import PyMongo

cors = CORS()
jwt = JWTManager()
mongo = PyMongo()