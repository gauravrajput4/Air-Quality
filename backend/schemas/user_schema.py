from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=64)
    password: str = Field(..., min_length=6, max_length=128)


class UserCreateRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=64)
    password: str = Field(..., min_length=6, max_length=128)
    role: str = Field(..., pattern="^(student|authority)$")
    assigned_campus_id: str | None = None


class UserResponse(BaseModel):
    id: str
    username: str
    role: str
    assigned_campus_id: str | None = None
    created_at: datetime
    created_by: str | None = None

