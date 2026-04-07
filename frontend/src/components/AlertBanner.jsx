import { HeartPulse, ShieldAlert, TriangleAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const variants = {
  yellow: {
    label: 'Moderate advisory',
    classes: 'border-amber-200 bg-amber-50',
    icon: HeartPulse,
  },
  orange: {
    label: 'Escalated alert',
    classes: 'border-orange-200 bg-orange-50',
    icon: TriangleAlert,
  },
  red: {
    label: 'Severe exposure risk',
    classes: 'border-rose-200 bg-rose-50',
    icon: ShieldAlert,
  },
  'dark-red': {
    label: 'Emergency conditions',
    classes: 'border-red-200 bg-red-50',
    icon: ShieldAlert,
  },
  maroon: {
    label: 'Critical incident',
    classes: 'border-fuchsia-200 bg-fuchsia-50',
    icon: ShieldAlert,
  },
};

export default function AlertBanner({ alertLevel, category, warning }) {
  if (!alertLevel || alertLevel === 'green') return null;

  const variant = variants[alertLevel] || variants.yellow;
  const Icon = variant.icon;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`glass-panel mt-4 flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between ${variant.classes}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white">
          <Icon className="h-5 w-5 text-slate-900" />
        </div>
        <div>
          <p className="eyebrow">{variant.label}</p>
          <p className="mt-3 text-lg font-semibold text-slate-900">{category} conditions require attention</p>
          <p className="mt-1 text-sm text-slate-600">{warning}</p>
        </div>
      </div>
      <div className="metric-chip self-start md:self-auto">Campus response protocol enabled</div>
    </motion.div>
  );
}
