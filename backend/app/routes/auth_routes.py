from flask import Blueprint

from ..controllers import auth_controller

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

# Admin Routes
auth_bp.route("/admin/register", methods=["POST"])(auth_controller.register_admin)
auth_bp.route("/admin/login", methods=["POST"])(auth_controller.login_admin)
auth_bp.route("/admin/reset-password", methods=["POST"])(
    auth_controller.reset_admin_password
)
auth_bp.route("/admin/update-password", methods=["POST"])(
    auth_controller.update_admin_password
)
auth_bp.route("/admin/verify-token", methods=["GET"])(
    auth_controller.verify_admin_token
)

# Normal User Routes
auth_bp.route("/login", methods=["POST"])(auth_controller.login_user)
