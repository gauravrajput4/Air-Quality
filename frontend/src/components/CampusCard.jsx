import { AlertTriangle, Building2, Siren, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const toneMap = {
  Good: 'border-emerald-200 bg-emerald-50',
  Moderate: 'border-amber-200 bg-amber-50',
  'Unhealthy for Sensitive Groups': 'border-orange-200 bg-orange-50',
  Unhealthy: 'border-rose-200 bg-rose-50',
  'Very Unhealthy': 'border-red-200 bg-red-50',
  Hazardous: 'border-fuchsia-200 bg-fuchsia-50',
  'No Data': 'border-slate-200 bg-slate-50',
};

export default function CampusCard({ campus, highlighted }) {
  const category = campus.category || 'No Data';
  const alerting = campus.alert_status === 'Unhealthy' || campus.alert_status === 'Very Unhealthy';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`glass-panel p-5 ${toneMap[category] || toneMap['No Data']} ${alerting ? 'shimmer' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <p className="font-display text-2xl font-semibold text-slate-900">{campus.campus}</p>
          </div>
          <p className="mt-1 text-sm text-slate-600">{campus.location}</p>
        </div>
        {highlighted ? (
          <span className="metric-chip">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            Highest AQI
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Current AQI</p>
          <p className={`mt-2 font-display text-5xl font-semibold ${alerting ? 'animate-pulse text-rose-600' : 'text-slate-900'}`}>
            {campus.aqi ?? '--'}
          </p>
        </div>
        <span className="metric-chip">{category}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <span className="metric-chip">
          <AlertTriangle className="h-3.5 w-3.5 text-blue-600" />
          {campus.alert_status || 'Stable'}
        </span>
        {alerting ? (
          <span className="metric-chip">
            <Siren className="h-3.5 w-3.5 text-rose-600" />
            Alert active
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}
