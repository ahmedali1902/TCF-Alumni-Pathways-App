import os
from datetime import timedelta

from dotenv import load_dotenv
from flask_jwt_extended import create_access_token

from ..extensions import bcrypt
from ..models.user_model import UserRole

load_dotenv()
JWT_ADMIN_EXPIRATION_DAYS = int(os.getenv("JWT_ADMIN_EXPIRATION_DAYS", 7))


def hash_password(password):
    return bcrypt.generate_password_hash(password).decode("utf-8")


def check_password(password, hashed):
    return bcrypt.check_password_hash(hashed, password)


def create_jwt(identity, role, email=None, device_id=None):
    if role == UserRole.ADMIN:
        claims = {"role": role, "email": email, "device_id": None}
        return create_access_token(
            identity=identity,
            additional_claims=claims,
            expires_delta=timedelta(days=JWT_ADMIN_EXPIRATION_DAYS),
        )

    elif role == UserRole.USER:
        claims = {"role": role, "device_id": device_id, "email": None}
        return create_access_token(
            identity=identity, additional_claims=claims, expires_delta=None
        )


def check_if_admin(jwt_claims):
    if jwt_claims["role"] == UserRole.ADMIN:
        return True
    return False
