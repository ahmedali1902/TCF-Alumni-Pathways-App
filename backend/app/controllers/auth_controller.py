import os
import logging
from flask import request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required, verify_jwt_in_request
from flask_jwt_extended.exceptions import ExpiredSignatureError, NoAuthorizationError, InvalidHeaderError
from ..extensions import mongo
from ..models.user_model import UserModel, UserRole
from ..helpers.auth_helper import hash_password, check_password, create_jwt
from ..helpers.response_helper import format_response

logger = logging.getLogger(__name__)

ADMIN_SECRET = os.getenv("ADMIN_SECRET")

def create_admin():
    try:
        data = request.get_json()
        email = data.get("email")
        name = data.get("name")
        password = data.get("password")
        admin_secret = data.get("admin_secret")

        if admin_secret != ADMIN_SECRET:
            logger.warning("Invalid admin secret attempt.")
            return format_response(False, "Invalid admin secret", None), 401

        if not email or not name or not password:
            return format_response(False, "Email, name, and password are required", None), 400

        user_collection = mongo.db.User
        if user_collection.find_one({"email": email}):
            return format_response(False, "Admin already exists", None), 400

        user = UserModel(
            email=email,
            name=name,
            password_hash=hash_password(password),
            role=UserRole.ADMIN
        )

        user_collection.insert_one(user.to_bson())
        logger.info(f"Admin created: {email}")
        return format_response(True, "Admin created successfully", None), 201

    except Exception as e:
        logger.exception("Error creating admin")
        return format_response(False, str(e), None), 500

def login_admin():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return format_response(False, "Email and password are required", None), 400

        user_collection = mongo.db.User
        user_data = user_collection.find_one({"email": email})

        if not user_data or user_data.get("role") != UserRole.ADMIN:
            return format_response(False, "Admin not found", None), 404

        if not check_password(password, user_data["password_hash"]):
            logger.warning(f"Invalid password for admin: {email}")
            return format_response(False, "Invalid password", None), 401

        token = create_jwt(str(user_data["_id"]), UserRole.ADMIN, email=email)

        logger.info(f"Admin logged in: {email}")
        return format_response(True, "Admin logged in successfully", {
            "token": token,
            "user_id": str(user_data["_id"])
        }), 200

    except Exception as e:
        logger.exception("Error logging admin")
        return format_response(False, str(e), None), 500

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
        user_data = user_collection.find_one({"_id": mongo.db.ObjectId(user_id)})

        if not user_data:
            return format_response(False, "User not found", None), 404

        if not check_password(old_password, user_data["password_hash"]):
            return format_response(False, "Old password is incorrect", None), 401

        new_password_hash = hash_password(new_password)
        user_collection.update_one(
            {"_id": user_data["_id"]},
            {"$set": {"password_hash": new_password_hash}}
        )

        logger.info(f"Password updated for user: {user_id}")
        return format_response(True, "Password updated successfully", None), 200

    except Exception as e:
        logger.exception("Error updating password")
        return format_response(False, str(e), None), 500

def reset_admin_password():
    try:
        data = request.get_json()
        email = data.get("email")
        new_password = data.get("new_password")
        admin_secret = data.get("admin_secret")

        if not email or not new_password or not admin_secret:
            return format_response(False, "Email, new password, and admin secret are required", None), 400

        if admin_secret != ADMIN_SECRET:
            logger.warning("Invalid reset password secret attempt.")
            return format_response(False, "Invalid admin secret", None), 401

        user_collection = mongo.db.User
        user_data = user_collection.find_one({"email": email})

        if not user_data or user_data.get("role") != UserRole.ADMIN:
            return format_response(False, "Admin not found", None), 404

        new_password_hash = hash_password(new_password)
        user_collection.update_one(
            {"_id": user_data["_id"]},
            {"$set": {"password_hash": new_password_hash}}
        )

        logger.info(f"Password reset for admin: {email}")
        return format_response(True, "Password reset successfully", None), 200

    except Exception as e:
        logger.exception("Error resetting password")
        return format_response(False, str(e), None), 500

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
        return format_response(True, "Token refreshed successfully", {
            "token": new_token
        }), 200

    except Exception as e:
        logger.exception("Error refreshing token")
        return format_response(False, str(e), None), 401

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

    except (ExpiredSignatureError, NoAuthorizationError, InvalidHeaderError) as e:
        logger.warning("Token expired or invalid during verify.")
        return format_response(False, "Token expired or invalid", {
            "logout": True
        }), 401

    except Exception as e:
        logger.exception("Unexpected error during token verification.")
        return format_response(False, str(e), {
            "logout": True
        }), 401

def register_user():
    try:
        data = request.get_json()
        device_id = data.get("device_id")

        if not device_id:
            return format_response(False, "Device ID is required", None), 400

        user_collection = mongo.db.User
        existing = user_collection.find_one({"device_id": device_id})

        if existing:
            return format_response(False, "User already exists", None), 400

        user = UserModel(
            device_id=device_id,
            role=UserRole.USER
        )

        inserted = user_collection.insert_one(user.to_bson())
        token = create_jwt(str(inserted.inserted_id), UserRole.USER, device_id=device_id)

        logger.info(f"User registered: {device_id}")
        return format_response(True, "User registered successfully", {
            "token": token,
            "user_id": str(inserted.inserted_id)
        }), 201

    except Exception as e:
        logger.exception("Error registering user")
        return format_response(False, str(e), None), 500

def login_user():
    try:
        data = request.get_json()
        device_id = data.get("device_id")

        if not device_id:
            return format_response(False, "Device ID is required", None), 400

        user_collection = mongo.db.User
        user_data = user_collection.find_one({"device_id": device_id})

        if not user_data:
            return format_response(False, "User not found", None), 404

        token = create_jwt(str(user_data["_id"]), UserRole.USER, device_id=device_id)

        logger.info(f"User logged in: {device_id}")
        return format_response(True, "User logged in successfully", {
            "token": token,
            "user_id": str(user_data["_id"])
        }), 200

    except Exception as e:
        logger.exception("Error logging user")
        return format_response(False, str(e), None), 500
