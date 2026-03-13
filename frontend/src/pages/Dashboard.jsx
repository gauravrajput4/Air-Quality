import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import AlertBanner from '../components/AlertBanner';
import AQICard from '../components/AQICard';
import Charts from '../components/Charts';
import PredictionForm from '../components/PredictionForm';
import { fetchHistory, getSample, predictAQI } from '../services/api';

export default function Dashboard() {
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory().then(setHistory).catch(() => setHistory([]));
  }, []);

  const handlePredict = async (payload) => {
    const data = await predictAQI(payload);
    setResult(data);
    const updated = await fetchHistory();
    setHistory(updated);
  };

  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <PredictionForm onSubmit={handlePredict} onSample={getSample} />

      <div className="grid gap-4 md:grid-cols-4">
        <AQICard title="Current AQI" value={result?.predicted_aqi ?? '--'} subtitle="ML prediction" />
        <AQICard title="Pollution Level" value={result?.pollution_category ?? '--'} subtitle="Air category" />
        <AQICard title="Health Warning" value={result ? 'Active' : '--'} subtitle={result?.health_warning ?? 'Awaiting prediction'} />
        <AQICard title="Prediction Confidence" value="~92%" subtitle="Random Forest model" />
      </div>

      <AlertBanner alertLevel={result?.alert_level} category={result?.pollution_category} warning={result?.health_warning} />
      <Charts history={history} />
    </motion.section>
  );
}
