import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Charts from '../components/Charts';
import { fetchHistory } from '../services/api';

export default function Analytics() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory().then(setHistory).catch(() => setHistory([]));
  }, []);

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-6xl px-6 py-8">
      <h2 className="mb-4 text-2xl font-bold text-emerald-300">AQI Analytics</h2>
      <Charts history={history} />
    </motion.section>
  );
}
