import { Plus, Radar } from 'lucide-react';
import { useState } from 'react';

const defaults = {
  name: '',
  location: '',
  latitude: '',
  longitude: '',
};

export default function AddCampusForm({ onSubmit, submitting }) {
  const [form, setForm] = useState(defaults);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const payload = {
          ...form,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
        };
        const created = await onSubmit(payload);
        if (created) {
          setForm(defaults);
        }
      }}
      className="glass-panel p-5"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Add Campus</p>
          <h3 className="mt-3 font-display text-2xl font-semibold text-slate-900">Register a new campus</h3>
          <p className="mt-1 text-sm text-slate-600">Each campus keeps its own coordinates, predictions, history, and alerts.</p>
        </div>
        <Radar className="h-10 w-10 text-blue-600" />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label>
          <span className="field-label">Campus Name</span>
          <input className="field-input" value={form.name} onChange={(e) => update('name', e.target.value)} required />
        </label>
        <label>
          <span className="field-label">Location</span>
          <input className="field-input" value={form.location} onChange={(e) => update('location', e.target.value)} required />
        </label>
        <label>
          <span className="field-label">Latitude</span>
          <input className="field-input" type="number" step="0.0001" value={form.latitude} onChange={(e) => update('latitude', e.target.value)} required />
        </label>
        <label>
          <span className="field-label">Longitude</span>
          <input className="field-input" type="number" step="0.0001" value={form.longitude} onChange={(e) => update('longitude', e.target.value)} required />
        </label>
      </div>

      <button type="submit" className="btn-primary mt-5" disabled={submitting}>
        <Plus className="h-4 w-4" />
        {submitting ? 'Adding campus…' : 'Add campus'}
      </button>
    </form>
  );
}
