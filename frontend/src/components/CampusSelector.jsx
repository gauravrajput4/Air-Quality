import { ChevronDown, MapPinned } from 'lucide-react';

export default function CampusSelector({ campuses, selectedCampusId, onChange, loading }) {
  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Campus Selector</p>
          <h3 className="mt-3 font-display text-2xl font-semibold text-slate-900">Choose an active campus</h3>
          <p className="mt-1 text-sm text-slate-600">Switch between campuses to run predictions and view historical AQI trends.</p>
        </div>
        <MapPinned className="h-10 w-10 text-blue-600" />
      </div>
      <div className="relative mt-5">
        <select value={selectedCampusId} onChange={(e) => onChange(e.target.value)} className="field-input appearance-none pr-12">
          <option value="">{loading ? 'Loading campuses…' : 'Select a campus'}</option>
          {campuses.map((campus) => (
            <option key={campus.id} value={campus.id}>
              {campus.name} · {campus.location}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </div>
    </div>
  );
}
