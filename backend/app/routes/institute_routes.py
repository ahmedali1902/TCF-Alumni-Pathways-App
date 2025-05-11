from flask import Blueprint

from ..controllers import institute_controller

institute_bp = Blueprint("institute", __name__, url_prefix="/institute")

institute_bp.route("", methods=["GET"])(institute_controller.get_institutes)
institute_bp.route("/<string:institute_id>", methods=["GET"])(
    institute_controller.get_institute_by_id
)
institute_bp.route("/<string:institute_id>/rating", methods=["POST"])(
    institute_controller.rate_institute
)
institute_bp.route("", methods=["POST"])(institute_controller.add_institute)
institute_bp.route("/<string:institute_id>", methods=["PUT"])(
    institute_controller.update_institute
)
institute_bp.route("/<string:institute_id>", methods=["DELETE"])(
    institute_controller.delete_institute
)
