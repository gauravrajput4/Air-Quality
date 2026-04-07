import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import Charts from '../components/Charts';
import AQICard from '../components/AQICard';
import { fetchHistory, fetchRealtimeAQI } from '../services/api';

const MAX_POINTS = 200;

export default function Analytics() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coords] = useState({
    latitude: Number(import.meta.env.VITE_CAMPUS_LAT || 12.9716),
    longitude: Number(import.meta.env.VITE_CAMPUS_LON || 77.5946),
  });

  useEffect(() => {
    fetchHistory()
      .then((records) => {
        setHistory(records);
        setError('');
      })
      .catch(() => {
        setHistory([]);
        setError('Analytics history could not be loaded.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const live = await fetchRealtimeAQI(coords);
        if (!cancelled) {
          setError('');
          setHistory((prev) => [live, ...prev].slice(0, MAX_POINTS));
        }
      } catch {
        if (!cancelled) {
          setError('Live analytics feed is temporarily unavailable.');
        }
      }
    };

    const timer = setInterval(tick, 1000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [coords]);

  const summary = useMemo(() => {
    const average = history.length
      ? (history.reduce((sum, item) => sum + Number(item.predicted_aqi || 0), 0) / history.length).toFixed(1)
      : '--';
    const highest = history.length ? Math.max(...history.map((item) => Number(item.predicted_aqi || 0))).toFixed(1) : '--';
    const dominant = Object.entries(
      history.reduce((acc, item) => {
        const category = item.pollution_category || 'Unknown';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1])[0]?.[0] || '--';

    const unsafeRatio = history.length ? `${Math.round((history.filter((item) => Number(item.predicted_aqi || 0) > 100).length / history.length) * 100)}%` : '--';
    const volatility =
      history.length > 1
        ? (
            history.slice(1).reduce((sum, item, index) => sum + Math.abs(Number(item.predicted_aqi || 0) - Number(history[index].predicted_aqi || 0)), 0) /
            (history.length - 1)
          ).toFixed(1)
        : '--';

    return { average, highest, dominant, unsafeRatio, volatility };
  }, [history]);

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div className="glass-panel glass-panel-strong p-8">
        <p className="eyebrow">Analytics</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">AQI pattern analysis</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Live Open-Meteo stream at ({coords.latitude}, {coords.longitude}) updating every second, reshaped into a cleaner
          analytic surface for scanning AQI drift and pollutant composition.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <AQICard title="Average AQI" value={summary.average} subtitle="Rolling mean across recent samples" tone="sky" detail="Mean" />
        <AQICard title="Highest AQI" value={summary.highest} subtitle="Peak recorded in the current window" tone="rose" detail="Peak" />
        <AQICard title="Dominant Band" value={summary.dominant} subtitle="Most frequent category in recent history" tone="amber" detail="Mode" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AQICard title="Unsafe Ratio" value={summary.unsafeRatio} subtitle="Share of samples above AQI 100" tone="rose" detail="Risk" />
        <AQICard title="AQI Volatility" value={summary.volatility} subtitle="Average absolute change between recent readings" tone="emerald" detail="Delta" />
      </div>

      {(loading || error) && (
        <div className="glass-panel p-5">
          <p className="text-sm text-slate-700">{loading ? 'Loading analytics…' : error}</p>
        </div>
      )}

      <Charts history={history} />
    </motion.section>
  );
}
