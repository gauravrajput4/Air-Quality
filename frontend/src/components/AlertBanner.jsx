import { motion } from 'framer-motion';

const colors = {
  yellow: 'bg-yellow-500/25 border-yellow-400',
  orange: 'bg-orange-500/25 border-orange-400',
  red: 'bg-red-500/25 border-red-400 animate-pulse',
  'dark-red': 'bg-red-900/35 border-red-600 animate-pulse',
  maroon: 'bg-rose-950/50 border-rose-700 animate-pulse',
};

export default function AlertBanner({ alertLevel, category, warning }) {
  if (!alertLevel || alertLevel === 'green') return null;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`mt-4 rounded-xl border p-4 text-sm ${colors[alertLevel] || colors.yellow}`}
    >
      <strong className="mr-2">{category} Alert:</strong>
      {warning}
    </motion.div>
  );
}
