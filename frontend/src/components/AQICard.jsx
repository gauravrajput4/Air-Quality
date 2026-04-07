import { motion } from 'framer-motion';

const toneStyles = {
  sky: 'from-blue-50 via-white to-white',
  amber: 'from-amber-50 via-white to-white',
  rose: 'from-rose-50 via-white to-white',
  emerald: 'from-emerald-50 via-white to-white',
};

export default function AQICard({ title, value, subtitle, tone = 'sky', detail }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`shimmer glass-panel relative overflow-hidden bg-gradient-to-br p-5 ${toneStyles[tone] || toneStyles.sky}`}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-600">{title}</p>
            <p className="mt-3 font-display text-4xl font-semibold tracking-tight text-slate-900">{value}</p>
          </div>
          {detail ? <span className="metric-chip">{detail}</span> : null}
        </div>
        <p className="mt-3 text-sm text-slate-600">{subtitle}</p>
      </div>
    </motion.div>
  );
}
