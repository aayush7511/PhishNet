"""Scan history database model."""
import json
from datetime import datetime
from extensions import db


class Scan(db.Model):
    """A single phishing analysis result belonging to a user."""

    __tablename__ = "scans"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    risk_level = db.Column(db.String(10), nullable=False)
    risk_label = db.Column(db.String(60), nullable=False)
    findings = db.Column(db.Text, nullable=False)   # JSON-serialised list
    ai_reasoning = db.Column(db.Text)
    email_preview = db.Column(db.String(200))       # first 200 chars of raw email
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        """Return a serialisable dict for the history API response."""
        return {
            "id": self.id,
            "score": self.score,
            "risk_level": self.risk_level,
            "risk_label": self.risk_label,
            "findings": json.loads(self.findings),
            "ai_reasoning": self.ai_reasoning,
            "email_preview": self.email_preview,
            "created_at": self.created_at.isoformat(),
        }
