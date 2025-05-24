import logging
import math

from bson import ObjectId
from flask import request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required

from ..extensions import mongo
from ..helpers.auth_helper import check_if_admin
from ..helpers.response_helper import format_response
from ..models.institute_add_request_model import InstituteAddRequestModel

logger = logging.getLogger(__name__)
INSTITUTE_ADD_REQUEST_COLLECTION = mongo.db.InstituteAddRequest


@jwt_required()
def get_institute_add_requests():
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
        show_processed = request.args.get("show_processed", "false").lower() == "true"

        skip = (page - 1) * limit

        pipeline = [
            {"$match": {"is_deleted": False}},
            {
                "$facet": {
                    "paginatedResults": [
                        {"$sort": {"created_at": 1}},
                        {"$skip": skip},
                        {"$limit": limit},
                    ],
                    "totalCount": [{"$count": "count"}],
                }
            },
        ]

        if not show_processed:
            pipeline[0]["$match"]["is_processed"] = False

        result = list(INSTITUTE_ADD_REQUEST_COLLECTION.aggregate(pipeline))
        if result and result[0]["totalCount"]:
            total_count = result[0]["totalCount"][0]["count"]
            institute_add_requests = result[0]["paginatedResults"]
            institute_add_requests = [
                InstituteAddRequestModel(**institute_add_request).to_json()
                for institute_add_request in institute_add_requests
            ]
            total_pages = math.ceil(total_count / limit)
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

        return (
            format_response(
                True, "Institute add requests fetched successfully", response
            ),
            200,
        )

    except Exception as e:
        logger.exception(f"Error fetching institute add requests: {e}")
        return format_response(False, f"Internal server error"), 500


@jwt_required()
def get_institute_add_request_by_id(request_id):
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return format_response(False, "User ID is required"), 400
        user_id = ObjectId(user_id)
        jwt_claims = get_jwt()
        if not check_if_admin(jwt_claims):
            return format_response(False, "Permission denied"), 403

        if not request_id:
            return format_response(False, "Request ID is required"), 400

        institute_add_request_data = INSTITUTE_ADD_REQUEST_COLLECTION.find_one(
            {"_id": ObjectId(request_id), "is_deleted": False}
        )

        if not institute_add_request_data:
            return format_response(False, "Institute add request not found"), 404

        institute_add_request = InstituteAddRequestModel(
            **institute_add_request_data
        ).to_json()
        return (
            format_response(
                True,
                "Institute add request fetched successfully",
                institute_add_request,
            ),
            200,
        )

    except Exception as e:
        logger.exception(f"Error fetching institute add request by ID: {e}")
        return format_response(False, "Internal server error"), 500


@jwt_required()
def create_institute_add_request():
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return format_response(False, "User ID is required"), 400
        user_id = ObjectId(user_id)

        data = request.get_json()
        if not data:
            return format_response(False, "Missing data"), 400

        institute_add_request = InstituteAddRequestModel(
            institute_name=data.get("institute_name"),
            institute_details=data.get("institute_details"),
            created_by=user_id,
            updated_by=user_id,
        )

        INSTITUTE_ADD_REQUEST_COLLECTION.insert_one(institute_add_request.to_bson())
        logger.info(
            f"Institute add request created successfully: {institute_add_request.institute_name}"
        )
        return format_response(True, "Institute add request created successfully"), 201

    except Exception as e:
        logger.exception(f"Error adding institute add request: {e}")
        return format_response(False, "Internal server error"), 500


@jwt_required()
def toggle_processed_institute_add_request(request_id):
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return format_response(False, "User ID is required"), 400
        user_id = ObjectId(user_id)
        jwt_claims = get_jwt()
        if not check_if_admin(jwt_claims):
            return format_response(False, "Permission denied"), 403

        institute_add_request = INSTITUTE_ADD_REQUEST_COLLECTION.find_one(
            {"_id": ObjectId(request_id), "is_deleted": False}
        )
        if not institute_add_request:
            return format_response(False, "Institute add request not found"), 404

        institute_add_request = InstituteAddRequestModel(**institute_add_request)

        institute_add_request.update(
            processed=not institute_add_request.processed,
            updated_by=user_id,
        )

        INSTITUTE_ADD_REQUEST_COLLECTION.update_one(
            {"_id": ObjectId(request_id)}, {"$set": institute_add_request.to_bson()}
        )
        logger.info(
            f"Institute add request updated successfully: {institute_add_request.institute_name}"
        )
        return format_response(True, "Institute add request updated successfully"), 200

    except Exception as e:
        logger.exception(f"Error updating institute add request: {e}")
        return format_response(False, "Internal server error"), 500


@jwt_required()
def delete_institute_add_request(request_id):
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return format_response(False, "User ID is required"), 400
        user_id = ObjectId(user_id)
        jwt_claims = get_jwt()
        if not check_if_admin(jwt_claims):
            return format_response(False, "Permission denied"), 403

        institute_add_request = INSTITUTE_ADD_REQUEST_COLLECTION.find_one(
            {"_id": ObjectId(request_id), "is_deleted": False}
        )
        if not institute_add_request:
            return format_response(False, "Institute add request not found"), 404

        institute_add_request = InstituteAddRequestModel(**institute_add_request)

        institute_add_request.update(
            is_deleted=True,
            updated_by=user_id,
        )

        INSTITUTE_ADD_REQUEST_COLLECTION.update_one(
            {"_id": ObjectId(request_id)}, {"$set": institute_add_request.to_bson()}
        )
        logger.info(
            f"Institute add request deleted successfully: {institute_add_request.institute_name}"
        )
        return format_response(True, "Institute add request deleted successfully"), 200

    except Exception as e:
        logger.exception(f"Error deleting institute add request: {e}")
        return format_response(False, "Internal server error"), 500
