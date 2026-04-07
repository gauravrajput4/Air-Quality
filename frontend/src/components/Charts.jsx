import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const palette = ['#2563EB', '#60A5FA', '#F59E0B', '#EF4444', '#10B981'];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-700 shadow-lg">
      <p className="mb-1 text-slate-500">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="capitalize">{entry.name || entry.dataKey}</span>
          <span className="font-semibold text-slate-900">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Charts({ history = [] }) {
  const trend = history
    .slice(0, 18)
    .reverse()
    .map((item, idx) => ({
      name: `T-${18 - idx}`,
      aqi: Number(item.predicted_aqi || 0).toFixed(1),
      pm25: Number(item.pm2_5 || 0).toFixed(1),
      pm10: Number(item.pm10 || 0).toFixed(1),
    }));
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
    <div className="grid gap-5 xl:grid-cols-2">
      <div className="glass-panel p-5">
        <div className="mb-5">
          <p className="eyebrow">AQI Trend</p>
          <h3 className="mt-3 font-display text-2xl font-semibold text-slate-900">Live exposure profile</h3>
          <p className="mt-1 text-sm text-slate-600">Recent AQI movement with PM2.5 overlay for short-horizon risk detection.</p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={trend}>
            <defs>
              <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.26} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.16)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="aqi" stroke="#2563EB" fill="url(#aqiGradient)" strokeWidth={3} />
            <Area type="monotone" dataKey="pm25" stroke="#F59E0B" fill="transparent" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="glass-panel p-5">
        <div className="mb-5">
          <p className="eyebrow">Pollutants</p>
          <h3 className="mt-3 font-display text-2xl font-semibold text-slate-900">Source concentration mix</h3>
          <p className="mt-1 text-sm text-slate-600">Latest environmental factors contributing to model output.</p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={pollutants}>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.16)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="value" radius={[10, 10, 4, 4]}>
              {pollutants.map((entry, idx) => (
                <Cell key={entry.name} fill={palette[idx % palette.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="glass-panel p-5">
        <div className="mb-5">
          <p className="eyebrow">Distribution</p>
          <h3 className="mt-3 font-display text-2xl font-semibold text-slate-900">Category frequency</h3>
          <p className="mt-1 text-sm text-slate-600">How recent readings are distributed across AQI bands.</p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={categories} dataKey="value" nameKey="name" outerRadius={84} innerRadius={46} paddingAngle={4}>
              {categories.map((_, idx) => (
                <Cell key={idx} fill={palette[idx % palette.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="glass-panel p-5">
        <div className="mb-5">
          <p className="eyebrow">Comparative Trend</p>
          <h3 className="mt-3 font-display text-2xl font-semibold text-slate-900">Particulate momentum</h3>
          <p className="mt-1 text-sm text-slate-600">PM10 movement compared against AQI trend across the latest samples.</p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={trend}>
            <defs>
              <linearGradient id="pmGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.16)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="pm10" stroke="#60A5FA" fill="url(#pmGradient)" strokeWidth={3} />
            <Area type="monotone" dataKey="aqi" stroke="#2563EB" fill="transparent" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
