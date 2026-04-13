"""Application configuration loaded from environment variables."""
import os


class Config:
    """Flask application configuration."""

    SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "dev-only-secret-key-change-in-prod")
    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
    DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///phishnet.db")
    FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")
    FLASK_ENV = os.environ.get("FLASK_ENV", "development")

    # SQLAlchemy
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    @property
    def is_production(self):
        """Return True when running in production."""
        return self.FLASK_ENV == "production"
