import logging
import math
from bson import ObjectId
from flask import request
from flask_jwt_extended import jwt_required, get_jwt
from pymongo.errors import PyMongoError

from ..extensions import mongo
from ..helpers.auth_helper import check_if_admin
from ..helpers.response_helper import format_response
from ..models.user_model import UserModel, UserRole

logger = logging.getLogger(__name__)


def get_user_collection():
    """Get user collection - ensures mongo is initialized"""
    return mongo.db.User


@jwt_required()
def get_users():
    """Get all users with pagination and filtering (Admin only)"""
    try:
        # Check if user is admin
        jwt_claims = get_jwt()
        if not check_if_admin(jwt_claims):
            return format_response(False, "Admin access required"), 403

        # Pagination parameters
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        skip = (page - 1) * limit

        # Filter parameters
        search = request.args.get("search", "")
        role = request.args.get("role")

        # Build match criteria - only show active users
        match_criteria = {"is_deleted": False}

        # Add search functionality (search by email or name)
        if search:
            match_criteria["$or"] = [
                {"email": {"$regex": search, "$options": "i"}},
                {"name": {"$regex": search, "$options": "i"}},
            ]

        # Filter by role
        if role:
            try:
                role_enum = UserRole(int(role))
                match_criteria["role"] = role_enum
            except (ValueError, TypeError):
                return format_response(
                    False,
                    "Invalid role value. Use 1 for ADMIN, 2 for USER",
                ), 400

        # Aggregation pipeline for pagination and counting
        pipeline = [
            {"$match": match_criteria},
            {
                "$facet": {
                    "totalCount": [{"$count": "count"}],
                    "paginatedResults": [
                        {"$sort": {"created_at": -1}},
                        {"$skip": skip},
                        {"$limit": limit},
                        {
                            "$project": {
                                "password_hash": 0  # Exclude password hash from results
                            }
                        }
                    ],
                }
            },
        ]

        result = list(get_user_collection().aggregate(pipeline))
        
        if result and result[0]["totalCount"]:
            total_count = result[0]["totalCount"][0]["count"]
            users = result[0]["paginatedResults"]
            users = [UserModel(**user).to_json() for user in users]
            total_pages = math.ceil(total_count / limit)
        else:
            total_count = 0
            users = []
            total_pages = 0

        response = {
            "total_count": total_count,
            "total_pages": total_pages,
            "page": page,
            "limit": limit,
            "data": users,
        }

        return format_response(True, "Users fetched successfully", response), 200

    except Exception as e:
        logger.exception(f"Error fetching users: {e}")
        return format_response(False, "Internal server error"), 500


@jwt_required()
def get_user_by_id(user_id):
    """Get a specific user by ID (Admin only)"""
    try:
        # Check if user is admin
        jwt_claims = get_jwt()
        if not check_if_admin(jwt_claims):
            return format_response(False, "Admin access required"), 403

        # Validate user ID format
        if not ObjectId.is_valid(user_id):
            return format_response(False, "Invalid user ID format"), 400

        # Find user by ID (exclude password hash)
        user_data = get_user_collection().find_one(
            {"_id": ObjectId(user_id)},
            {"password_hash": 0}
        )

        if not user_data:
            return format_response(False, "User not found"), 404

        user = UserModel(**user_data).to_json()
        return format_response(True, "User fetched successfully", user), 200

    except PyMongoError as e:
        logger.exception(f"Database error fetching user {user_id}: {e}")
        return format_response(False, "Database error"), 500
    except Exception as e:
        logger.exception(f"Error fetching user {user_id}: {e}")
        return format_response(False, "Internal server error"), 500


@jwt_required()
def delete_user(user_id):
    """Soft delete a user by marking as deleted (Admin only)"""
    try:
        # Check if user is admin
        jwt_claims = get_jwt()
        if not check_if_admin(jwt_claims):
            return format_response(False, "Admin access required"), 403

        # Validate user ID format
        if not ObjectId.is_valid(user_id):
            return format_response(False, "Invalid user ID format"), 400

        # Check if user exists
        existing_user = get_user_collection().find_one({"_id": ObjectId(user_id)})
        if not existing_user:
            return format_response(False, "User not found"), 404

        # Check if user is already deleted
        if existing_user.get("is_deleted", False):
            return format_response(False, "User is already deleted"), 400

        # Soft delete the user
        result = get_user_collection().update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "is_deleted": True,
                    "updated_at": UserModel().updated_at
                }
            }
        )

        if result.modified_count == 0:
            return format_response(False, "Failed to delete user"), 500

        return format_response(True, "User deleted successfully"), 200

    except PyMongoError as e:
        logger.exception(f"Database error deleting user {user_id}: {e}")
        return format_response(False, "Database error"), 500
    except Exception as e:
        logger.exception(f"Error deleting user {user_id}: {e}")
        return format_response(False, "Internal server error"), 500


@jwt_required()
def restore_user(user_id):
    """Restore a soft-deleted user (Admin only)"""
    try:
        # Check if user is admin
        jwt_claims = get_jwt()
        if not check_if_admin(jwt_claims):
            return format_response(False, "Admin access required"), 403

        # Validate user ID format
        if not ObjectId.is_valid(user_id):
            return format_response(False, "Invalid user ID format"), 400

        # Check if user exists
        existing_user = get_user_collection().find_one({"_id": ObjectId(user_id)})
        if not existing_user:
            return format_response(False, "User not found"), 404

        # Check if user is not deleted
        if not existing_user.get("is_deleted", False):
            return format_response(False, "User is not deleted"), 400

        # Restore the user
        result = get_user_collection().update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "is_deleted": False,
                    "updated_at": UserModel().updated_at
                }
            }
        )

        if result.modified_count == 0:
            return format_response(False, "Failed to restore user"), 500

        return format_response(True, "User restored successfully"), 200

    except PyMongoError as e:
        logger.exception(f"Database error restoring user {user_id}: {e}")
        return format_response(False, "Database error"), 500
    except Exception as e:
        logger.exception(f"Error restoring user {user_id}: {e}")
        return format_response(False, "Internal server error"), 500 