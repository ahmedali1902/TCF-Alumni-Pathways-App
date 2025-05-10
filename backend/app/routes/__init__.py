from .auth_routes import auth_bp
from .institute_routes import institute_bp
from .resource_routes import resource_bp


def register_routes(bp):
    bp.register_blueprint(auth_bp)
    bp.register_blueprint(institute_bp)
    bp.register_blueprint(resource_bp)
