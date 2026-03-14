import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Charts from '../components/Charts';
import { fetchHistory, fetchRealtimeAQI } from '../services/api';

const MAX_POINTS = 200;

export default function Analytics() {
  const [history, setHistory] = useState([]);
  const [coords] = useState({
    latitude: Number(import.meta.env.VITE_CAMPUS_LAT || 12.9716),
    longitude: Number(import.meta.env.VITE_CAMPUS_LON || 77.5946),
  });

  useEffect(() => {
    fetchHistory().then(setHistory).catch(() => setHistory([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const live = await fetchRealtimeAQI(coords);
        if (!cancelled) {
          setHistory((prev) => [live, ...prev].slice(0, MAX_POINTS));
        }
      } catch {
        // noop
      }
    };

    const timer = setInterval(tick, 1000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [coords]);

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-6xl px-6 py-8">
      <h2 className="mb-2 text-2xl font-bold text-emerald-300">AQI Analytics</h2>
      <p className="mb-4 text-sm text-slate-400">Live Open-Meteo feed at ({coords.latitude}, {coords.longitude}) updating every second.</p>
      <Charts history={history} />
    </motion.section>
  );
}
