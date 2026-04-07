from __future__ import annotations

from datetime import datetime
from math import atan2, cos, radians, sin, sqrt
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Query

from database.mongodb import AirQualityRepository, CampusRepository
from schemas.campus_schema import CampusCreate, CampusPredictionRequest
from services.access_control import AccessContext, ensure_campus_access, get_access_context, require_roles
from services.environmental_data_service import fetch_realtime_environment
from services.ml_service import predict_aqi as predict_aqi_score
from services.notification_service import build_alert

router = APIRouter(prefix="/campus", tags=["campus"])
campus_repository = CampusRepository()
air_quality_repository = AirQualityRepository()


def _distance_km(latitude_a: float, longitude_a: float, latitude_b: float, longitude_b: float) -> float:
    earth_radius = 6371.0
    lat1, lon1, lat2, lon2 = map(radians, [latitude_a, longitude_a, latitude_b, longitude_b])
    delta_lat = lat2 - lat1
    delta_lon = lon2 - lon1
    hav = sin(delta_lat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(delta_lon / 2) ** 2
    return earth_radius * 2 * atan2(sqrt(hav), sqrt(1 - hav))


@router.post("/add")
def add_campus(payload: CampusCreate, _: AccessContext = Depends(require_roles("admin"))) -> Dict[str, Any]:
    campus = campus_repository.add_campus(payload.model_dump())
    return campus


@router.get("/list")
def list_campuses(context: AccessContext = Depends(get_access_context)) -> List[Dict[str, Any]]:
    campuses = campus_repository.list_campuses()
    if context.is_admin or context.is_authority:
        return campuses
    if context.assigned_campus_id:
        return [campus for campus in campuses if campus["id"] == context.assigned_campus_id]
    return campuses


@router.post("/predict")
def predict_campus_aqi(
    payload: CampusPredictionRequest,
    context: AccessContext = Depends(require_roles("admin", "authority")),
) -> Dict[str, Any]:
    ensure_campus_access(context, payload.campus_id)
    campus = campus_repository.get_campus(payload.campus_id)
    if campus is None:
        raise HTTPException(status_code=404, detail="Campus not found")

    try:
        data = payload.model_dump()
        campus_id = data.pop("campus_id")
        predicted_aqi = predict_aqi_score(data)
        alert = build_alert(predicted_aqi)
        timestamp = datetime.utcnow()

        stored_record = air_quality_repository.add_record(
            {
                "campus_id": campus_id,
                **data,
                "predicted_aqi": round(predicted_aqi, 2),
                "category": alert["category"],
                "alert_status": alert["alert_status"],
                "health_warning": alert["health_warning"],
                "timestamp": timestamp,
            }
        )

        return {
            "campus_id": campus_id,
            "campus": campus["name"],
            "predicted_aqi": stored_record["predicted_aqi"],
            "category": alert["category"],
            "alert_status": alert["alert_status"],
            "health_warning": alert["health_warning"],
            "timestamp": timestamp,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Campus prediction failed: {exc}") from exc


@router.get("/compare")
def compare_campuses(context: AccessContext = Depends(get_access_context)) -> List[Dict[str, Any]]:
    campuses = campus_repository.list_campuses()
    if context.is_student and context.assigned_campus_id:
        campuses = [campus for campus in campuses if campus["id"] == context.assigned_campus_id]
    elif context.is_authority and context.assigned_campus_id:
        campuses = [campus for campus in campuses if campus["id"] == context.assigned_campus_id]
    comparison: List[Dict[str, Any]] = []

    for campus in campuses:
        latest = air_quality_repository.get_latest_by_campus(campus["id"])
        if latest is None:
            comparison.append(
                {
                    "campus_id": campus["id"],
                    "campus": campus["name"],
                    "location": campus["location"],
                    "latitude": campus["latitude"],
                    "longitude": campus["longitude"],
                    "aqi": None,
                    "category": "No Data",
                    "alert_status": "No Data",
                    "timestamp": None,
                }
            )
            continue

        predicted_aqi = float(latest["predicted_aqi"])
        comparison.append(
            {
                "campus_id": campus["id"],
                "campus": campus["name"],
                "location": campus["location"],
                "latitude": campus["latitude"],
                "longitude": campus["longitude"],
                "aqi": round(predicted_aqi, 2),
                "category": latest.get("category", "Unknown"),
                "alert_status": latest.get("alert_status") or build_alert(predicted_aqi)["alert_status"],
                "timestamp": latest.get("timestamp"),
            }
        )

    comparison.sort(key=lambda item: item["aqi"] if item["aqi"] is not None else -1, reverse=True)
    return comparison


@router.get("/nearest")
def nearest_campus(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    context: AccessContext = Depends(get_access_context),
) -> Dict[str, Any]:
    campuses = campus_repository.list_campuses()
    if context.assigned_campus_id and not context.is_admin:
        campuses = [campus for campus in campuses if campus["id"] == context.assigned_campus_id]
    if not campuses:
        raise HTTPException(status_code=404, detail="No campuses available")

    nearest = min(
        campuses,
        key=lambda campus: _distance_km(latitude, longitude, campus["latitude"], campus["longitude"]),
    )
    latest = air_quality_repository.get_latest_by_campus(nearest["id"])
    distance_km = _distance_km(latitude, longitude, nearest["latitude"], nearest["longitude"])
    return {
        "campus_id": nearest["id"],
        "campus": nearest["name"],
        "location": nearest["location"],
        "latitude": nearest["latitude"],
        "longitude": nearest["longitude"],
        "distance_km": round(distance_km, 2),
        "aqi": latest.get("predicted_aqi") if latest else None,
        "category": latest.get("category") if latest else "No Data",
        "alert_status": latest.get("alert_status") if latest else "No Data",
        "timestamp": latest.get("timestamp") if latest else None,
    }


@router.get("/{campus_id}/history")
def campus_history(
    campus_id: str,
    limit: int = Query(50, ge=1, le=500),
    context: AccessContext = Depends(get_access_context),
) -> Dict[str, Any]:
    ensure_campus_access(context, campus_id)
    campus = campus_repository.get_campus(campus_id)
    if campus is None:
        raise HTTPException(status_code=404, detail="Campus not found")

    records = air_quality_repository.get_history_for_campus(campus_id, limit=limit)
    return {
        "campus_id": campus_id,
        "campus": campus["name"],
        "records": records,
    }


@router.get("/{campus_id}/live")
async def campus_live_aqi(
    campus_id: str,
    context: AccessContext = Depends(require_roles("admin", "authority")),
) -> Dict[str, Any]:
    ensure_campus_access(context, campus_id)
    campus = campus_repository.get_campus(campus_id)
    if campus is None:
        raise HTTPException(status_code=404, detail="Campus not found")

    try:
        payload = await fetch_realtime_environment(campus["latitude"], campus["longitude"])
        model_payload = {key: value for key, value in payload.items() if key in {"temperature", "humidity", "wind_speed", "pm2_5", "pm10", "no2", "co", "so2", "o3"}}
        predicted_aqi = predict_aqi_score(model_payload)
        alert = build_alert(predicted_aqi)
        timestamp = datetime.utcnow()
        air_quality_repository.add_record(
            {
                "campus_id": campus_id,
                **model_payload,
                "predicted_aqi": round(predicted_aqi, 2),
                "category": alert["category"],
                "alert_status": alert["alert_status"],
                "health_warning": alert["health_warning"],
                "timestamp": timestamp,
                "sources": payload.get("sources", ["open-meteo"]),
                "provider": payload.get("provider"),
                "provider_owner": payload.get("provider_owner"),
            }
        )
        return {
            "campus_id": campus_id,
            "campus": campus["name"],
            "location": campus["location"],
            "predicted_aqi": round(predicted_aqi, 2),
            "category": alert["category"],
            "alert_status": alert["alert_status"],
            "health_warning": alert["health_warning"],
            "sources": payload.get("sources", ["open-meteo"]),
            "timestamp": timestamp,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Live campus fetch failed: {exc}") from exc
