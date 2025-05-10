from flask import Blueprint

from ..controllers import resource_controller

resource_bp = Blueprint("resource", __name__, url_prefix="/resource")

resource_bp.route("", methods=["GET"])(resource_controller.get_resources)
resource_bp.route("/<string:resource_id>", methods=["GET"])(
    resource_controller.get_resource_by_id
)
