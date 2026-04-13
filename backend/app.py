"""Flask application factory."""
import logging
import os

from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from extensions import db, bcrypt

logging.basicConfig(level=logging.INFO)


def create_app(config_class=Config):
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # -----------------------------------------------------------------------
    # CORS — must be configured before any request reaches a route
    # -----------------------------------------------------------------------
    frontend_origin = app.config.get("FRONTEND_ORIGIN", "http://localhost:5173")
    # Support comma-separated list of origins (e.g. web app + extension)
    allowed_origins = [o.strip() for o in frontend_origin.split(",") if o.strip()]

    CORS(
        app,
        origins=allowed_origins,
        supports_credentials=True,
        methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
    )

    # -----------------------------------------------------------------------
    # Extensions
    # -----------------------------------------------------------------------
    db.init_app(app)
    bcrypt.init_app(app)

    # -----------------------------------------------------------------------
    # Blueprints
    # -----------------------------------------------------------------------
    from routes.analyze import analyze_bp
    from routes.auth import auth_bp
    from routes.history import history_bp

    app.register_blueprint(analyze_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(history_bp)

    # -----------------------------------------------------------------------
    # Database — create tables if they don't exist
    # -----------------------------------------------------------------------
    with app.app_context():
        # Import models so SQLAlchemy is aware of them
        from models import User, Scan  # noqa: F401
        db.create_all()

    # -----------------------------------------------------------------------
    # Global error handlers
    # -----------------------------------------------------------------------
    @app.route("/health")
    def health():
        return jsonify({"status": "ok"}), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": True, "code": "NOT_FOUND", "message": "Endpoint not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"error": True, "code": "METHOD_NOT_ALLOWED", "message": str(e)}), 405

    @app.errorhandler(Exception)
    def handle_unexpected(e):
        app.logger.error("Unhandled exception: %s", e, exc_info=True)
        return jsonify({"error": True, "code": "SERVER_ERROR",
                        "message": "An internal error occurred"}), 500

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    is_dev = os.environ.get("FLASK_ENV", "development") == "development"
    app.run(host="0.0.0.0", port=port, debug=is_dev, use_reloader=is_dev)
