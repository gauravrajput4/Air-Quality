from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from fastapi import Header, HTTPException

from database.mongodb import UserRepository
from services.auth_service import decode_token, ensure_default_admin


VALID_ROLES = {"admin", "student", "authority"}
user_repository = UserRepository()
ensure_default_admin(user_repository)


@dataclass
class AccessContext:
    user_id: str
    username: str
    role: str
    assigned_campus_id: str | None = None

    @property
    def is_admin(self) -> bool:
        return self.role == "admin"

    @property
    def is_student(self) -> bool:
        return self.role == "student"

    @property
    def is_authority(self) -> bool:
        return self.role == "authority"


def get_access_context(
    authorization: str | None = Header(default=None),
) -> AccessContext:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")

    token = authorization.split(" ", 1)[1].strip()
    payload = decode_token(token)
    user = user_repository.get_user_by_id(payload.get("sub", ""))
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    role = user.get("role", "").strip().lower()
    if role not in VALID_ROLES:
        raise HTTPException(status_code=403, detail="Invalid user role")
    return AccessContext(
        user_id=user["id"],
        username=user["username"],
        role=role,
        assigned_campus_id=user.get("assigned_campus_id"),
    )


def require_roles(*allowed_roles: str) -> Callable[..., AccessContext]:
    allowed = {role.strip().lower() for role in allowed_roles}

    def dependency(
        authorization: str | None = Header(default=None),
    ) -> AccessContext:
        context = get_access_context(authorization=authorization)
        if context.role not in allowed:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return context

    return dependency


def ensure_campus_access(context: AccessContext, campus_id: str) -> None:
    if context.is_admin:
        return
    if context.assigned_campus_id and context.assigned_campus_id == campus_id:
        return
    raise HTTPException(status_code=403, detail="Access denied for this campus")
