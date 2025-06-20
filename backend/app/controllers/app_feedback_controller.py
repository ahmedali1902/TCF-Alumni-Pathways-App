import logging
import math

from bson import ObjectId
from flask import request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required

from ..extensions import mongo
from ..helpers.auth_helper import check_if_admin
from ..helpers.response_helper import format_response
from ..models.app_feedback_model import AppFeedbackModel

logger = logging.getLogger(__name__)


def get_app_feedback_collection():
    """Get app feedback collection - ensures mongo is initialized"""
    return mongo.db.AppFeedback


@jwt_required()
def get_app_feedbacks():
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
                        {"$sort": {"created_at": -1}},
                        {"$skip": skip},
                        {"$limit": limit},
                    ],
                    "totalCount": [{"$count": "count"}],
                }
            },
        ]

        if not show_processed:
            pipeline[0]["$match"]["processed"] = False

        result = list(get_app_feedback_collection().aggregate(pipeline))
        if result and result[0]["totalCount"]:
            total_count = result[0]["totalCount"][0]["count"]
            app_feedbacks = result[0]["paginatedResults"]
            app_feedbacks = [
                AppFeedbackModel(**app_feedback).to_json()
                for app_feedback in app_feedbacks
            ]
            total_pages = math.ceil(total_count / limit)
        else:
            total_count = 0
            app_feedbacks = []
            total_pages = 0

        response = {
            "total_count": total_count,
            "total_pages": total_pages,
            "page": page,
            "limit": limit,
            "data": app_feedbacks,
        }

        return (
            format_response(True, "App feedbacks fetched successfully", response),
            200,
        )

    except Exception as e:
        logger.exception(f"Error fetching app feedbacks: {e}")
        return format_response(False, "Internal server error"), 500


@jwt_required()
def get_app_feedback_by_id(feedback_id):
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return format_response(False, "User ID is required"), 400
        user_id = ObjectId(user_id)
        jwt_claims = get_jwt()
        if not check_if_admin(jwt_claims):
            return format_response(False, "Permission denied"), 403

        if not feedback_id:
            return format_response(False, "Feedback ID is required"), 400

        app_feedback_data = get_app_feedback_collection().find_one(
            {"_id": ObjectId(feedback_id), "is_deleted": False}
        )

        if not app_feedback_data:
            return format_response(False, "App feedback not found"), 404

        app_feedback = AppFeedbackModel(**app_feedback_data).to_json()
        return (
            format_response(
                True,
                "App feedback fetched successfully",
                app_feedback,
            ),
            200,
        )

    except Exception as e:
        logger.exception(f"Error fetching app feedback by ID: {e}")
        return format_response(False, "Internal server error"), 500


@jwt_required()
def create_app_feedback():
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return format_response(False, "User ID is required"), 400
        user_id = ObjectId(user_id)

        data = request.get_json()
        if not data:
            return format_response(False, "Missing data"), 400

        user_name = data.get("user_name")
        reason_type = data.get("reason_type", 1)
        reason_if_other = data.get("reason_if_other", "")
        experience_rating = data.get("experience_rating", 0)
        is_tcf_alumni = data.get("is_tcf_alumni", False)
        whatsapp_number = data.get("whatsapp_number")
        feedback_text = data.get("feedback_text")

        if not feedback_text:
            return format_response(False, "Feedback text is required"), 400

        # Validate experience rating
        if experience_rating < 0 or experience_rating > 5:
            return (
                format_response(False, "Experience rating must be between 0 and 5"),
                400,
            )

        app_feedback = AppFeedbackModel(
            user_name=user_name,
            reason_type=reason_type,
            reason_if_other=reason_if_other,
            experience_rating=experience_rating,
            is_tcf_alumni=is_tcf_alumni,
            whatsapp_number=whatsapp_number,
            feedback_text=feedback_text,
            created_by=user_id,
            updated_by=user_id,
        )

        get_app_feedback_collection().insert_one(app_feedback.to_bson())
        logger.info(f"App feedback created successfully by user: {user_id}")
        return format_response(True, "App feedback created successfully"), 201

    except Exception as e:
        logger.exception(f"Error adding app feedback: {e}")
        return format_response(False, "Internal server error"), 500


@jwt_required()
def toggle_processed_app_feedback(feedback_id):
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return format_response(False, "User ID is required"), 400
        user_id = ObjectId(user_id)
        jwt_claims = get_jwt()
        if not check_if_admin(jwt_claims):
            return format_response(False, "Permission denied"), 403

        app_feedback = get_app_feedback_collection().find_one(
            {"_id": ObjectId(feedback_id), "is_deleted": False}
        )
        if not app_feedback:
            return format_response(False, "App feedback not found"), 404

        app_feedback = AppFeedbackModel(**app_feedback)

        app_feedback.update(
            processed=not app_feedback.processed,
            updated_by=user_id,
        )

        get_app_feedback_collection().update_one(
            {"_id": ObjectId(feedback_id)}, {"$set": app_feedback.to_bson()}
        )
        logger.info(f"App feedback updated successfully: {feedback_id}")
        return format_response(True, "App feedback updated successfully"), 200

    except Exception as e:
        logger.exception(f"Error updating app feedback: {e}")
        return format_response(False, "Internal server error"), 500


@jwt_required()
def delete_app_feedback(feedback_id):
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return format_response(False, "User ID is required"), 400
        user_id = ObjectId(user_id)
        jwt_claims = get_jwt()
        if not check_if_admin(jwt_claims):
            return format_response(False, "Permission denied"), 403

        app_feedback = get_app_feedback_collection().find_one(
            {"_id": ObjectId(feedback_id), "is_deleted": False}
        )
        if not app_feedback:
            return format_response(False, "App feedback not found"), 404

        app_feedback = AppFeedbackModel(**app_feedback)

        app_feedback.update(
            is_deleted=True,
            updated_by=user_id,
        )

        get_app_feedback_collection().update_one(
            {"_id": ObjectId(feedback_id)}, {"$set": app_feedback.to_bson()}
        )
        logger.info(f"App feedback deleted successfully: {feedback_id}")
        return format_response(True, "App feedback deleted successfully"), 200

    except Exception as e:
        logger.exception(f"Error deleting app feedback: {e}")
        return format_response(False, "Internal server error"), 500
