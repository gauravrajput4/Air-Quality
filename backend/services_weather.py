from __future__ import annotations

from typing import Any, Dict

import httpx


WEATHER_URL = "https://api.open-meteo.com/v1/forecast"
AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"


async def fetch_realtime_environment(latitude: float, longitude: float) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=10.0) as client:
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
