import logging
import math

from bson import ObjectId
from flask import request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required

from ..extensions import mongo
from ..helpers.auth_helper import check_if_admin
from ..helpers.response_helper import format_response
from ..models.user_model import UserRole

logger = logging.getLogger(__name__)


@jwt_required()
def get_dashboard():
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return format_response(False, "User ID is required"), 400
        user_id = ObjectId(user_id)
        jwt_claims = get_jwt()
        if not check_if_admin(jwt_claims):
            return format_response(False, "Permission denied"), 403

        # User counts
        anonymous_user_count = mongo.db.User.count_documents(
            {"role": UserRole.USER, "is_deleted": False}
        )
        admin_user_count = mongo.db.User.count_documents(
            {"role": UserRole.ADMIN, "is_deleted": False}
        )

        # Institute counts
        total_institutes = mongo.db.Institute.count_documents({"is_deleted": False})

        # Resource counts
        total_resources = mongo.db.Resource.count_documents({"is_deleted": False})

        # Institute add request counts
        total_add_requests = mongo.db.InstituteAddRequest.count_documents(
            {"is_deleted": False}
        )
        pending_add_requests = mongo.db.InstituteAddRequest.count_documents(
            {"is_deleted": False, "processed": False}
        )

        # App feedback counts
        total_feedback = mongo.db.AppFeedback.count_documents({"is_deleted": False})
        unprocessed_feedback = mongo.db.AppFeedback.count_documents(
            {"is_deleted": False, "processed": False}
        )

        # Notification counts
        total_notifications = mongo.db.Notification.count_documents({"is_deleted": False})

        logger.info(f"Dashboard data retrieved successfully")
        return (
            format_response(
                True,
                "Dashboard data retrieved successfully",
                {
                    "users": {
                        "anonymous_users": anonymous_user_count,
                        "admin_users": admin_user_count,
                        "total_users": anonymous_user_count + admin_user_count,
                    },
                    "institutes": {"total": total_institutes},
                    "resources": {"total": total_resources},
                    "institute_requests": {
                        "total": total_add_requests,
                        "pending": pending_add_requests,
                        "processed": total_add_requests - pending_add_requests,
                    },
                    "app_feedback": {
                        "total": total_feedback,
                        "unprocessed": unprocessed_feedback,
                        "processed": total_feedback - unprocessed_feedback,
                    },
                    "notifications": {"total": total_notifications},
                },
            ),
            200,
        )

    except Exception as e:
        logger.exception(f"Error retrieving dashboard data: {e}")
        return format_response(False, f"Internal server error"), 500


@jwt_required()
def get_admin_users():
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return format_response(False, "User ID is required"), 400
        user_id = ObjectId(user_id)
        jwt_claims = get_jwt()
        if not check_if_admin(jwt_claims):
            return format_response(False, "Permission denied"), 403

        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        search = request.args.get("search", "")

        skip = (page - 1) * limit
        match_criteria = {"role": UserRole.ADMIN, "is_deleted": False}

        # Add search functionality for admin users
        if search:
            match_criteria["$or"] = [
                {"email": {"$regex": search, "$options": "i"}},
                {"name": {"$regex": search, "$options": "i"}},
            ]

        pipeline = [
            {"$match": match_criteria},
            {
                "$project": {
                    "email": 1,
                    "name": 1,
                    "last_login": 1,
                    "created_at": 1,
                    "updated_at": 1,
                    "role": 1,
                }
            },
            {
                "$facet": {
                    "totalCount": [{"$count": "count"}],
                    "paginatedResults": [
                        {"$sort": {"created_at": -1}},
                        {"$skip": skip},
                        {"$limit": limit},
                    ],
                }
            },
        ]

        result = list(mongo.db.User.aggregate(pipeline))
        if result and result[0]["totalCount"]:
            total_count = result[0]["totalCount"][0]["count"]
            admin_users = result[0]["paginatedResults"]
            # Convert ObjectId to string for JSON serialization
            for user in admin_users:
                user["_id"] = str(user["_id"])
            total_pages = math.ceil(total_count / limit)
        else:
            total_count = 0
            admin_users = []
            total_pages = 0

        response = {
            "total_count": total_count,
            "total_pages": total_pages,
            "page": page,
            "limit": limit,
            "data": admin_users,
        }

        return format_response(True, "Admin users fetched successfully", response), 200

    except Exception as e:
        logger.exception(f"Error fetching admin users: {e}")
        return format_response(False, f"Internal server error"), 500
