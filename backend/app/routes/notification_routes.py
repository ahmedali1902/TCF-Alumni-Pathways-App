from flask import Blueprint

from ..controllers import notification_controller

notification_bp = Blueprint("notification", __name__, url_prefix="/notification")

notification_bp.route("", methods=["GET"])(notification_controller.get_notifications)
notification_bp.route("/<string:notification_id>", methods=["GET"])(
    notification_controller.get_notification_by_id
)
notification_bp.route("", methods=["POST"])(notification_controller.add_notification)
notification_bp.route("/<string:notification_id>", methods=["PUT"])(
    notification_controller.update_notification
)
notification_bp.route("/<string:notification_id>", methods=["PATCH"])(
    notification_controller.delete_notification
)
