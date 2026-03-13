import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Prediction Dashboard' },
  { to: '/analytics', label: 'AQI Analytics' },
  { to: '/alerts', label: 'Alerts' },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-30 border-b border-emerald-400/20 bg-slate-900/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <h1 className="text-lg font-semibold text-emerald-300">Campus Air Quality Alert System</h1>
        <div className="flex gap-4 text-sm">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 transition ${isActive ? 'bg-emerald-500/30 text-emerald-200' : 'text-slate-300 hover:bg-white/5'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
