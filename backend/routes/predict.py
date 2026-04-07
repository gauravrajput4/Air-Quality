from __future__ import annotations

from datetime import datetime
from typing import Dict

from fastapi import APIRouter, HTTPException

from database.mongodb import PredictionRepository
from schemas.prediction_schema import EnvironmentalData
from services.ml_service import predict_aqi as predict_aqi_score
from services.notification_service import build_alert

router = APIRouter()
repository = PredictionRepository()


@router.post("/predict")
def predict_aqi(payload: EnvironmentalData) -> Dict[str, Any]:
    try:
        predicted_aqi = predict_aqi_score(payload.model_dump())
        alert = build_alert(predicted_aqi)
        record = {
            **payload.model_dump(),
            "predicted_aqi": round(predicted_aqi, 2),
            "pollution_category": alert["category"],
            "health_warning": alert["health_warning"],
            "alert_level": alert["alert_level"],
            "alert_status": alert["alert_status"],
            "created_at": datetime.utcnow(),
        }
        repository.add_prediction(record)
        return record
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc


@router.get("/history")
def history(limit: int = 100):
    return {"records": repository.get_history(limit=limit)}
