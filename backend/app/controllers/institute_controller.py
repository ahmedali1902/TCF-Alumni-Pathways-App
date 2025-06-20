import logging
import math
from random import randint

from bson import ObjectId
from flask import request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
from pymongo.errors import DuplicateKeyError

from ..extensions import mongo
from ..helpers.auth_helper import check_if_admin
from ..helpers.response_helper import format_response
from ..models.institute_model import (Gender, GeoPointModel,
                                      InstituteFacultyModel, InstituteModel,
                                      ManagingAuthority)

logger = logging.getLogger(__name__)


def get_institute_collection():
    """Get institute collection - ensures mongo is initialized"""
    return mongo.db.Institute


@jwt_required()
def get_institutes():
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return format_response(False, "User ID is required"), 400

        jwt_claims = get_jwt()
        is_admin = check_if_admin(jwt_claims)

        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))

        skip = (page - 1) * limit

        if is_admin:
            # Admin logic - search and filter based approach
            search = request.args.get("search", "")
            managing_authority = request.args.get("managing_authority")
            gender = request.args.get("gender")
            min_tcf_rating = request.args.get("min_tcf_rating")

            match_criteria = {"is_deleted": False}

            # Add search functionality
            if search:
                match_criteria["$or"] = [
                    {"name": {"$regex": search, "$options": "i"}},
                    {"description": {"$regex": search, "$options": "i"}},
                ]

            # Add filter by managing authority (enum)
            if managing_authority:
                try:
                    managing_authority_enum = ManagingAuthority(int(managing_authority))
                    match_criteria["managing_authority"] = managing_authority_enum
                except (ValueError, TypeError):
                    return (
                        format_response(
                            False,
                            "Invalid managing authority value. Use 1 for PUBLIC, 2 for PRIVATE",
                        ),
                        400,
                    )

            # Add filter by gender (from faculties)
            if gender:
                try:
                    gender_enum = Gender(int(gender))
                    match_criteria["faculties"] = {
                        "$elemMatch": {"gender": gender_enum}
                    }
                except (ValueError, TypeError):
                    return (
                        format_response(
                            False,
                            "Invalid gender value. Use 1 for MALE_ONLY, 2 for FEMALE_ONLY, 3 for COEDUCATION",
                        ),
                        400,
                    )

            # Add filter by minimum TCF rating
            if min_tcf_rating:
                try:
                    match_criteria["tcf_rating"] = {"$gte": float(min_tcf_rating)}
                except ValueError:
                    return format_response(False, "Invalid TCF rating value"), 400

            pipeline = [
                {"$match": match_criteria},
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

        else:
            # Anonymous user logic - location based approach
            distance_radius = int(request.args.get("distance_radius", 10000))
            user_longitude = request.args.get("longitude")
            user_latitude = request.args.get("latitude")
            min_tcf_rating = float(request.args.get("min_tcf_rating", 0))
            gender = request.args.get("gender")

            if user_longitude is None or user_latitude is None:
                return format_response(False, "User location is required"), 400

            user_longitude = float(user_longitude)
            user_latitude = float(user_latitude)

            if distance_radius < 0:
                return (
                    format_response(False, "Distance radius must be a positive number"),
                    400,
                )
            if min_tcf_rating < 0 or min_tcf_rating > 5:
                return (
                    format_response(False, "Minimum rating must be between 0 and 5"),
                    400,
                )

            try:
                gender = int(gender) if gender else None
            except ValueError:
                return format_response(False, "Invalid gender filter"), 400

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
                    "$match": {
                        "tcf_rating": {"$gte": min_tcf_rating},
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

        result = list(get_institute_collection().aggregate(pipeline))
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

        institute_data = get_institute_collection().find_one(
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

        get_institute_collection().insert_one(institute.to_bson())
        logger.info(f"Institute added successfully: {institute.name}")
        return format_response(True, "Institute added successfully"), 201

    except DuplicateKeyError as e:
        # Check if there's a soft-deleted institute at this location
        existing_institute = get_institute_collection().find_one(
            {"location": location.dict(), "is_deleted": True}
        )

        if existing_institute:
            # Hard delete the soft-deleted institute and create the new one
            get_institute_collection().delete_one({"_id": existing_institute["_id"]})
            logger.info(
                f"Removed soft-deleted institute at same location: {existing_institute.get('name', 'Unknown')}"
            )

            # Now insert the new institute
            get_institute_collection().insert_one(institute.to_bson())
            logger.info(
                f"Institute added successfully after removing soft-deleted duplicate: {institute.name}"
            )
            return format_response(True, "Institute added successfully"), 201
        else:
            # There's an active institute at this location
            logger.warning(f"Duplicate location error when adding institute: {e}")
            return (
                format_response(
                    False, "An institute with this location already exists"
                ),
                409,
            )
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

        institute = get_institute_collection().find_one(
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

        get_institute_collection().update_one(
            {"_id": ObjectId(institute_id)}, {"$set": institute.to_bson()}
        )
        logger.info(f"Institute updated successfully: {institute.name}")
        return format_response(True, "Institute updated successfully"), 200

    except DuplicateKeyError as e:
        # Check if there's a soft-deleted institute at this location
        existing_institute = get_institute_collection().find_one(
            {
                "location": location.dict(),
                "is_deleted": True,
                "_id": {
                    "$ne": ObjectId(institute_id)
                },  # Exclude the current institute being updated
            }
        )

        if existing_institute:
            # Hard delete the soft-deleted institute and update the current one
            get_institute_collection().delete_one({"_id": existing_institute["_id"]})
            logger.info(
                f"Removed soft-deleted institute at same location: {existing_institute.get('name', 'Unknown')}"
            )

            # Now update the institute
            get_institute_collection().update_one(
                {"_id": ObjectId(institute_id)}, {"$set": institute.to_bson()}
            )
            logger.info(
                f"Institute updated successfully after removing soft-deleted duplicate: {institute.name}"
            )
            return format_response(True, "Institute updated successfully"), 200
        else:
            # There's an active institute at this location
            logger.warning(f"Duplicate location error when updating institute: {e}")
            return (
                format_response(
                    False, "An institute with this location already exists"
                ),
                409,
            )
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

        institute = get_institute_collection().find_one(
            {"_id": ObjectId(institute_id), "is_deleted": False}
        )
        if not institute:
            return format_response(False, "Institute not found"), 404

        institute = InstituteModel(**institute)

        institute.update(
            is_deleted=True,
            updated_by=user_id,
        )

        get_institute_collection().update_one(
            {"_id": ObjectId(institute_id)}, {"$set": institute.to_bson()}
        )
        logger.info(f"Institute deleted successfully: {institute.name}")
        return format_response(True, "Institute deleted successfully"), 200

    except Exception as e:
        logger.exception(f"Error deleting institute: {e}")
        return format_response(False, "Internal server error"), 500
