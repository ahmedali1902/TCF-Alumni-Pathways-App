from .admin_routes import admin_bp
from .app_feedback_routes import app_feedback_bp
from .auth_routes import auth_bp
from .institute_routes import institute_bp
from .resource_routes import resource_bp
from .notification_routes import notification_bp
from .user_routes import user_bp


def register_routes(bp):
    bp.register_blueprint(app_feedback_bp)
    bp.register_blueprint(auth_bp)
    bp.register_blueprint(institute_bp)
    bp.register_blueprint(resource_bp)
    bp.register_blueprint(admin_bp)
    bp.register_blueprint(notification_bp)
    bp.register_blueprint(user_bp)
