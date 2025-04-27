from app.routes.auth_routes import auth_bp

def register_routes(bp):
    bp.register_blueprint(auth_bp)