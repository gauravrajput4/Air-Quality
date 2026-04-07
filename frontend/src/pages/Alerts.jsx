import { BellRing, Siren, TriangleAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import AQICard from '../components/AQICard';
import { fetchHistory } from '../services/api';

const levelConfig = {
  yellow: { label: 'Moderate', icon: BellRing, tone: 'amber' },
  orange: { label: 'High', icon: TriangleAlert, tone: 'amber' },
  red: { label: 'Severe', icon: Siren, tone: 'rose' },
  'dark-red': { label: 'Emergency', icon: Siren, tone: 'rose' },
  maroon: { label: 'Critical', icon: Siren, tone: 'rose' },
};

export default function Alerts() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory()
      .then((records) => {
        setHistory(records);
        setError('');
      })
      .catch(() => {
        setHistory([]);
        setError('Alert history could not be loaded.');
      })
      .finally(() => setLoading(false));
  }, []);

  const alerts = useMemo(() => history.filter((r) => r.predicted_aqi > 100), [history]);
  const highestAlert = alerts.length ? Math.max(...alerts.map((item) => Number(item.predicted_aqi || 0))).toFixed(1) : '--';
  const latestAlertTime = alerts[0]?.created_at ? new Date(alerts[0].created_at).toLocaleString() : 'No active alert';

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div className="glass-panel glass-panel-strong p-8">
        <p className="eyebrow">Alerts</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">Exposure alerts and response queue</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Escalation-ready incidents based on recent AQI forecasts. The UX is rebuilt to show severity clearly instead of using a plain list.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <AQICard title="Unsafe Alerts" value={alerts.length} subtitle="Predictions above AQI 100" tone="rose" detail="Count" />
        <AQICard title="Highest Alert AQI" value={highestAlert} subtitle="Peak incident in the current history window" tone="amber" detail="Peak" />
        <AQICard title="Readiness" value={alerts.length ? 'Escalated' : 'Stable'} subtitle="Campus notification posture" tone="sky" detail="Status" />
      </div>

      <div className="glass-panel p-5">
        <p className="eyebrow">Notification State</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="metric-chip">Latest alert {latestAlertTime}</span>
          <span className="metric-chip">{alerts.filter((item) => item.alert_level === 'red' || item.alert_level === 'dark-red' || item.alert_level === 'maroon').length} severe incidents</span>
        </div>
      </div>

      {(loading || error) && (
        <div className="glass-panel p-5">
          <p className="text-sm text-slate-700">{loading ? 'Loading alerts…' : error}</p>
        </div>
      )}

      <div className="space-y-4">
        {alerts.map((alert, idx) => {
          const config = levelConfig[alert.alert_level] || levelConfig.orange;
          const Icon = config.icon;

          return (
            <motion.div
              key={`${alert.predicted_aqi}-${idx}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="glass-panel flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-display text-2xl font-semibold text-slate-900">{alert.pollution_category}</p>
                    <span className="metric-chip">{config.label}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{alert.health_warning}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="metric-chip">AQI {alert.predicted_aqi}</span>
                <span className="metric-chip">Alert band {alert.alert_level}</span>
              </div>
            </motion.div>
          );
        })}
        {!alerts.length && (
          <div className="glass-panel p-8 text-center">
            <p className="font-display text-3xl font-semibold text-slate-900">No unsafe alerts in the current window</p>
            <p className="mt-3 text-sm text-slate-600">The system is still ingesting readings, but no recent forecast has crossed the unsafe threshold.</p>
          </div>
        )}
      </div>
    </motion.section>
  );
}
