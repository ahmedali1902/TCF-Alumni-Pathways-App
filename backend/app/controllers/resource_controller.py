import logging
import math

from bson import ObjectId
from flask import request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required

from ..extensions import mongo
from ..helpers.auth_helper import check_if_admin
from ..helpers.response_helper import format_response
from ..models.resource_model import ResourceModel

logger = logging.getLogger(__name__)
RESOURCE_COLLECTION = mongo.db.Resource


@jwt_required()
def get_resources():
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        education_level = request.args.get("education_level", 1)
        category = request.args.get("category", 1)
        skip = (page - 1) * limit

        pipeline = [
            {
                "$match": {
                    "education_level": int(education_level),
                    "category": int(category),
                    "is_deleted": False,
                }
            },
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

        result = list(RESOURCE_COLLECTION.aggregate(pipeline))
        if result and result[0]["totalCount"]:
            total_count = result[0]["totalCount"][0]["count"]
            resources = result[1]["paginatedResults"]
            resources = [
                ResourceModel(**resource).to_json() for resource in resources
            ]
            total_pages = math.ceil(total_count / limit)
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
        if not resource_id:
            return format_response(False, "Resource ID is required"), 400

        resource_data = RESOURCE_COLLECTION.find_one(
            {"_id": ObjectId(resource_id), "is_deleted": False}
        )

        if not resource_data:
            return format_response(False, "Resource not found"), 404
        
        resource = ResourceModel(**resource_data).to_json()
        return format_response(True, "Resource fetched successfully", resource), 200

    except Exception as e:
        logger.exception(f"Error fetching resource: {e}")
        return format_response(False, f"Internal server error"), 500


@jwt_required()
def add_resource():
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return format_response(False, "User ID is required"), 400
        user_id = ObjectId(user_id)
        jwt_claims = get_jwt()
        if not check_if_admin(jwt_claims):
            return format_response(False, "Permission denied"), 403

        data = request.get_json()
        if not data:
            return format_response(False, "Missing data"), 400

        title = data.get("title")
        content = data.get("content")
        education_level = data.get("education_level")
        category = data.get("category")
        link = data.get("link", None)
        image_url = data.get("image_url", None)

        if not title or not content or not education_level or not category:
            return format_response(False, "All fields are required"), 400

        resource = ResourceModel(
            title=title,
            content=content,
            education_level=education_level,
            link=link,
            image_url=image_url,
            category=category,
            created_by=user_id,
            updated_by=user_id,
        )
        RESOURCE_COLLECTION.insert_one(resource.to_bson())

        logger.info(f"Resource added successfully: {resource.title}")
        return format_response(True, "Resource added successfully"), 201

    except Exception as e:
        logger.exception(f"Error adding resource: {e}")
        return format_response(False, f"Internal server error"), 500


@jwt_required()
def update_resource(resource_id):
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return format_response(False, "User ID is required"), 400
        user_id = ObjectId(user_id)
        jwt_claims = get_jwt()
        if not check_if_admin(jwt_claims):
            return format_response(False, "Permission denied"), 403

        data = request.get_json()
        if not data:
            return format_response(False, "Missing data"), 400

        resource = RESOURCE_COLLECTION.find_one(
            {"_id": ObjectId(resource_id), "is_deleted": False}
        )
        if not resource:
            return format_response(False, "Resource not found"), 404
        
        resource = ResourceModel(**resource)

        resource.update(
            title=data.get("title"),
            content=data.get("content"),
            education_level=data.get("education_level"),
            category=data.get("category"),
            link=data.get("link", None),
            image_url=data.get("image_url", None),
            updated_by=user_id,
        )

        RESOURCE_COLLECTION.update_one(
            {"_id": ObjectId(resource_id)},
            {"$set": resource.to_bson()},
        )

        logger.info(f"Resource updated successfully: {resource.title}")
        return format_response(True, "Resource updated successfully"), 200

    except Exception as e:
        logger.exception(f"Error updating resource: {e}")
        return format_response(False, f"Internal server error"), 500


@jwt_required()
def delete_resource(resource_id):
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return format_response(False, "User ID is required"), 400
        user_id = ObjectId(user_id)
        jwt_claims = get_jwt()
        if not check_if_admin(jwt_claims):
            return format_response(False, "Permission denied"), 403

        resource = RESOURCE_COLLECTION.find_one(
            {"_id": ObjectId(resource_id), "is_deleted": False}
        )
        if not resource:
            return format_response(False, "Resource not found"), 404

        RESOURCE_COLLECTION.update_one(
            {"_id": ObjectId(resource_id)},
            {"$set": {"is_deleted": True, "updated_by": user_id}},
        )

        logger.info(f"Resource deleted successfully: {resource['title']}")
        return format_response(True, "Resource deleted successfully"), 200

    except Exception as e:
        logger.exception(f"Error deleting resource: {e}")
        return format_response(False, f"Internal server error"), 500
