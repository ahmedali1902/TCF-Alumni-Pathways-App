import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:
    DEBUG = False
    MONGO_URI = os.getenv('MONGO_URI')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)

config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig
}