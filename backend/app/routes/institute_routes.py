from flask import Blueprint

from ..controllers import institute_controller

institute_bp = Blueprint("institute", __name__, url_prefix="/institute")

institute_bp.route("", methods=["GET"])(institute_controller.get_institutes)
institute_bp.route("/<string:institute_id>", methods=["GET"])(
    institute_controller.get_institute_by_id
)
