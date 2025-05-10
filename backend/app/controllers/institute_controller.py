import logging
import math
from datetime import datetime, timezone

from bson import ObjectId
from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import mongo
from ..helpers.auth_helper import check_if_admin
from ..helpers.response_helper import format_response
from ..models.institute_model import (
    InstituteFacultyModel,
    InstituteModel,
    InstituteUserRatingModel,
)

logger = logging.getLogger(__name__)


@jwt_required()
def get_institutes():
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        distance_radius = int(request.args.get("distance_radius", 10000))
        user_longitude = float(request.args.get("longitude"))
        user_latitude = float(request.args.get("latitude"))

        if user_longitude is None or user_latitude is None:
            return format_response(False, "User location is required"), 400
        if distance_radius < 0:
            return (
                format_response(False, "Distance radius must be a positive number"),
                400,
            )

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
                    "query": {"is_deleted": False},
                }
            },
            {
                "$facet": {
                    "paginatedResults": [
                        {
                            "$project": {
                                "id": {"$toString": "$_id"},
                                "_id": 0,
                                "name": 1,
                                "managing_authority": 1,
                                "location": 1,
                                "description": 1,
                                "approx_distance": 1,
                            }
                        },
                        {"$sort": {"approx_distance": 1}},
                        {"$skip": skip},
                        {"$limit": limit},
                    ],
                    "totalCount": [{"$count": "count"}],
                }
            },
        ]

        result = list(mongo.db.TestInstitute.aggregate(pipeline))
        if result and result[0]["totalCount"]:
            total_count = result[0]["totalCount"][0]["count"]
            institutes = result[0]["paginatedResults"]
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

        pipeline = [
            {"$match": {"_id": ObjectId(institute_id), "is_deleted": False}},
            {
                "$project": {
                    "name": 1,
                    "managing_authority": 1,
                    "location": 1,
                    "description": 1,
                    "faculties": 1,
                    "average_user_rating": {"$avg": "$user_ratings.rating"},
                }
            },
        ]

        result = list(mongo.db.TestInstitute.aggregate(pipeline))
        if not result:
            return format_response(False, "Institute not found"), 404

        institute = result[0]
        institute = InstituteModel(**institute).to_json()
        return format_response(True, "Institute fetched successfully", institute), 200

    except Exception as e:
        logger.exception(f"Error fetching institute by ID: {e}")
        return format_response(False, f"Internal server error"), 500


@jwt_required()
def rate_institute(institute_id):
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return format_response(False, "User ID is required"), 400
        user_id = ObjectId(user_id)

        data = request.get_json()
        rating = data.get("rating")
        if rating is None or not (1 <= rating <= 5):
            return format_response(False, "Rating must be between 1 and 5"), 400

        institute_collection = mongo.db.TestInstitute

        institute = institute_collection.find_one(
            {"_id": ObjectId(institute_id), "is_deleted": False}
        )
        if not institute:
            return format_response(False, "Institute not found"), 404

        institute = InstituteModel(**institute)

        user_ratings = institute.user_ratings
        if not user_ratings:
            user_ratings = []

        for user_rating in user_ratings:
            if user_rating.rated_by == user_id:
                user_rating.rating = rating
                break
        else:
            user_ratings.append(
                InstituteUserRatingModel(rating=rating, rated_by=user_id)
            )
        institute.update(
            user_ratings=user_ratings,
            average_user_rating=sum(user_rating.rating for user_rating in user_ratings)
            / len(user_ratings),
            updated_at=datetime.now(timezone.utc),
            updated_by=user_id,
        )

        institute_collection.update_one(
            {"_id": institute.id}, {"$set": institute.to_bson()}
        )
        logger.info(f"Institute rated successfully: {institute.name}")
        return format_response(True, "Institute rated successfully"), 200

    except Exception as e:
        logger.exception(f"Error rating institute: {e}")
        return format_response(False, "Internal server error"), 500
