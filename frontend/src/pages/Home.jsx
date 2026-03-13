import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-6xl px-6 py-14">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur">
        <h2 className="text-4xl font-bold text-emerald-300">Campus Air Quality Alert System</h2>
        <p className="mx-auto mt-4 max-w-3xl text-slate-300">
          Machine learning powered AQI prediction for university campuses. Analyze environmental data,
          monitor trends, and trigger real-time health alerts.
        </p>
        <Link to="/dashboard" className="mt-8 inline-block rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-slate-900">
          Launch Dashboard
        </Link>
      </div>
    </motion.section>
  );
}
