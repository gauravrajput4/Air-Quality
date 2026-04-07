import { useState } from 'react';
import { FlaskConical, Sparkles } from 'lucide-react';

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

const groups = [
  {
    title: 'Weather inputs',
    fields: [
      ['temperature', 'Temperature', 'C'],
      ['humidity', 'Humidity', '%'],
      ['wind_speed', 'Wind Speed', 'm/s'],
    ],
  },
  {
    title: 'Pollutant inputs',
    fields: [
      ['pm2_5', 'PM2.5', 'ug/m3'],
      ['pm10', 'PM10', 'ug/m3'],
      ['no2', 'NO2', 'ppb'],
      ['co', 'CO', 'ppm'],
      ['so2', 'SO2', 'ppb'],
      ['o3', 'O3', 'ppb'],
    ],
  },
];

export default function PredictionForm({ onSubmit, onSample }) {
  const [form, setForm] = useState(defaults);
  const [sampling, setSampling] = useState(false);

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: Number(val) }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="glass-panel glass-panel-strong p-6"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Manual Forecast</p>
          <h3 className="mt-3 font-display text-2xl font-semibold text-slate-900">Run a custom campus prediction</h3>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Tune environmental conditions and push a forecast into the live monitoring stream.
          </p>
        </div>
        <div className="metric-chip">9 model features</div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        {groups.map((group) => (
          <div key={group.title} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{group.title}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {group.fields.map(([key, label, unit]) => (
                <label key={key}>
                  <span className="field-label">{label}</span>
                  <div className="relative">
                    <input
                      value={form[key]}
                      onChange={(e) => update(key, e.target.value)}
                      type="number"
                      step="0.1"
                      className="field-input pr-16"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs text-slate-500">{unit}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" className="btn-primary">
          <Sparkles className="h-4 w-4" />
          Predict AQI
        </button>
        <button
          type="button"
          onClick={async () => {
            setSampling(true);
            const sample = await onSample();
            setForm(sample);
            setSampling(false);
          }}
          className="btn-secondary"
        >
          <FlaskConical className="h-4 w-4" />
          {sampling ? 'Generating…' : 'Generate Sample'}
        </button>
      </div>
    </form>
  );
}
