import math
from bson import ObjectId
import logging
from datetime import datetime, timezone
from flask import request
from ..extensions import mongo
from ..models.institute_model import InstituteModel, InstituteFacultyModel, InstituteUserRatingModel
from ..helpers.auth_helper import check_if_admin
from ..helpers.response_helper import format_response

logger = logging.getLogger(__name__)

def get_institutes():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        distance_radius = int(request.args.get('distance_radius', 10000))
        user_longitude = float(request.args.get('longitude'))
        user_latitude = float(request.args.get('latitude'))
        
        if user_longitude is None or user_latitude is None:
            return format_response(False, "User location is required"), 400
        if distance_radius < 0:
            return format_response(False, "Distance radius must be a positive number"), 400
        
        skip = (page - 1) * limit
        
        pipeline = [
            {
                "$geoNear": {
                    "near": {
                        "type": "Point",
                        "coordinates": [user_longitude, user_latitude]
                    },
                    "distanceField": "approx_distance",
                    "maxDistance": distance_radius,
                    "spherical": True,
                    "query": {"is_deleted": False}
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
                                "approx_distance": 1
                            }
                        },
                        {"$sort": {"approx_distance": 1}},
                        {"$skip": skip},
                        {"$limit": limit}
                    ],
                    "totalCount": [{"$count": "count"}]
                }
            }
        ]
        
        result = list(mongo.db.institutes.aggregate(pipeline))
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
            "data": institutes
        }

        return format_response(True, "Institutes fetched successfully", response), 200

    except Exception as e:
        logger.exception(f"Error fetching institutes: {e}")
        return format_response(False, f"Internal server error"), 500

def get_institute_by_id(institute_id):
    try:
        if not institute_id:
            return format_response(False, "Institute ID is required"), 400

        pipeline = [
            {
                "$match": {
                    "_id": ObjectId(institute_id),
                    "is_deleted": False
                }
            },
            {
                "$project": {
                    "name": 1,
                    "managing_authority": 1,
                    "location": 1,
                    "description": 1,
                    "faculties": 1,
                    "average_user_rating": {
                        "$avg": "$user_ratings.rating"
                    }
                }
            }
        ]

        result = list(mongo.db.institutes.aggregate(pipeline))
        if not result:
            return format_response(False, "Institute not found"), 404

        institute = result[0]
        institute = InstituteModel(**institute).to_json()
        return format_response(True, "Institute fetched successfully", institute), 200

    except Exception as e:
        logger.exception(f"Error fetching institute by ID: {e}")
        return format_response(False, f"Internal server error"), 500
