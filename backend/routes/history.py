"""GET /history — return scan history for the authenticated user."""
import logging

from flask import Blueprint, jsonify

from models.scan import Scan
from routes.auth import get_current_user

logger = logging.getLogger(__name__)
history_bp = Blueprint("history", __name__)

HISTORY_LIMIT = 50


@history_bp.route("/history", methods=["GET"])
def get_history():
    """
    Return the 50 most recent scans for the authenticated user.

    Auth: required. Returns 401 for unauthenticated requests.
    """
    user = get_current_user()
    if not user:
        return jsonify({"error": True, "code": "UNAUTHORIZED",
                        "message": "Authentication required"}), 401

    scans = (
        Scan.query
        .filter_by(user_id=user.id)
        .order_by(Scan.created_at.desc())
        .limit(HISTORY_LIMIT)
        .all()
    )

    return jsonify({"scans": [s.to_dict() for s in scans]}), 200
