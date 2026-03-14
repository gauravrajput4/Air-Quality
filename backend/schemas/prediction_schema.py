from datetime import datetime
from pydantic import BaseModel, Field


class EnvironmentalData(BaseModel):
    temperature: float = Field(..., ge=-20, le=60)
    humidity: float = Field(..., ge=0, le=100)
    wind_speed: float = Field(..., ge=0)
    pm2_5: float = Field(..., ge=0)
    pm10: float = Field(..., ge=0)
    no2: float = Field(..., ge=0)
    co: float = Field(..., ge=0)
    so2: float = Field(..., ge=0)
    o3: float = Field(..., ge=0)


class PredictionRecord(EnvironmentalData):
    predicted_aqi: float
    pollution_category: str
    health_warning: str
    alert_level: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
