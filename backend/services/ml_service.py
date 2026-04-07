from __future__ import annotations

from functools import lru_cache
from typing import Any, Dict, Iterable

import joblib
import pandas as pd

from ml.train_model import FEATURE_COLUMNS, MODEL_PATH, run_training


@lru_cache(maxsize=1)
def load_model_bundle() -> Dict[str, Any]:
    if not MODEL_PATH.exists():
        run_training()
    return joblib.load(MODEL_PATH)


def predict_aqi(payload: Dict[str, Any]) -> float:
    model_bundle = load_model_bundle()
    model = model_bundle["model"]
    features: Iterable[str] = model_bundle.get("features", FEATURE_COLUMNS)
    frame = pd.DataFrame([payload])[list(features)]
    return float(model.predict(frame)[0])

