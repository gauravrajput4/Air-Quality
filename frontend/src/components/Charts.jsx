import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const palette = ['#34d399', '#fb923c', '#f87171', '#7dd3fc'];

export default function Charts({ history = [] }) {
  const trend = history.slice(0, 12).reverse().map((item, idx) => ({ name: `${idx + 1}`, aqi: item.predicted_aqi }));
  const latest = history[0] || {};
  const pollutants = ['pm2_5', 'pm10', 'no2', 'o3'].map((k) => ({ name: k, value: latest[k] || 0 }));
  const categories = Object.entries(
    history.reduce((acc, record) => {
      const category = record.pollution_category || 'Unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h3 className="mb-2 text-sm">AQI Trend</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trend}>
            <CartesianGrid stroke="#334155" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="aqi" stroke="#34d399" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h3 className="mb-2 text-sm">Pollutant Comparison</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={pollutants}>
            <CartesianGrid stroke="#334155" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h3 className="mb-2 text-sm">AQI Category Distribution</h3>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={categories} dataKey="value" nameKey="name" outerRadius={80}>
              {categories.map((_, idx) => (
                <Cell key={idx} fill={palette[idx % palette.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h3 className="mb-2 text-sm">Monthly Pollution Trend (simulated)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trend.map((x, i) => ({ ...x, month: `M${i + 1}` }))}>
            <CartesianGrid stroke="#334155" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="aqi" stroke="#fb923c" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
