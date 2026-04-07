import { ShieldPlus, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';

const defaults = {
  username: '',
  password: '',
  role: 'student',
  assigned_campus_id: '',
};

export default function UserProvisionForm({ campuses, onCreate, loading }) {
  const [form, setForm] = useState(defaults);
  const requiresCampus = useMemo(() => form.role === 'student' || form.role === 'authority', [form.role]);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const created = await onCreate({
          ...form,
          assigned_campus_id: requiresCampus ? form.assigned_campus_id : null,
        });
        if (created) {
          setForm(defaults);
        }
      }}
      className="glass-panel p-5"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">User Provisioning</p>
          <h3 className="mt-3 font-display text-2xl font-semibold text-slate-900">Create student and authority accounts</h3>
          <p className="mt-1 text-sm text-slate-600">Admin can issue login IDs and passwords and assign each account to a campus.</p>
        </div>
        <ShieldPlus className="h-10 w-10 text-blue-600" />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label>
          <span className="field-label">User ID</span>
          <input className="field-input" value={form.username} onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))} required />
        </label>
        <label>
          <span className="field-label">Password</span>
          <input
            type="password"
            className="field-input"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
        </label>
        <label>
          <span className="field-label">Role</span>
          <select className="field-input" value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}>
            <option value="student">Student</option>
            <option value="authority">Authority</option>
          </select>
        </label>
        <label>
          <span className="field-label">Assigned Campus</span>
          <select
            className="field-input"
            value={form.assigned_campus_id}
            onChange={(e) => setForm((prev) => ({ ...prev, assigned_campus_id: e.target.value }))}
            required={requiresCampus}
          >
            <option value="">Select campus</option>
            {campuses.map((campus) => (
              <option key={campus.id} value={campus.id}>
                {campus.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button type="submit" className="btn-primary mt-5" disabled={loading}>
        <UserRound className="h-4 w-4" />
        {loading ? 'Creating user…' : 'Create user'}
      </button>
    </form>
  );
}
