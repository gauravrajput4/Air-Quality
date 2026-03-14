# Campus Air Quality Alert System

A full-stack ML web app that predicts campus **AQI (Air Quality Index)** and generates health alerts using historical/synthetic environmental data (no IoT devices required).

## Features

- FastAPI backend with endpoints for health, prediction, analysis, history, and sample generation
- ML pipeline with data cleaning, train/test split, Random Forest vs Linear Regression comparison, and model persistence
- MongoDB persistence (with in-memory fallback when MongoDB is unavailable)
- React + Vite dashboard with Tailwind dark UI, Framer Motion animations, and Recharts visualizations
- Alert system with severity levels and animated warning UI
- Pages: Home, Prediction Dashboard, AQI Analytics, Alerts

## Project Structure

```text
backend/
  main.py
  routes/
    predict.py
    analyze.py
  ml/
    train_model.py
    model.pkl (generated)
  database/
    mongodb.py
  schemas/
    prediction_schema.py
  utils/
    aqi_calculator.py
  requirements.txt

frontend/
  src/
    components/
    pages/
    services/
    styles/
```

## Backend Setup

```bash
cd backend
pip install -r requirements.txt
python ml/train_model.py
uvicorn main:app --reload
```

API base URL: `http://localhost:8000`

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Optional environment variables for campus coordinates:

```bash
VITE_CAMPUS_LAT=12.9716
VITE_CAMPUS_LON=77.5946
VITE_API_URL=http://localhost:8000
```

Frontend URL: `http://localhost:5173`

## Core API Endpoints

- `GET /health`
- `POST /predict`
- `POST /analyze`
- `GET /history`
- `POST /generate-sample`
- `GET /realtime?latitude=<lat>&longitude=<lon>`

## AQI Categories

- `<= 50`: Good
- `<= 100`: Moderate
- `<= 150`: Unhealthy for Sensitive Groups
- `<= 200`: Unhealthy
- `<= 300`: Very Unhealthy
- `> 300`: Hazardous

## Notes

- If `backend/data/air_quality_data.csv` is missing, synthetic realistic data is generated automatically.
- MongoDB connection is optional for local demo; predictions still work with temporary in-memory storage.
- Realtime API is fetched from Open-Meteo weather + air-quality APIs and transformed into model features.
