import { motion } from 'framer-motion';

export default function AQICard({ title, value, subtitle }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur"
    >
      <h3 className="text-sm text-slate-300">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-emerald-300">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
    </motion.div>
  );
}
