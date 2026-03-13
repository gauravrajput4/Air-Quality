import { useState } from 'react';

const defaults = {
  temperature: 30,
  humidity: 65,
  wind_speed: 5,
  pm2_5: 45,
  pm10: 70,
  no2: 40,
  co: 1.2,
  so2: 16,
  o3: 52,
};

export default function PredictionForm({ onSubmit, onSample }) {
  const [form, setForm] = useState(defaults);

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: Number(val) }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur md:grid-cols-3"
    >
      {Object.entries(form).map(([key, value]) => (
        <label key={key} className="text-xs text-slate-300">
          {key}
          <input
            value={value}
            onChange={(e) => update(key, e.target.value)}
            type="number"
            step="0.1"
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/90 px-2 py-2 text-sm"
          />
        </label>
      ))}
      <div className="col-span-full flex gap-3">
        <button className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-slate-900">Predict AQI</button>
        <button
          type="button"
          onClick={async () => {
            const sample = await onSample();
            setForm(sample);
          }}
          className="rounded-lg border border-emerald-300 px-4 py-2"
        >
          Generate Sample
        </button>
      </div>
    </form>
  );
}
