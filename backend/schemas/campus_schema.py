from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from schemas.prediction_schema import EnvironmentalData


class CampusCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    location: str = Field(..., min_length=2, max_length=120)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class CampusResponse(CampusCreate):
    id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CampusPredictionRequest(EnvironmentalData):
    campus_id: str


class CampusPredictionResponse(BaseModel):
    campus_id: str
    campus: str
    predicted_aqi: float
    category: str
    alert_status: str
    health_warning: str
    timestamp: datetime

