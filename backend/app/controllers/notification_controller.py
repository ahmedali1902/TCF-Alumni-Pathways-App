import logging
from bson import ObjectId
from flask import request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
from pydantic.v1 import BaseModel, Field, ValidationError, validator

from ..extensions import mongo
from ..helpers.auth_helper import check_if_admin
from ..helpers.response_helper import format_response
from ..models.notification_model import NotificationModel

logger = logging.getLogger(__name__)

def get_notification_collection():
    """Get notification collection - ensures mongo is initialized"""
    return mongo.db.Notification


class NotificationCreateSchema(BaseModel):
    title: str = Field(..., min_length=1, max_length=39)
    content: str = Field(..., min_length=1, max_length=150)

    @validator('title')
    def validate_title(cls, v):
        if not v or not v.strip():
            raise ValueError('Title cannot be empty or whitespace only')
        return v.strip()

    @validator('content')
    def validate_content(cls, v):
        if not v or not v.strip():
            raise ValueError('Content cannot be empty or whitespace only')
        return v.strip()


class NotificationUpdateSchema(BaseModel):
    title: str = Field(..., min_length=1, max_length=39)
    content: str = Field(..., min_length=1, max_length=150)

    @validator('title')
    def validate_title(cls, v):
        if not v or not v.strip():
            raise ValueError('Title cannot be empty or whitespace only')
        return v.strip()

    @validator('content')
    def validate_content(cls, v):
        if not v or not v.strip():
            raise ValueError('Content cannot be empty or whitespace only')
        return v.strip()


class NotificationDeleteSchema(BaseModel):
    is_deleted: bool = Field(...)

    @validator('is_deleted')
    def validate_is_deleted(cls, v):
        if not isinstance(v, bool):
            raise ValueError('is_deleted must be a boolean value')
        return v


@jwt_required()
def get_notifications():
    """Get all notifications - Available to all authenticated users"""
    try:
        notifications_data = list(get_notification_collection().find({"is_deleted": False}).sort("updated_at", -1))
        
        notifications = [NotificationModel(**notification).to_json() for notification in notifications_data]
        
        response = {
            "total_count": len(notifications),
            "data": notifications,
        }

        return format_response(True, "Notifications fetched successfully", response), 200

    except Exception as e:
        logger.exception(f"Error fetching notifications: {e}")
        return format_response(False, "Internal server error"), 500


@jwt_required()
def get_notification_by_id(notification_id):
    """Get notification by ID - Available to all authenticated users"""
    try:
        if not notification_id:
            return format_response(False, "Notification ID is required"), 400

        try:
            ObjectId(notification_id)
        except Exception:
            return format_response(False, "Invalid notification ID format"), 400

        notification_data = get_notification_collection().find_one(
            {"_id": ObjectId(notification_id), "is_deleted": False}
        )

        if not notification_data:
            return format_response(False, "Notification not found"), 404

        notification = NotificationModel(**notification_data).to_json()
        return format_response(True, "Notification fetched successfully", notification), 200

    except Exception as e:
        logger.exception(f"Error fetching notification: {e}")
        return format_response(False, "Internal server error"), 500


@jwt_required()
def add_notification():
    """Create notification - Admin only"""
    try:
        # Check authentication
        user_id = get_jwt_identity()
        if not user_id:
            return format_response(False, "User ID is required"), 400
        
        try:
            user_id = ObjectId(user_id)
        except Exception:
            return format_response(False, "Invalid user ID format"), 400

        # Check admin permission
        jwt_claims = get_jwt()
        if not check_if_admin(jwt_claims):
            return format_response(False, "Permission denied"), 403

        # Get and validate request data
        data = request.get_json()
        if not data:
            return format_response(False, "Missing data"), 400

        try:
            validated_data = NotificationCreateSchema(**data)
        except ValidationError as e:
            error_messages = []
            for error in e.errors():
                field = error['loc'][0]
                message = error['msg']
                error_messages.append(f"{field}: {message}")
            return format_response(False, f"Validation error: {', '.join(error_messages)}"), 400

        # Create notification
        notification = NotificationModel(
            title=validated_data.title,
            content=validated_data.content,
            created_by=user_id,
            updated_by=user_id,
        )
        
        get_notification_collection().insert_one(notification.to_bson())

        logger.info(f"Notification created successfully: {notification.title}")
        return format_response(True, "Notification created successfully"), 201

    except Exception as e:
        logger.exception(f"Error creating notification: {e}")
        return format_response(False, "Internal server error"), 500


@jwt_required()
def update_notification(notification_id):
    """Update notification - Admin only"""
    try:
        # Check authentication
        user_id = get_jwt_identity()
        if not user_id:
            return format_response(False, "User ID is required"), 400
        
        try:
            user_id = ObjectId(user_id)
        except Exception:
            return format_response(False, "Invalid user ID format"), 400

        # Check admin permission
        jwt_claims = get_jwt()
        if not check_if_admin(jwt_claims):
            return format_response(False, "Permission denied"), 403

        # Validate notification ID
        if not notification_id:
            return format_response(False, "Notification ID is required"), 400

        try:
            ObjectId(notification_id)
        except Exception:
            return format_response(False, "Invalid notification ID format"), 400

        # Get and validate request data
        data = request.get_json()
        if not data:
            return format_response(False, "Missing data"), 400

        try:
            validated_data = NotificationUpdateSchema(**data)
        except ValidationError as e:
            error_messages = []
            for error in e.errors():
                field = error['loc'][0]
                message = error['msg']
                error_messages.append(f"{field}: {message}")
            return format_response(False, f"Validation error: {', '.join(error_messages)}"), 400

        # Check if notification exists
        notification_data = get_notification_collection().find_one(
            {"_id": ObjectId(notification_id), "is_deleted": False}
        )
        if not notification_data:
            return format_response(False, "Notification not found"), 404

        # Update notification
        notification = NotificationModel(**notification_data)
        notification.update(
            title=validated_data.title,
            content=validated_data.content,
            updated_by=user_id,
        )

        get_notification_collection().update_one(
            {"_id": ObjectId(notification_id)}, 
            {"$set": notification.to_bson()}
        )

        logger.info(f"Notification updated successfully: {notification.title}")
        return format_response(True, "Notification updated successfully"), 200

    except Exception as e:
        logger.exception(f"Error updating notification: {e}")
        return format_response(False, "Internal server error"), 500


@jwt_required()
def delete_notification(notification_id):
    """Delete notification (soft delete) - Admin only"""
    try:
        # Check authentication
        user_id = get_jwt_identity()
        if not user_id:
            return format_response(False, "User ID is required"), 400
        
        try:
            user_id = ObjectId(user_id)
        except Exception:
            return format_response(False, "Invalid user ID format"), 400

        # Check admin permission
        jwt_claims = get_jwt()
        if not check_if_admin(jwt_claims):
            return format_response(False, "Permission denied"), 403

        # Validate notification ID
        if not notification_id:
            return format_response(False, "Notification ID is required"), 400

        try:
            ObjectId(notification_id)
        except Exception:
            return format_response(False, "Invalid notification ID format"), 400

        # Get and validate request data
        data = request.get_json()
        if not data:
            return format_response(False, "Missing data"), 400

        try:
            validated_data = NotificationDeleteSchema(**data)
        except ValidationError as e:
            error_messages = []
            for error in e.errors():
                field = error['loc'][0]
                message = error['msg']
                error_messages.append(f"{field}: {message}")
            return format_response(False, f"Validation error: {', '.join(error_messages)}"), 400

        # Check if notification exists
        notification_data = get_notification_collection().find_one(
            {"_id": ObjectId(notification_id), "is_deleted": False}
        )
        if not notification_data:
            return format_response(False, "Notification not found"), 404

        # Soft delete notification
        notification = NotificationModel(**notification_data)
        notification.update(
            is_deleted=validated_data.is_deleted,
            updated_by=user_id,
        )

        get_notification_collection().update_one(
            {"_id": ObjectId(notification_id)}, 
            {"$set": notification.to_bson()}
        )

        status_message = "deleted" if validated_data.is_deleted else "restored"
        logger.info(f"Notification {status_message} successfully: {notification.title}")
        return format_response(True, f"Notification {status_message} successfully"), 200

    except Exception as e:
        logger.exception(f"Error deleting notification: {e}")
        return format_response(False, "Internal server error"), 500