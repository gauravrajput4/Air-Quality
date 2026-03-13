import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { fetchHistory } from '../services/api';

export default function Alerts() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory().then(setHistory).catch(() => setHistory([]));
  }, []);

  const alerts = useMemo(() => history.filter((r) => r.predicted_aqi > 100), [history]);

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-6xl px-6 py-8">
      <h2 className="mb-4 text-2xl font-bold text-emerald-300">Alerts & Notifications</h2>
      <div className="space-y-3">
        {alerts.map((alert, idx) => (
          <div key={idx} className="rounded-xl border border-orange-400/40 bg-orange-500/10 p-4 animate-pulse">
            <p className="font-semibold">{alert.pollution_category} ({alert.predicted_aqi})</p>
            <p className="text-sm text-slate-300">{alert.health_warning}</p>
          </div>
        ))}
        {!alerts.length && <p className="text-slate-400">No unsafe alerts yet.</p>}
      </div>
    </motion.section>
  );
}
