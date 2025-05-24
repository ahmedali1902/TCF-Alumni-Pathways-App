import logging
import math
from datetime import datetime, timezone
from random import randint

from bson import ObjectId
from flask import request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required

from ..extensions import mongo
from ..helpers.auth_helper import check_if_admin
from ..helpers.response_helper import format_response
from ..models.institute_model import (
    GeoPointModel,
    InstituteFacultyModel,
    InstituteModel,
)

logger = logging.getLogger(__name__)
INSTITUTE_COLLECTION = mongo.db.Institute


@jwt_required()
def get_institutes():
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        distance_radius = int(request.args.get("distance_radius", 10000))
        user_longitude = float(request.args.get("longitude"))
        user_latitude = float(request.args.get("latitude"))
        min_rating = float(request.args.get("min_rating", 0))
        gender = request.args.get("gender")

        if user_longitude is None or user_latitude is None:
            return format_response(False, "User location is required"), 400
        if distance_radius < 0:
            return (
                format_response(False, "Distance radius must be a positive number"),
                400,
            )
        if min_rating < 0 or min_rating > 5:
            return format_response(False, "Minimum rating must be between 0 and 5"), 400

        try:
            gender = int(gender) if gender else None
        except ValueError:
            return format_response(False, "Invalid gender filter"), 400

        skip = (page - 1) * limit

        pipeline = [
            {
                "$geoNear": {
                    "near": {
                        "type": "Point",
                        "coordinates": [user_longitude, user_latitude],
                    },
                    "distanceField": "approx_distance",
                    "maxDistance": distance_radius,
                    "spherical": True,
                }
            },
            {
                "$match": {
                    "tcf_rating": {"$gte": min_rating},
                    "is_deleted": False,
                }
            },
        ]

        if gender:
            pipeline.append(
                {"$match": {"faculties": {"$elemMatch": {"gender": gender}}}}
            )

        pipeline.append(
            {
                "$facet": {
                    "paginatedResults": [
                        {"$sort": {"approx_distance": 1}},
                        {"$skip": skip},
                        {"$limit": limit},
                    ],
                    "totalCount": [{"$count": "count"}],
                }
            }
        )

        result = list(INSTITUTE_COLLECTION.aggregate(pipeline))
        if result and result[0]["totalCount"]:
            total_count = result[0]["totalCount"][0]["count"]
            institutes = result[0]["paginatedResults"]
            institutes = [
                InstituteModel(**institute).to_json() for institute in institutes
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

        return format_response(True, "Institutes fetched successfully", response), 200

    except Exception as e:
        logger.exception(f"Error fetching institutes: {e}")
        return format_response(False, f"Internal server error"), 500


@jwt_required()
def get_institute_by_id(institute_id):
    try:
        if not institute_id:
            return format_response(False, "Institute ID is required"), 400

        institute_data = INSTITUTE_COLLECTION.find_one(
            {"_id": ObjectId(institute_id), "is_deleted": False}
        )

        if not institute_data:
            return format_response(False, "Institute not found"), 404

        institute = InstituteModel(**institute_data).to_json()
        return format_response(True, "Institute fetched successfully", institute), 200

    except Exception as e:
        logger.exception(f"Error fetching institute by ID: {e}")
        return format_response(False, "Internal server error"), 500


@jwt_required()
def add_institute():
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

        faculty_data = data.get("faculties", [])
        faculties = []
        for faculty in faculty_data:
            faculties.append(InstituteFacultyModel(**faculty))

        latitude = data.get("latitude")
        longitude = data.get("longitude")
        coordinates = [longitude, latitude]
        location = GeoPointModel(coordinates=coordinates)

        institute = InstituteModel(
            name=data.get("name"),
            managing_authority=data.get("managing_authority"),
            location=location,
            description=data.get("description", ""),
            faculties=faculties,
            tcf_rating=data.get("tcf_rating", randint(40, 50) / 10),
            created_by=user_id,
            updated_by=user_id,
        )
        INSTITUTE_COLLECTION.insert_one(institute.to_bson())
        logger.info(f"Institute added successfully: {institute.name}")
        return format_response(True, "Institute added successfully"), 201

    except Exception as e:
        logger.exception(f"Error adding institute: {e}")
        return format_response(False, "Internal server error"), 500


@jwt_required()
def update_institute(institute_id):
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

        institute = INSTITUTE_COLLECTION.find_one(
            {"_id": ObjectId(institute_id), "is_deleted": False}
        )
        if not institute:
            return format_response(False, "Institute not found"), 404

        institute = InstituteModel(**institute)

        faculty_data = data.get("faculties", [])
        faculties = []
        for faculty in faculty_data:
            faculties.append(InstituteFacultyModel(**faculty))

        latitude = data.get("latitude")
        longitude = data.get("longitude")
        coordinates = [longitude, latitude]
        location = GeoPointModel(coordinates=coordinates)

        institute.update(
            name=data.get("name"),
            managing_authority=data.get("managing_authority"),
            location=location,
            description=data.get("description"),
            faculties=faculties,
            tcf_rating=data.get("tcf_rating"),
            updated_by=user_id,
        )

        INSTITUTE_COLLECTION.update_one(
            {"_id": ObjectId(institute_id)}, {"$set": institute.to_bson()}
        )
        logger.info(f"Institute updated successfully: {institute.name}")
        return format_response(True, "Institute updated successfully"), 200

    except Exception as e:
        logger.exception(f"Error updating institute: {e}")
        return format_response(False, "Internal server error"), 500


@jwt_required()
def delete_institute(institute_id):
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return format_response(False, "User ID is required"), 400
        user_id = ObjectId(user_id)
        jwt_claims = get_jwt()
        if not check_if_admin(jwt_claims):
            return format_response(False, "Permission denied"), 403

        institute = INSTITUTE_COLLECTION.find_one(
            {"_id": ObjectId(institute_id), "is_deleted": False}
        )
        if not institute:
            return format_response(False, "Institute not found"), 404

        institute = InstituteModel(**institute)

        INSTITUTE_COLLECTION.update_one(
            {"_id": ObjectId(institute_id)},
            {
                "$set": {
                    "is_deleted": True,
                    "updated_at": datetime.now(timezone.utc),
                    "updated_by": user_id,
                }
            },
        )
        logger.info(f"Institute deleted successfully: {institute.name}")
        return format_response(True, "Institute deleted successfully"), 200

    except Exception as e:
        logger.exception(f"Error deleting institute: {e}")
        return format_response(False, "Internal server error"), 500
