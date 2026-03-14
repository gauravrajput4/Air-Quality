from __future__ import annotations

from datetime import datetime
from typing import Any, Dict

import joblib
import pandas as pd
from fastapi import APIRouter, HTTPException, Query

from database.mongodb import PredictionRepository
from ml.train_model import FEATURE_COLUMNS, MODEL_PATH, run_training
from services_weather import fetch_realtime_environment
from utils.aqi_calculator import categorize_aqi

router = APIRouter()
repository = PredictionRepository()


def _load_model() -> Dict[str, Any]:
    if not MODEL_PATH.exists():
        run_training()
    return joblib.load(MODEL_PATH)


@router.get("/realtime")
async def realtime_aqi(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
):
    try:
        payload = await fetch_realtime_environment(latitude=latitude, longitude=longitude)
        model_bundle = _load_model()
        model = model_bundle["model"]
        features = model_bundle.get("features", FEATURE_COLUMNS)
        frame = pd.DataFrame([payload])[features]
        predicted_aqi = float(model.predict(frame)[0])
        category, warning, level = categorize_aqi(predicted_aqi)

        record = {
            **payload,
            "predicted_aqi": round(predicted_aqi, 2),
            "pollution_category": category,
            "health_warning": warning,
            "alert_level": level,
            "latitude": latitude,
            "longitude": longitude,
            "created_at": datetime.utcnow(),
            "source": "open-meteo",
        }
        repository.add_prediction(record)
        return record
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Realtime fetch failed: {exc}") from exc
