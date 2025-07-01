import asyncio
import logging
import math
import time  # Add this import for timestamp in FCM
from typing import Dict, List, Optional

from bson import ObjectId
from flask import request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
from pydantic.v1 import BaseModel, Field, ValidationError, validator

from ..extensions import mongo
from ..helpers.auth_helper import check_if_admin
from ..helpers.fcm_helper import get_fcm_service
from ..helpers.response_helper import format_response
from ..models.notification_model import NotificationModel

logger = logging.getLogger(__name__)

def get_notification_collection():
    """Get notification collection - ensures mongo is initialized"""
    return mongo.db.Notification

def get_user_collection():
    """Get user collection - ensures mongo is initialized"""
    return mongo.db.User


class NotificationCreateSchema(BaseModel):
    title: str = Field(..., min_length=1, max_length=39)
    content: str = Field(..., min_length=1, max_length=150)
    image_url: str = Field(None, max_length=200)  # Optional field for image URL

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

    @validator('image_url')
    def validate_image_url(cls, v):
        if v and len(v) > 200:
            raise ValueError('Image URL cannot exceed 200 characters')
        #check https
        if v and not v.startswith('https://'):
            raise ValueError('Image URL must start with https://')
        return v.strip() if v else None


class NotificationUpdateSchema(BaseModel):
    title: str = Field(..., min_length=1, max_length=39)
    content: str = Field(..., min_length=1, max_length=150)
    image_url: str = Field(None, max_length=200)  # Optional field for image URL

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

    @validator('image_url', pre=True, always=True)
    def validate_image_url(cls, v):
        if v and len(v) > 200:
            raise ValueError('Image URL cannot exceed 200 characters')
        # Check if the image URL starts with https://
        if v and not v.startswith('https://'):
            raise ValueError('Image URL must start with https://')
        return v.strip() if v else None


class NotificationDeleteSchema(BaseModel):
    is_deleted: bool = Field(...)

    @validator('is_deleted')
    def validate_is_deleted(cls, v):
        if not isinstance(v, bool):
            raise ValueError('is_deleted must be a boolean value')
        return v


def _get_active_user_fcm_tokens():
    """
    Get FCM tokens for all active users
    
    Returns:
        List of FCM tokens for users where is_deleted=False and fcm_token is not null
    """
    try:
        # Query users where is_deleted is False and fcm_token exists and is not null
        users = get_user_collection().find(
            {
                "is_deleted": False,
                "fcm_token": {"$ne": None, "$exists": True, "$ne": ""}
            },
            {"fcm_token": 1}  # Only fetch fcm_token field
        )
        
        fcm_tokens = [user["fcm_token"] for user in users if user.get("fcm_token")]
        logger.info(f"Found {len(fcm_tokens)} active users with FCM tokens")
        return fcm_tokens
        
    except Exception as e:
        logger.error(f"Error fetching user FCM tokens: {e}")
        return []


def _send_push_notification_sync(title: str, content: str, image_url: str = None):
    """
    Send push notification to all active users (SYNCHRONOUS)
    
    Args:
        title: Notification title
        content: Notification content
        image_url: Optional image URL
    """
    try:
        # Get FCM tokens for active users
        fcm_tokens = _get_active_user_fcm_tokens()
        if not fcm_tokens:
            logger.info("No active users with FCM tokens found")
            return
        
        # Get FCM service and send notifications
        fcm_service = get_fcm_service()
        
        # Prepare data payload
        notification_data = {
            'notification_type': 'admin_notification',
            'timestamp': str(int(time.time())),
        }
        
        # Add image URL if provided
        if image_url:
            notification_data['image_url'] = image_url
        
        # Send in batches if there are many tokens (FCM has a limit of 500 tokens per request)
        batch_size = 500
        total_success = 0
        total_failure = 0
        all_failed_tokens = []
        
        for i in range(0, len(fcm_tokens), batch_size):
            batch_tokens = fcm_tokens[i:i + batch_size]
            
            result = fcm_service.send_to_multiple_tokens(
                tokens=batch_tokens,
                title=title,
                body=content,
                data=notification_data
            )
            
            total_success += result['success_count']
            total_failure += result['failure_count']
            all_failed_tokens.extend(result['failed_tokens'])
        
        # Log results
        logger.info(
            f"Push notification sent: {total_success} successful, {total_failure} failed "
            f"out of {len(fcm_tokens)} total tokens"
        )
        
        # Log failed tokens for debugging
        if all_failed_tokens:
            logger.warning(f"Failed FCM tokens: {len(all_failed_tokens)} tokens failed")
            for failed_token in all_failed_tokens:
                logger.warning(f"Failed token: {failed_token['token'][:20]}... Error: {failed_token['error']}")
        
    except Exception as e:
        logger.error(f"Error sending push notifications: {e}")


@jwt_required()
def get_notifications():
    """Get all notifications - Available to all authenticated users"""
    try:
        # Pagination parameters
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        skip = (page - 1) * limit

        # Build match criteria - only show active notifications
        match_criteria = {"is_deleted": False}

        # Aggregation pipeline for pagination and counting
        pipeline = [
            {"$match": match_criteria},
            {
                "$facet": {
                    "totalCount": [{"$count": "count"}],
                    "paginatedResults": [
                        {"$sort": {"created_at": -1}},
                        {"$skip": skip},
                        {"$limit": limit},
                    ],
                }
            },
        ]
        
        notifications_data = list(get_notification_collection().aggregate(pipeline))
        
        if notifications_data and len(notifications_data) > 0:
            result = notifications_data[0]
            
            # Extract total count
            if result.get("totalCount") and len(result["totalCount"]) > 0:
                total_count = result["totalCount"][0]["count"]
            else:
                total_count = 0
            
            # Extract paginated results
            notifications_list = result.get("paginatedResults", [])
            notifications = [NotificationModel(**notification).to_json() for notification in notifications_list]
            total_pages = math.ceil(total_count / limit) if total_count > 0 else 0
        else:
            total_count = 0
            notifications = []
            total_pages = 0

        response = {
            "total_count": total_count,
            "total_pages": total_pages,
            "page": page,
            "limit": limit,
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
            image_url=validated_data.image_url,
            created_by=user_id,
            updated_by=user_id,
        )
        
        # Save to database first
        get_notification_collection().insert_one(notification.to_bson())
        logger.info(f"Notification created successfully in database: {notification.title}")

        # Send push notification to all active users in background
        try:
            _send_push_notification_sync(
                title=notification.title,
                content=notification.content,
                image_url=notification.image_url
            )
            logger.info("Push notification dispatch initiated")
        except Exception as fcm_error:
            # Log FCM error but don't fail the entire operation
            logger.error(f"Failed to initiate push notifications: {fcm_error}")
            # Note: We still return success since the notification was created in DB

        return format_response(True, "Notification created successfully"), 201

    except Exception as e:
        logger.exception(f"Error creating notification: {e}")
        return format_response(False, "Internal server error"), 5


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
            image_url=validated_data.image_url,
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