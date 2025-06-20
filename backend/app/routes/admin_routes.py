from flask import Blueprint

from ..controllers import admin_controller

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

admin_bp.route("/dashboard", methods=["GET"])(admin_controller.get_dashboard)
admin_bp.route("/user", methods=["GET"])(admin_controller.get_admin_users)
