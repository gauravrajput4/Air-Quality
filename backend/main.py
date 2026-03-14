from __future__ import annotations

from fastapi import FastAPI

from ml.train_model import create_synthetic_dataset
from routes.analyze import router as analyze_router
from routes.predict import router as predict_router
from routes.realtime import router as realtime_router

app = FastAPI(title="Campus Air Quality Alert System API", version="1.0.0")

app.include_router(predict_router)
app.include_router(analyze_router)
app.include_router(realtime_router)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "campus-air-quality-api"}


@app.post("/generate-sample")
def generate_sample():
    sample = create_synthetic_dataset(samples=1).iloc[0].to_dict()
    return {"sample": {k: round(v, 2) for k, v in sample.items() if k != "aqi"}}
