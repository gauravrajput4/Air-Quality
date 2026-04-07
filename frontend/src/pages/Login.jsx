import { LockKeyhole, UserRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAccessControl } from '../components/AccessControl';

export default function Login() {
  const { login } = useAccessControl();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  return (
    <section className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-12 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-panel w-full max-w-md p-8">
        <p className="eyebrow">Admin Login</p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-slate-900">Sign in to manage campuses</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Admin can log in and provision IDs and passwords for students and authorities. Default bootstrap credentials are configured on the backend.
        </p>

        <form
          className="mt-8 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError('');
            try {
              await login(form.username, form.password);
            } catch {
              setError('Invalid username or password.');
            } finally {
              setLoading(false);
            }
          }}
        >
          <label className="block">
            <span className="field-label">User ID</span>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="field-input pl-11"
                value={form.username}
                onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                required
              />
            </div>
          </label>
          <label className="block">
            <span className="field-label">Password</span>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                className="field-input pl-11"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
          </label>
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>
      </motion.div>
    </section>
  );
}
