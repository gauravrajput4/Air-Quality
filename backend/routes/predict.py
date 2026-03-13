from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any, Dict

import joblib
import pandas as pd
from fastapi import APIRouter, HTTPException

from database.mongodb import PredictionRepository
from ml.train_model import FEATURE_COLUMNS, MODEL_PATH, run_training
from schemas.prediction_schema import EnvironmentalData
from utils.aqi_calculator import categorize_aqi

router = APIRouter()
repository = PredictionRepository()


def _load_model() -> Dict[str, Any]:
    if not Path(MODEL_PATH).exists():
        run_training()
    return joblib.load(MODEL_PATH)


@router.post("/predict")
def predict_aqi(payload: EnvironmentalData) -> Dict[str, Any]:
    try:
        model_bundle = _load_model()
        model = model_bundle["model"]
        features = model_bundle.get("features", FEATURE_COLUMNS)
        df = pd.DataFrame([payload.model_dump()])[features]
        predicted_aqi = float(model.predict(df)[0])

        category, warning, level = categorize_aqi(predicted_aqi)
        record = {
            **payload.model_dump(),
            "predicted_aqi": round(predicted_aqi, 2),
            "pollution_category": category,
            "health_warning": warning,
            "alert_level": level,
            "created_at": datetime.utcnow(),
        }
        repository.add_prediction(record)
        return record
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc


@router.get("/history")
def history(limit: int = 100):
    return {"records": repository.get_history(limit=limit)}
