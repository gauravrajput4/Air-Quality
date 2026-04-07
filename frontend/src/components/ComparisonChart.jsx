import { motion } from 'framer-motion';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const barColor = (aqi) => {
  if (aqi == null) return '#CBD5E1';
  if (aqi <= 50) return '#10B981';
  if (aqi <= 100) return '#F59E0B';
  return '#EF4444';
};

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-700 shadow-lg">
      <p className="mb-1 text-slate-500">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span>{entry.name || entry.dataKey}</span>
          <span className="font-semibold text-slate-900">{entry.value ?? '--'}</span>
        </div>
      ))}
    </div>
  );
}

export default function ComparisonChart({ comparison, history }) {
  const trendData = (history?.records || []).slice(0, 12).reverse().map((item, index) => ({
    name: `P${index + 1}`,
    aqi: item.predicted_aqi,
  }));

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-5">
        <p className="eyebrow">Comparison</p>
        <h3 className="mt-3 font-display text-2xl font-semibold text-slate-900">AQI across campuses</h3>
        <p className="mt-1 text-sm text-slate-600">Bar view of the latest AQI per campus with quick severity color coding.</p>
        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparison}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
              <XAxis dataKey="campus" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="aqi" radius={[10, 10, 4, 4]}>
                {comparison.map((item) => (
                  <Cell key={item.campus_id} fill={barColor(item.aqi)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="glass-panel p-5">
        <p className="eyebrow">Trend</p>
        <h3 className="mt-3 font-display text-2xl font-semibold text-slate-900">Campus AQI history</h3>
        <p className="mt-1 text-sm text-slate-600">Recent trend for the selected campus based on stored air quality predictions.</p>
        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="aqi" stroke="#2563EB" strokeWidth={3} dot={{ r: 3 }} name="AQI" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
