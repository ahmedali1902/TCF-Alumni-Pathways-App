from flask import Blueprint

from ..controllers import user_controller

user_bp = Blueprint("user", __name__, url_prefix="/user")

# Get all users with pagination and filtering
user_bp.route("", methods=["GET"])(user_controller.get_users)

# Get specific user by ID
user_bp.route("/<string:user_id>", methods=["GET"])(user_controller.get_user_by_id)

# Soft delete user
user_bp.route("/<string:user_id>", methods=["DELETE"])(user_controller.delete_user)
