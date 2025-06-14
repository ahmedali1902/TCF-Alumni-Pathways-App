from flask import Blueprint

from ..controllers import app_feedback_controller

app_feedback_bp = Blueprint("app_feedback", __name__, url_prefix="/app-feedback")

app_feedback_bp.route("", methods=["GET"])(app_feedback_controller.get_app_feedbacks)
app_feedback_bp.route("/<string:feedback_id>", methods=["GET"])(
    app_feedback_controller.get_app_feedback_by_id
)
app_feedback_bp.route("", methods=["POST"])(app_feedback_controller.create_app_feedback)
app_feedback_bp.route("/<string:feedback_id>", methods=["PUT"])(
    app_feedback_controller.toggle_processed_app_feedback
)
app_feedback_bp.route("/<string:feedback_id>", methods=["DELETE"])(
    app_feedback_controller.delete_app_feedback
)
