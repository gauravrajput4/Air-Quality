from __future__ import annotations

import asyncio
import os
from typing import Any, Dict, Optional

import httpx


WEATHER_URL = "https://api.open-meteo.com/v1/forecast"
AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
OPENAQ_URL = "https://api.openaq.org/v3"
OPENAQ_PARAM_MAP = {
    "pm25": "pm2_5",
    "pm10": "pm10",
    "no2": "no2",
    "co": "co",
    "so2": "so2",
    "o3": "o3",
}


async def _fetch_open_meteo_environment(client: httpx.AsyncClient, latitude: float, longitude: float) -> Dict[str, Any]:
    weather_resp = await client.get(
        WEATHER_URL,
        params={
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,relative_humidity_2m,wind_speed_10m",
            "timezone": "auto",
        },
    )
    weather_resp.raise_for_status()

    air_resp = await client.get(
        AIR_QUALITY_URL,
        params={
            "latitude": latitude,
            "longitude": longitude,
            "current": "pm2_5,pm10,nitrogen_dioxide,carbon_monoxide,sulphur_dioxide,ozone",
            "timezone": "auto",
        },
    )
    air_resp.raise_for_status()

    weather = weather_resp.json().get("current", {})
    air = air_resp.json().get("current", {})
    return {
        "temperature": float(weather.get("temperature_2m", 28.0)),
        "humidity": float(weather.get("relative_humidity_2m", 60.0)),
        "wind_speed": float(weather.get("wind_speed_10m", 4.0)),
        "pm2_5": float(air.get("pm2_5", 20.0)),
        "pm10": float(air.get("pm10", 35.0)),
        "no2": float(air.get("nitrogen_dioxide", 22.0)),
        "co": float(air.get("carbon_monoxide", 0.6)) / 1000.0,
        "so2": float(air.get("sulphur_dioxide", 8.0)),
        "o3": float(air.get("ozone", 35.0)),
    }


async def _fetch_openaq_environment(client: httpx.AsyncClient, latitude: float, longitude: float) -> Optional[Dict[str, Any]]:
    api_key = os.getenv("OPENAQ_API_KEY")
    if not api_key:
        return None

    headers = {"X-API-Key": api_key}
    locations_resp = await client.get(
        f"{OPENAQ_URL}/locations",
        params={"coordinates": f"{latitude},{longitude}", "radius": 25000, "limit": 1},
        headers=headers,
    )
    locations_resp.raise_for_status()
    locations = locations_resp.json().get("results", [])
    if not locations:
        return None

    location = locations[0]
    sensors = location.get("sensors", [])
    relevant_sensors = {
        sensor.get("parameter", {}).get("name"): sensor.get("id")
        for sensor in sensors
        if sensor.get("parameter", {}).get("name") in OPENAQ_PARAM_MAP
    }
    if not relevant_sensors:
        return None

    async def fetch_sensor_measurement(parameter_name: str, sensor_id: int):
        response = await client.get(
            f"{OPENAQ_URL}/sensors/{sensor_id}/measurements",
            params={"limit": 1},
            headers=headers,
        )
        response.raise_for_status()
        results = response.json().get("results", [])
        value = results[0].get("value") if results else None
        return parameter_name, value

    measurements = await asyncio.gather(
        *(fetch_sensor_measurement(parameter, sensor_id) for parameter, sensor_id in relevant_sensors.items())
    )
    pollution = {
        OPENAQ_PARAM_MAP[parameter]: float(value)
        for parameter, value in measurements
        if value is not None and parameter in OPENAQ_PARAM_MAP
    }
    if not pollution:
        return None

    return {
        "source": "openaq",
        "provider": location.get("provider", {}).get("name"),
        "owner": location.get("owner", {}).get("name"),
        "distance": location.get("distance"),
        "measurements": pollution,
    }


def _blend_payload(base_payload: Dict[str, Any], external_payload: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    if not external_payload:
        return {**base_payload, "sources": ["open-meteo"]}

    blended = dict(base_payload)
    for key, value in external_payload.get("measurements", {}).items():
        if key in blended:
            blended[key] = round((float(blended[key]) + float(value)) / 2.0, 2)

    blended["sources"] = ["open-meteo", external_payload["source"]]
    blended["provider"] = external_payload.get("provider")
    blended["provider_owner"] = external_payload.get("owner")
    blended["provider_distance"] = external_payload.get("distance")
    return blended


async def fetch_realtime_environment(latitude: float, longitude: float) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=10.0) as client:
        base_payload = await _fetch_open_meteo_environment(client, latitude, longitude)
        external_payload = None
        try:
            external_payload = await _fetch_openaq_environment(client, latitude, longitude)
        except Exception:
            external_payload = None

    return _blend_payload(base_payload, external_payload)

