from __future__ import annotations

from fastapi import APIRouter

from schemas.prediction_schema import EnvironmentalData
from utils.aqi_calculator import categorize_aqi

router = APIRouter()


@router.post("/analyze")
def analyze_environment(payload: EnvironmentalData):
    rough_aqi = (
        0.4 * payload.pm2_5
        + 0.25 * payload.pm10
        + 0.2 * payload.no2
        + 10 * payload.co
        + 0.1 * payload.so2
        + 0.1 * payload.o3
        - 0.8 * payload.wind_speed
        + 0.05 * payload.humidity
    )
    category, warning, level = categorize_aqi(rough_aqi)
    return {
        "estimated_aqi": round(rough_aqi, 2),
        "pollution_category": category,
        "health_warning": warning,
        "alert_level": level,
    }
