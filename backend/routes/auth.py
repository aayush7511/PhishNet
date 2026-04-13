"""Auth routes: register, login, logout, /auth/me."""
import re
import logging
from datetime import datetime, timedelta

import jwt
from flask import Blueprint, request, jsonify, current_app, make_response

from extensions import db, bcrypt
from models.user import User

logger = logging.getLogger(__name__)
auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

TOKEN_COOKIE_NAME = "phishnet_token"
TOKEN_MAX_AGE = 7 * 24 * 60 * 60  # 7 days in seconds

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


# ---------------------------------------------------------------------------
# Shared helper
# ---------------------------------------------------------------------------

def get_current_user():
    """
    Decode the JWT and return the matching User, or None.

    Checks Authorization: Bearer header first, falls back to cookie.
    Never raises — returns None on any auth failure.
    """
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token = auth_header[7:]
    else:
        token = request.cookies.get(TOKEN_COOKIE_NAME)
    if not token:
        return None
    try:
        payload = jwt.decode(
            token,
            current_app.config["SECRET_KEY"],
            algorithms=["HS256"],
        )
        return User.query.get(payload["user_id"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, KeyError):
        return None


def _make_token(user_id: int) -> str:
    """Create a signed JWT for the given user ID."""
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(seconds=TOKEN_MAX_AGE),
    }
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")


def _set_token_cookie(response, token: str) -> None:
    """Attach the auth cookie to a response object."""
    is_prod = current_app.config.get("FLASK_ENV") == "production"
    response.set_cookie(
        TOKEN_COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="None" if is_prod else "Lax",
        secure=is_prod,
        max_age=TOKEN_MAX_AGE,
    )


# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------

def _validate_register(data: dict) -> str | None:
    """Return an error message string, or None if data is valid."""
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""

    if not username or len(username) < 2 or len(username) > 50:
        return "Username must be 2–50 characters"
    if not re.match(r"^[a-zA-Z0-9_]+$", username):
        return "Username may only contain letters, numbers, and underscores"
    if not email or not EMAIL_RE.match(email):
        return "A valid email address is required"
    if not password or len(password) < 8:
        return "Password must be at least 8 characters"
    if not any(c.isupper() for c in password):
        return "Password must contain at least one uppercase letter"
    if not any(c.isdigit() for c in password):
        return "Password must contain at least one digit"
    return None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Create a new user account.

    Body: { "username": str, "email": str, "password": str }
    """
    data = request.get_json(silent=True) or {}
    error = _validate_register(data)
    if error:
        return jsonify({"error": True, "code": "VALIDATION_ERROR", "message": error}), 400

    email = data["email"].strip().lower()
    username = data["username"].strip()

    if User.query.filter_by(email=email).first():
        return jsonify({"error": True, "code": "USER_EXISTS",
                        "message": "An account with that email already exists"}), 409

    if User.query.filter_by(username=username).first():
        return jsonify({"error": True, "code": "USERNAME_TAKEN",
                        "message": "That username is already taken"}), 409

    try:
        password_hash = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
        user = User(username=username, email=email, password_hash=password_hash)
        db.session.add(user)
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        logger.error("Registration DB error: %s", exc)
        return jsonify({"error": True, "code": "SERVER_ERROR",
                        "message": "Registration failed — please try again"}), 500

    return jsonify({"message": "Account created"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticate a user and set the JWT httpOnly cookie.

    Body: { "email": str, "password": str }
    """
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": True, "code": "MISSING_FIELD",
                        "message": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    # Use constant-time comparison to avoid user enumeration
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"error": True, "code": "INVALID_CREDENTIALS",
                        "message": "Invalid email or password"}), 401

    token = _make_token(user.id)
    response = make_response(jsonify({"user": user.to_dict(), "token": token}), 200)
    _set_token_cookie(response, token)
    return response


@auth_bp.route("/logout", methods=["POST"])
def logout():
    """Clear the auth cookie."""
    response = make_response(jsonify({"message": "Logged out"}), 200)
    response.delete_cookie(TOKEN_COOKIE_NAME)
    return response


@auth_bp.route("/me", methods=["GET"])
def me():
    """
    Return the currently authenticated user, or 401 for guests.

    Used by the frontend on mount to restore auth state from the cookie.
    """
    user = get_current_user()
    if not user:
        return jsonify({"error": True, "code": "UNAUTHORIZED",
                        "message": "Not authenticated"}), 401
    return jsonify({"user": user.to_dict()}), 200
