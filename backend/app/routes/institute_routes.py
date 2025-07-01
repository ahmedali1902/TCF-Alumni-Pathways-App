from flask import Blueprint

from ..controllers import institute_add_request_controller, institute_controller

institute_bp = Blueprint("institute", __name__, url_prefix="/institute")

institute_bp.route("", methods=["GET"])(institute_controller.get_institutes)
institute_bp.route("/<string:institute_id>", methods=["GET"])(
    institute_controller.get_institute_by_id
)
institute_bp.route("", methods=["POST"])(institute_controller.add_institute)
institute_bp.route("/<string:institute_id>", methods=["PUT"])(
    institute_controller.update_institute
)
institute_bp.route("/<string:institute_id>", methods=["DELETE"])(
    institute_controller.delete_institute
)

institute_bp.route("/add-request", methods=["GET"])(
    institute_add_request_controller.get_institute_add_requests
)
institute_bp.route("/add-request/<string:request_id>", methods=["GET"])(
    institute_add_request_controller.get_institute_add_request_by_id
)
institute_bp.route("/add-request", methods=["POST"])(
    institute_add_request_controller.create_institute_add_request
)
institute_bp.route("/add-request/<string:request_id>", methods=["PUT"])(
    institute_add_request_controller.toggle_processed_institute_add_request
)
institute_bp.route("/add-request/<string:request_id>", methods=["DELETE"])(
    institute_add_request_controller.delete_institute_add_request
)
