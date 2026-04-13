"""POST /analyze — run phishing analysis and optionally save to history."""
import json
import logging

from flask import Blueprint, request, jsonify, current_app

from analysis.pipeline import run_analysis
from extensions import db
from models.scan import Scan

logger = logging.getLogger(__name__)
analyze_bp = Blueprint("analyze", __name__)

MAX_EMAIL_LENGTH = 50_000


def _get_current_user():
    """Import lazily to avoid circular imports."""
    from routes.auth import get_current_user
    return get_current_user()


def _save_scan(result: dict, email_text: str, user) -> None:
    """
    Persist a scan result to the database for an authenticated user.

    Failures are swallowed — a DB error must never fail the analyze response.
    """
    try:
        scan = Scan(
            user_id=user.id,
            score=result["score"],
            risk_level=result["risk_level"],
            risk_label=result["risk_label"],
            findings=json.dumps(result["findings"]),
            ai_reasoning=result.get("ai_reasoning"),
            email_preview=email_text[:200],
        )
        db.session.add(scan)
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        logger.error("Failed to save scan for user %s: %s", user.id, exc)


@analyze_bp.route("/analyze", methods=["POST"])
def analyze():
    """
    Analyze an email for phishing signals.

    Body: { "email_text": string }
    Auth: optional — guests can scan, logged-in users get scan saved to history.
    """
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": True, "code": "MISSING_FIELD",
                        "message": "Request body must include email_text"}), 400

    if "email_text" not in data:
        return jsonify({"error": True, "code": "MISSING_FIELD",
                        "message": "email_text is required"}), 400

    email_text = data["email_text"]

    if not isinstance(email_text, str) or not email_text.strip():
        return jsonify({"error": True, "code": "EMPTY_INPUT",
                        "message": "Email text is required and must not be blank"}), 400

    if len(email_text) > MAX_EMAIL_LENGTH:
        return jsonify({"error": True, "code": "INPUT_TOO_LONG",
                        "message": f"Email text must not exceed {MAX_EMAIL_LENGTH:,} characters"}), 400

    result = run_analysis(email_text)

    # Persist if authenticated (best-effort)
    try:
        user = _get_current_user()
        if user:
            _save_scan(result, email_text, user)
    except Exception as exc:
        logger.warning("Could not retrieve current user for scan save: %s", exc)

    return jsonify(result), 200
