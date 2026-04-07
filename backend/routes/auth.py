from __future__ import annotations

from fastapi import APIRouter, HTTPException

from database.mongodb import UserRepository
from schemas.user_schema import LoginRequest
from services.auth_service import create_token, ensure_default_admin, sanitize_user, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])
user_repository = UserRepository()
ensure_default_admin(user_repository)


@router.post("/login")
def login(payload: LoginRequest):
    user = user_repository.get_user_by_username(payload.username)
    if user is None or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_token(
        {
            "sub": user["id"],
            "username": user["username"],
            "role": user["role"],
            "assigned_campus_id": user.get("assigned_campus_id"),
        }
    )
    return {
        "token": token,
        "user": sanitize_user(user),
    }

