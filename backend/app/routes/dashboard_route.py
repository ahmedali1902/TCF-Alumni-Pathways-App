from flask import Blueprint

from ..controllers import dashboard_controller

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")

dashboard_bp.route("", methods=["GET"])(dashboard_controller.get_dashboard)
dashboard_bp.route("/institute", methods=["GET"])(dashboard_controller.get_institutes)
dashboard_bp.route("/resource", methods=["GET"])(dashboard_controller.get_resources)
