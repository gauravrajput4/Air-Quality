import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import AlertBanner from '../components/AlertBanner';
import AQICard from '../components/AQICard';
import Charts from '../components/Charts';
import PredictionForm from '../components/PredictionForm';
import { fetchHistory, fetchRealtimeAQI, getSample, predictAQI } from '../services/api';

const MAX_POINTS = 120;

export default function Dashboard() {
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [tracking, setTracking] = useState(true);
  const [coords, setCoords] = useState({
    latitude: Number(import.meta.env.VITE_CAMPUS_LAT || 12.9716),
    longitude: Number(import.meta.env.VITE_CAMPUS_LON || 77.5946),
  });

  useEffect(() => {
    fetchHistory().then(setHistory).catch(() => setHistory([]));
  }, []);

  useEffect(() => {
    if (!tracking) return undefined;
    let cancelled = false;

    const tick = async () => {
      try {
        const live = await fetchRealtimeAQI(coords);
        if (cancelled) return;
        setResult(live);
        setHistory((prev) => [live, ...prev].slice(0, MAX_POINTS));
      } catch {
        // keep UI alive on transient API/network issues
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [tracking, coords]);

  const handlePredict = async (payload) => {
    const data = await predictAQI(payload);
    setResult(data);
    const updated = await fetchHistory();
    setHistory(updated);
  };

  const pointCount = useMemo(() => history.length, [history]);

  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
        <h3 className="text-sm font-semibold text-emerald-300">Campus Real-Time Tracking (1s updates)</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <label className="text-xs text-slate-300">
            Latitude
            <input
              type="number"
              step="0.0001"
              value={coords.latitude}
              onChange={(e) => setCoords((c) => ({ ...c, latitude: Number(e.target.value) }))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/90 px-2 py-2 text-sm"
            />
          </label>
          <label className="text-xs text-slate-300">
            Longitude
            <input
              type="number"
              step="0.0001"
              value={coords.longitude}
              onChange={(e) => setCoords((c) => ({ ...c, longitude: Number(e.target.value) }))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/90 px-2 py-2 text-sm"
            />
          </label>
          <div className="flex items-end">
            <button onClick={() => setTracking((s) => !s)} className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-slate-900">
              {tracking ? 'Pause Live' : 'Start Live'}
            </button>
          </div>
          <div className="flex items-end text-xs text-slate-300">Points collected: {pointCount}</div>
        </div>
      </div>

      <PredictionForm onSubmit={handlePredict} onSample={getSample} />

      <div className="grid gap-4 md:grid-cols-4">
        <AQICard title="Current AQI" value={result?.predicted_aqi ?? '--'} subtitle="ML prediction" />
        <AQICard title="Pollution Level" value={result?.pollution_category ?? '--'} subtitle="Air category" />
        <AQICard title="Health Warning" value={result ? 'Active' : '--'} subtitle={result?.health_warning ?? 'Awaiting prediction'} />
        <AQICard title="Prediction Confidence" value="~92%" subtitle="Random Forest model" />
      </div>

      <AlertBanner alertLevel={result?.alert_level} category={result?.pollution_category} warning={result?.health_warning} />
      <Charts history={history} />
    </motion.section>
  );
}
