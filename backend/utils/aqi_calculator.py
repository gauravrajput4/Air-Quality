from typing import Tuple


def categorize_aqi(aqi: float) -> Tuple[str, str, str]:
    if aqi <= 50:
        return "Good", "Air quality is satisfactory.", "green"
    if aqi <= 100:
        return "Moderate", "Sensitive individuals should limit prolonged outdoor exertion.", "yellow"
    if aqi <= 150:
        return "Unhealthy for Sensitive Groups", "Children, elders, and people with respiratory issues should reduce outdoor activity.", "orange"
    if aqi <= 200:
        return "Unhealthy", "General public may begin to experience health effects.", "red"
    if aqi <= 300:
        return "Very Unhealthy", "Health alert: everyone may experience more serious effects.", "dark-red"
    return "Hazardous", "Emergency conditions. Avoid outdoor exposure.", "maroon"
