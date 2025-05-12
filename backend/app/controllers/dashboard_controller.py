import logging

from bson import ObjectId
from flask import request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required

from ..extensions import mongo
from ..helpers.auth_helper import check_if_admin
from ..helpers.response_helper import format_response

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

        user_count = mongo.db.User.count_documents({"is_deleted": False})
        institute_count = mongo.db.Institute.count_documents({"is_deleted": False})
        resource_count = mongo.db.Resource.count_documents({"is_deleted": False})

        logger.info(f"Dashboard data retrieved successfully")
        return (
            format_response(
                True,
                "Dashboard data retrieved successfully",
                {
                    "user_count": user_count,
                    "institute_count": institute_count,
                    "resource_count": resource_count,
                },
            ),
            200,
        )

    except Exception as e:
        logger.exception(f"Error retrieving dashboard data: {e}")
        return format_response(False, f"Internal server error"), 500


@jwt_required()
def get_resources():
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
        pipeline = [
            {"$match": {"is_deleted": False}},
            {
                "$facet": {
                    "totalCount": [{"$count": "count"}],
                    "paginatedResults": [
                        {"$sort": {"updated_at": -1}},
                        {"$skip": skip},
                        {"$limit": limit},
                    ],
                }
            },
        ]
        if search:
            pipeline[0]["$match"]["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"content": {"$regex": search, "$options": "i"}},
            ]
        result = list(mongo.db.Resource.aggregate(pipeline))
        if result:
            total_count = result[0]["totalCount"][0]["count"]
            resources = result[0]["paginatedResults"]
            total_pages = (total_count + limit - 1) // limit
        else:
            total_count = 0
            resources = []
            total_pages = 0

        response = {
            "total_count": total_count,
            "total_pages": total_pages,
            "page": page,
            "limit": limit,
            "data": resources,
        }

        return format_response(True, "Resources fetched successfully", response), 200

    except Exception as e:
        logger.exception(f"Error fetching resources: {e}")
        return format_response(False, f"Internal server error"), 500


@jwt_required()
def get_resource_by_id(resource_id):
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return format_response(False, "User ID is required"), 400
        user_id = ObjectId(user_id)
        jwt_claims = get_jwt()
        if not check_if_admin(jwt_claims):
            return format_response(False, "Permission denied"), 403

        resource = mongo.db.Resource.find_one(
            {"_id": ObjectId(resource_id), "is_deleted": False}
        )
        if not resource:
            return format_response(False, "Resource not found"), 404

        return format_response(True, "Resource fetched successfully", resource), 200

    except Exception as e:
        logger.exception(f"Error fetching resource by ID: {e}")
        return format_response(False, f"Internal server error"), 500


@jwt_required()
def get_institutes():
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
        pipeline = [
            {"$match": {"is_deleted": False}},
            {
                "$facet": {
                    "totalCount": [{"$count": "count"}],
                    "paginatedResults": [
                        {"$sort": {"updated_at": -1}},
                        {"$skip": skip},
                        {"$limit": limit},
                        {
                            "$project": {
                                "id": {"$toString": "$_id"},
                                "_id": 0,
                                "name": 1
                            },
                        }
                    ],
                }
            },
        ]
        if search:
            pipeline[0]["$match"]["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
            ]
        result = list(mongo.db.Institute.aggregate(pipeline))
        if result:
            total_count = result[0]["totalCount"][0]["count"]
            institutes = result[0]["paginatedResults"]
            total_pages = (total_count + limit - 1) // limit
        else:
            total_count = 0
            institutes = []
            total_pages = 0

        response = {
            "total_count": total_count,
            "total_pages": total_pages,
            "page": page,
            "limit": limit,
            "data": institutes,
        }

        return format_response(True, "Institutes fetched successfully", response), 200

    except Exception as e:
        logger.exception(f"Error fetching institutes: {e}")
        return format_response(False, f"Internal server error"), 500


@jwt_required()
def get_institute_by_id(institute_id):
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return format_response(False, "User ID is required"), 400
        user_id = ObjectId(user_id)
        jwt_claims = get_jwt()
        if not check_if_admin(jwt_claims):
            return format_response(False, "Permission denied"), 403

        institute = mongo.db.Institute.find_one(
            {"_id": ObjectId(institute_id), "is_deleted": False}
        )
        if not institute:
            return format_response(False, "Institute not found"), 404

        return format_response(True, "Institute fetched successfully", institute), 200

    except Exception as e:
        logger.exception(f"Error fetching institute by ID: {e}")
        return format_response(False, f"Internal server error"), 500
