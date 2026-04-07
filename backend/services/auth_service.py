from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from fastapi import HTTPException

from database.mongodb import UserRepository


TOKEN_TTL_HOURS = int(os.getenv("AUTH_TOKEN_TTL_HOURS", "12"))


def _secret_key() -> bytes:
    return os.getenv("AUTH_SECRET", "change-this-secret-in-production").encode("utf-8")


def hash_password(password: str, salt: str | None = None) -> str:
    password_salt = salt or secrets.token_hex(16)
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), password_salt.encode("utf-8"), 120000)
    return f"{password_salt}${base64.urlsafe_b64encode(derived).decode('utf-8')}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
      salt, _ = password_hash.split("$", 1)
    except ValueError:
      return False
    expected = hash_password(password, salt)
    return hmac.compare_digest(expected, password_hash)


def create_token(payload: Dict[str, Any]) -> str:
    token_payload = dict(payload)
    token_payload["exp"] = (datetime.now(timezone.utc) + timedelta(hours=TOKEN_TTL_HOURS)).timestamp()
    raw_payload = json.dumps(token_payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    encoded_payload = base64.urlsafe_b64encode(raw_payload).decode("utf-8").rstrip("=")
    signature = hmac.new(_secret_key(), encoded_payload.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{encoded_payload}.{signature}"


def decode_token(token: str) -> Dict[str, Any]:
    try:
        encoded_payload, signature = token.split(".", 1)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Invalid token format") from exc

    expected_signature = hmac.new(_secret_key(), encoded_payload.encode("utf-8"), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected_signature):
        raise HTTPException(status_code=401, detail="Invalid token signature")

    padded = encoded_payload + "=" * (-len(encoded_payload) % 4)
    payload = json.loads(base64.urlsafe_b64decode(padded.encode("utf-8")).decode("utf-8"))
    if payload.get("exp", 0) < datetime.now(timezone.utc).timestamp():
        raise HTTPException(status_code=401, detail="Token expired")
    return payload


def sanitize_user(user: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": user["id"],
        "username": user["username"],
        "role": user["role"],
        "assigned_campus_id": user.get("assigned_campus_id"),
        "created_at": user["created_at"],
        "created_by": user.get("created_by"),
    }


def ensure_default_admin(user_repository: UserRepository) -> Dict[str, Any]:
    admin_username = os.getenv("ADMIN_USERNAME", "admin")
    admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
    existing_admin = user_repository.get_user_by_username(admin_username)
    if existing_admin:
        return existing_admin

    return user_repository.add_user(
        {
            "username": admin_username,
            "password_hash": hash_password(admin_password),
            "role": "admin",
            "assigned_campus_id": None,
            "created_at": datetime.utcnow(),
            "created_by": "system",
        }
    )

