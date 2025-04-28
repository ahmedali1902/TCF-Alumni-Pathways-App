import os
import logging
from datetime import datetime, timezone
from flask import request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required, verify_jwt_in_request
from jwt.exceptions import InvalidTokenError
from flask_jwt_extended.exceptions import JWTDecodeError
from ..extensions import mongo
from ..models.user_model import UserModel, UserRole
from ..helpers.auth_helper import hash_password, check_password, create_jwt
from ..helpers.response_helper import format_response

logger = logging.getLogger(__name__)

ADMIN_SECRET = os.getenv("ADMIN_SECRET")

def register_admin():
    try:
        data = request.get_json()
        email = data.get("email")
        name = data.get("name")
        password = data.get("password")
        admin_secret = data.get("admin_secret")

        if admin_secret != ADMIN_SECRET:
            logger.warning("Missing or invalid admin secret attempt.")
            return format_response(False, "Missing or invalid admin secret", None), 401

        if not email or not name or not password:
            return format_response(False, "Email, name, and password are required", None), 400

        user_collection = mongo.db.User
        if user_collection.find_one({"email": email, "is_deleted": False}):
            return format_response(False, f"Admin with email \"{email}\" already exists", None), 400

        user = UserModel(
            email=email,
            name=name,
            password_hash=hash_password(password),
            role=UserRole.ADMIN
        )

        user_collection.insert_one(user.to_bson())
        logger.info(f"Admin registered: {user.email}")
        return format_response(True, "Admin registered successfully", None), 201

    except Exception as e:
        logger.exception(f"Error registering admin: {e}")
        return format_response(False, "Internal server error", None), 500

def login_admin():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return format_response(False, "Email and password are required", None), 400

        user_collection = mongo.db.User
        user_data = user_collection.find_one({"email": email, "is_deleted": False})

        if not user_data or user_data.get("role") != UserRole.ADMIN:
            return format_response(False, "Admin not found", None), 404
        
        user = UserModel(**user_data)

        if not check_password(password, user.password_hash):
            logger.warning(f"Invalid password for admin: {user.email}")
            return format_response(False, "Invalid password", None), 401

        user.update(last_login=datetime.now(timezone.utc))

        token = create_jwt(str(user.id), UserRole.ADMIN, email=user.email)

        user_collection.update_one({"_id": user.id}, {"$set": user.to_bson()})

        logger.info(f"Admin logged in: {user.email}")
        return format_response(True, "Admin logged in successfully", {"token": token, "user_id": str(user.id)}), 200

    except Exception as e:
        logger.exception(f"Error logging in admin: {e}")
        return format_response(False, "Internal server error", None), 500

@jwt_required()
def update_admin_password():
    try:
        data = request.get_json()
        old_password = data.get("old_password")
        new_password = data.get("new_password")
        confirm_password = data.get("confirm_password")

        if not old_password or not new_password or not confirm_password:
            return format_response(False, "All password fields are required", None), 400

        if new_password != confirm_password:
            return format_response(False, "New passwords do not match", None), 400

        user_id = get_jwt_identity()
        user_collection = mongo.db.User
        user_data = user_collection.find_one({"_id": user_id, "is_deleted": False})

        if not user_data:
            return format_response(False, "User not found", None), 404
        
        user = UserModel(**user_data)

        if not check_password(old_password, user.password_hash):
            return format_response(False, "Old password is incorrect", None), 401

        user.update(password_hash=hash_password(new_password))

        user_collection.update_one({"_id": user.id}, {"$set": user.to_bson()})

        logger.info(f"Password updated for user: {str(user.id)}")
        return format_response(True, "Password updated successfully", None), 200

    except Exception as e:
        logger.exception(f"Error updating password: {e}")
        return format_response(False, "Internal server error", None), 500

def reset_admin_password():
    try:
        data = request.get_json()
        email = data.get("email")
        new_password = data.get("new_password")
        admin_secret = data.get("admin_secret")

        if not email or not new_password or not admin_secret:
            return format_response(False, "Email, new password, and admin secret are required", None), 400

        if admin_secret != ADMIN_SECRET:
            logger.warning("Missing or invalid admin secret.")
            return format_response(False, "Missing or invalid admin secret", None), 401

        user_collection = mongo.db.User
        user_data = user_collection.find_one({"email": email, "is_deleted": False})

        if not user_data or user_data.get("role") != UserRole.ADMIN:
            return format_response(False, "Admin not found", None), 404

        user = UserModel(**user_data)
        user.update(password_hash=hash_password(new_password))

        user_collection.update_one({"_id": user.id}, {"$set": user.to_bson()})

        logger.info(f"Password reset for admin: {user.email}")
        return format_response(True, "Password reset successfully", None), 200

    except Exception as e:
        logger.exception(f"Error resetting admin password: {e}")
        return format_response(False, "Internal server error", None), 500

@jwt_required()
def refresh_admin_token():
    try:
        verify_jwt_in_request()
        claims = get_jwt()

        if claims.get("role") != UserRole.ADMIN:
            logger.warning("Non-admin tried to refresh admin token.")
            return format_response(False, "Unauthorized", None), 403

        user_id = claims.get("sub")
        email = claims.get("email")

        new_token = create_jwt(user_id, UserRole.ADMIN, email=email)

        logger.info(f"Admin token refreshed for user: {email}")
        return format_response(True, "Token refreshed successfully", {"token": new_token}), 200

    except Exception as e:
        logger.exception(f"Error refreshing admin token: {e}")
        return format_response(False, "Internal server error", None), 500

@jwt_required()
def verify_token():
    try:
        verify_jwt_in_request()
        claims = get_jwt()

        logger.info(f"Token verified for user ID: {claims.get('sub')}")
        return format_response(True, "Token is valid", {
            "user_id": claims.get("sub"),
            "email": claims.get("email"),
            "device_id": claims.get("device_id"),
            "role": claims.get("role")
        }), 200

    except (InvalidTokenError, JWTDecodeError) as e:
        logger.warning("Token expired or invalid during verify.")
        return format_response(False, "Token has expired or is invalid", {"logout": True}), 401

    except Exception as e:
        logger.exception(f"Error verifying token: {e}")
        return format_response(False, "Internal server error", None), 500

def register_user():
    try:
        data = request.get_json()
        device_id = data.get("device_id")

        if not device_id:
            return format_response(False, "Device ID is required", None), 400

        user_collection = mongo.db.User
        existing = user_collection.find_one({"device_id": device_id, "is_deleted": False})

        if existing:
            user = UserModel(**existing)
            user.update(last_login=datetime.now(timezone.utc))
            user_collection.update_one({"_id": user.id}, {"$set": user.to_bson()})
            token = create_jwt(str(user.id), UserRole.USER, device_id=device_id)
            logger.info(f"User already exists: {device_id}")
            return format_response(True, "User already exists", {"token": token, "user_id": str(user.id)}), 200

        user = UserModel(device_id=device_id, role=UserRole.USER)
        inserted_user = user_collection.insert_one(user.to_bson())
        token = create_jwt(str(inserted_user.inserted_id), UserRole.USER, device_id=user.device_id)

        logger.info(f"User registered: {user.device_id}")
        return format_response(True, "User registered successfully", {"token": token, "user_id": str(inserted_user.inserted_id)}), 201

    except Exception as e:
        logger.exception(f"Error registering user: {e}")
        return format_response(False, "Internal server error", None), 500

def login_user():
    try:
        data = request.get_json()
        device_id = data.get("device_id")

        if not device_id:
            return format_response(False, "Device ID is required", None), 400

        user_collection = mongo.db.User
        user_data = user_collection.find_one({"device_id": device_id, "is_deleted": False})

        if not user_data:
            return format_response(False, "User not found", None), 404

        user = UserModel(**user_data)
        user.update(last_login=datetime.now(timezone.utc))
        token = create_jwt(str(user.id), UserRole.USER, device_id=user.device_id)

        user_collection.update_one({"_id": user.id}, {"$set": user.to_bson()})

        logger.info(f"User logged in: {user.device_id}")
        return format_response(True, "User logged in successfully", {"token": token, "user_id": str(user.id)}), 200

    except Exception as e:
        logger.exception(f"Error logging in user: {e}")
        return format_response(False, "Internal server error", None), 500
