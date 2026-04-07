import { ArrowRight, BellRing, ChartNoAxesCombined, ShieldCheck, Wind } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const featureCards = [
  {
    title: 'Live campus signal',
    copy: 'Track AQI movement, particulate concentration, and response status from a single operating view.',
    icon: Wind,
  },
  {
    title: 'Predictive alerts',
    copy: 'Forecast risk before conditions become unsafe and trigger intervention messaging with context.',
    icon: BellRing,
  },
  {
    title: 'Decision-grade analytics',
    copy: 'Use trend distribution and pollutant mix to understand why risk is rising, not just when.',
    icon: ChartNoAxesCombined,
  },
];

export default function Home() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="glass-panel glass-panel-strong overflow-hidden p-8 md:p-10"
        >
          <p className="eyebrow">Campus Air Intelligence</p>
          <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
            See air quality shifts <span className="text-gradient">before they become a health event.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
            A production-style monitoring workspace for AQI prediction, alerting, and analytics. Replace the current
            static feel with a live operational surface that is easier to scan, faster to act on, and visually stronger.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/dashboard" className="btn-primary">
              Launch operations
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/analytics" className="btn-secondary">
              Explore analytics
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="metric-chip">1s live tracking</span>
            <span className="metric-chip">ML-driven forecasting</span>
            <span className="metric-chip">Health response alerts</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="space-y-6"
        >
          <div className="glass-panel glass-panel-strong float-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Live campus forecast</p>
                <p className="mt-2 font-display text-6xl font-semibold text-slate-900">78</p>
              </div>
              <div className="rounded-[22px] bg-blue-50 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Status</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">Moderate</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">PM2.5</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">41</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Wind</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">5.2</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Humidity</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">66%</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Readiness</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">Response channel armed</p>
              </div>
              <ShieldCheck className="h-10 w-10 text-blue-600" />
            </div>
            <div className="mt-5 grid gap-3">
              {[62, 88, 54, 94, 72, 46].map((bar, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-16 text-xs uppercase tracking-[0.18em] text-slate-500">T{idx + 1}</span>
                  <div className="h-2 flex-1 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700"
                      style={{ width: `${bar}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {featureCards.map(({ title, copy, icon: Icon }, index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + index * 0.08 }}
            className="glass-panel p-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold text-slate-900">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{copy}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
