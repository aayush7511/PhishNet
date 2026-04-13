"""User database model."""
from datetime import datetime
from extensions import db


class User(db.Model):
    """Registered user account."""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    password_hash = db.Column(db.String(72), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    scans = db.relationship(
        "Scan", backref="user", lazy=True, cascade="all, delete-orphan"
    )

    def to_dict(self):
        """Return a safe public representation (no password hash)."""
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat(),
        }
