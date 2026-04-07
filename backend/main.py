from __future__ import annotations

from fastapi import FastAPI
from fastapi import Depends
from fastapi.middleware.cors import CORSMiddleware

from ml.train_model import create_synthetic_dataset
from routes.analyze import router as analyze_router
from routes.auth import router as auth_router
from routes.campus import router as campus_router
from routes.predict import router as predict_router
from routes.realtime import router as realtime_router
from routes.users import router as users_router
from services.access_control import AccessContext, get_access_context

app = FastAPI(title="Campus Air Quality Alert System API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router)
app.include_router(analyze_router)
app.include_router(realtime_router)
app.include_router(campus_router)
app.include_router(auth_router)
app.include_router(users_router)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "campus-air-quality-api"}


@app.get("/access/me")
def access_me(context: AccessContext = Depends(get_access_context)):
    return {
        "role": context.role,
        "assigned_campus_id": context.assigned_campus_id,
    }


@app.api_route("/generate-sample", methods=["GET", "POST"])
def generate_sample():
    sample = create_synthetic_dataset(samples=1).iloc[0].to_dict()
    return {"sample": {k: round(v, 2) for k, v in sample.items() if k != "aqi"}}
