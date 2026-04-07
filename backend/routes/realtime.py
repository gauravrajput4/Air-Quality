from __future__ import annotations

from datetime import datetime
from typing import Dict

from fastapi import APIRouter, HTTPException, Query

from database.mongodb import PredictionRepository
from services.environmental_data_service import fetch_realtime_environment
from services.ml_service import predict_aqi as predict_aqi_score
from services.notification_service import build_alert

router = APIRouter()
repository = PredictionRepository()


@router.get("/realtime")
async def realtime_aqi(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
):
    try:
        payload = await fetch_realtime_environment(latitude=latitude, longitude=longitude)
        payload_for_model = {key: value for key, value in payload.items() if key in {"temperature", "humidity", "wind_speed", "pm2_5", "pm10", "no2", "co", "so2", "o3"}}
        predicted_aqi = predict_aqi_score(payload_for_model)
        alert = build_alert(predicted_aqi)

        record = {
            **payload,
            "predicted_aqi": round(predicted_aqi, 2),
            "pollution_category": alert["category"],
            "health_warning": alert["health_warning"],
            "alert_level": alert["alert_level"],
            "alert_status": alert["alert_status"],
            "latitude": latitude,
            "longitude": longitude,
            "created_at": datetime.utcnow(),
            "source": ",".join(payload.get("sources", ["open-meteo"])),
        }
        repository.add_prediction(record)
        return record
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Realtime fetch failed: {exc}") from exc
