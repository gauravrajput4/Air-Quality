from __future__ import annotations

from typing import Any, Dict

from utils.aqi_calculator import categorize_aqi


def build_alert(predicted_aqi: float) -> Dict[str, Any]:
    category, warning, level = categorize_aqi(predicted_aqi)

    if predicted_aqi > 200:
        status = "Very Unhealthy"
    elif predicted_aqi > 150:
        status = "Unhealthy"
    else:
        status = "Stable"

    return {
        "category": category,
        "health_warning": warning,
        "alert_level": level,
        "alert_status": status,
    }

