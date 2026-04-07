from __future__ import annotations

from datetime import datetime
from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException

from database.mongodb import CampusRepository, UserRepository
from schemas.user_schema import UserCreateRequest
from services.access_control import AccessContext, require_roles
from services.auth_service import hash_password, sanitize_user

router = APIRouter(prefix="/users", tags=["users"])
user_repository = UserRepository()
campus_repository = CampusRepository()


@router.post("")
def create_user(payload: UserCreateRequest, context: AccessContext = Depends(require_roles("admin"))) -> Dict:
    existing = user_repository.get_user_by_username(payload.username)
    if existing is not None:
        raise HTTPException(status_code=409, detail="Username already exists")

    if payload.assigned_campus_id:
        campus = campus_repository.get_campus(payload.assigned_campus_id)
        if campus is None:
            raise HTTPException(status_code=404, detail="Assigned campus not found")

    user = user_repository.add_user(
        {
            "username": payload.username,
            "password_hash": hash_password(payload.password),
            "role": payload.role,
            "assigned_campus_id": payload.assigned_campus_id,
            "created_at": datetime.utcnow(),
            "created_by": context.username,
        }
    )
    return sanitize_user(user)


@router.get("")
def list_users(_: AccessContext = Depends(require_roles("admin"))) -> List[Dict]:
    return [sanitize_user(user) for user in user_repository.list_users()]

