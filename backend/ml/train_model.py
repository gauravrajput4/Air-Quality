from __future__ import annotations

from pathlib import Path
from typing import Dict, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

FEATURE_COLUMNS = [
    "temperature",
    "humidity",
    "wind_speed",
    "pm2_5",
    "pm10",
    "no2",
    "co",
    "so2",
    "o3",
]
TARGET_COLUMN = "aqi"

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR.parent / "data" / "air_quality_data.csv"
MODEL_PATH = BASE_DIR / "model.pkl"
METRICS_PATH = BASE_DIR / "metrics.json"


def create_synthetic_dataset(samples: int = 1200, random_state: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(random_state)

    temperature = rng.normal(28, 6, samples).clip(8, 45)
    humidity = rng.normal(60, 15, samples).clip(20, 95)
    wind_speed = rng.normal(6, 2.5, samples).clip(0.1, 20)

    pm2_5 = rng.normal(50, 25, samples).clip(5, 260)
    pm10 = (pm2_5 * rng.normal(1.35, 0.25, samples)).clip(10, 350)
    no2 = rng.normal(42, 18, samples).clip(5, 160)
    co = rng.normal(1.8, 0.8, samples).clip(0.2, 9)
    so2 = rng.normal(18, 8, samples).clip(1, 90)
    o3 = rng.normal(58, 20, samples).clip(10, 190)

    noise = rng.normal(0, 10, samples)
    aqi = (
        0.42 * pm2_5
        + 0.24 * pm10
        + 0.18 * no2
        + 9.0 * co
        + 0.1 * so2
        + 0.08 * o3
        - 0.7 * wind_speed
        + 0.12 * humidity
        + noise
    ).clip(15, 500)

    df = pd.DataFrame(
        {
            "temperature": temperature,
            "humidity": humidity,
            "wind_speed": wind_speed,
            "pm2_5": pm2_5,
            "pm10": pm10,
            "no2": no2,
            "co": co,
            "so2": so2,
            "o3": o3,
            "aqi": aqi,
        }
    )
    return df


def load_dataset(path: Path = DATA_PATH) -> pd.DataFrame:
    if path.exists():
        return pd.read_csv(path)

    path.parent.mkdir(parents=True, exist_ok=True)
    df = create_synthetic_dataset()
    df.to_csv(path, index=False)
    return df


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    df = df.drop_duplicates().copy()
    df = df.ffill().fillna(df.mean(numeric_only=True))
    return df


def train_and_select(df: pd.DataFrame) -> Tuple[object, Dict[str, Dict[str, float]]]:
    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    models = {
        "random_forest": RandomForestRegressor(n_estimators=250, random_state=42),
        "linear_regression": LinearRegression(),
    }

    metrics: Dict[str, Dict[str, float]] = {}
    best_name = ""
    best_score = float("-inf")

    for name, model in models.items():
        model.fit(X_train, y_train)
        pred = model.predict(X_test)
        mse = mean_squared_error(y_test, pred)
        r2 = r2_score(y_test, pred)
        metrics[name] = {"mse": float(mse), "r2": float(r2)}
        if r2 > best_score:
            best_score = r2
            best_name = name

    best_model = models[best_name]
    metrics["selected_model"] = {"name": best_name, "r2": best_score}
    return best_model, metrics


def save_artifacts(model: object, metrics: Dict[str, Dict[str, float]]) -> None:
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": model, "features": FEATURE_COLUMNS}, MODEL_PATH)
    import json

    METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding="utf-8")


def run_training() -> Dict[str, Dict[str, float]]:
    df = load_dataset()
    clean_df = clean_data(df)
    model, metrics = train_and_select(clean_df)
    save_artifacts(model, metrics)
    return metrics


if __name__ == "__main__":
    run_metrics = run_training()
    print("Training complete")
    print(run_metrics)
