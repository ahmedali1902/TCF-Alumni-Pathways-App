import logging
import math

from bson import ObjectId
from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import mongo
from ..helpers.auth_helper import check_if_admin
from ..helpers.response_helper import format_response
from ..models.resource_model import ResourceModel

logger = logging.getLogger(__name__)


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
                        {
                            "$project": {
                                "title": 1,
                                "content": 1,
                                "updated_at": 1,
                            }
                        },
                    ],
                }
            },
        ]

        result = list(mongo.db.Resource.aggregate(pipeline))
        if result and result[0]["totalCount"]:
            total_count = result[0]["totalCount"][0]["count"]
            resources = result[1]["paginatedResults"]
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

        pipeline = [
            {"$match": {"_id": ObjectId(resource_id), "is_deleted": False}},
            {
                "$project": {
                    "title": 1,
                    "content": 1,
                    "updated_at": 1,
                }
            },
        ]

        result = list(mongo.db.Resource.aggregate(pipeline))
        if not result:
            return format_response(False, "Resource not found"), 404

        resource = result[0]
        return format_response(True, "Resource fetched successfully", resource), 200

    except Exception as e:
        logger.exception(f"Error fetching resource: {e}")
        return format_response(False, f"Internal server error"), 500
