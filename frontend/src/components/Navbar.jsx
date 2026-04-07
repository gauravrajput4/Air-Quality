import { Activity, LogOut, ShieldCheck, Wind } from 'lucide-react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { useAccessControl } from './AccessControl';

const links = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Operations' },
  { to: '/multi-campus', label: 'Campuses' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/alerts', label: 'Alerts' },
];

export default function Navbar() {
  const { user, logout } = useAccessControl();

  return (
    <nav className="sticky top-0 z-30 px-4 pt-4 sm:px-6">
      <div className="glass-panel glass-panel-strong mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 ring-1 ring-blue-100"
          >
            <Wind className="h-5 w-5 text-blue-600" />
          </motion.div>
          <div>
            <p className="font-display text-lg font-semibold tracking-tight text-slate-900">Aeris Campus Intelligence</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span className="inline-flex items-center gap-2">
                <span className="live-dot" />
                Real-time campus AQI
              </span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                {user?.role || 'user'} access
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white ring-1 ring-blue-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="metric-chip">
            <Activity className="h-3.5 w-3.5 text-blue-600" />
            Model confidence 92%
          </div>
          <div className="metric-chip">{user?.username}</div>
          <button type="button" className="btn-secondary px-4 py-2" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
