import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import { useAccessControl } from './components/AccessControl';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import Login from './pages/Login';
import MultiCampusDashboard from './pages/MultiCampusDashboard';

export default function App() {
  const location = useLocation();
  const { isAuthenticated, loading } = useAccessControl();

  if (loading) {
    return (
      <div className="app-shell text-slate-900">
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="glass-panel px-8 py-6 text-sm text-slate-700">Checking session…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell text-slate-900">
      <div className="app-grid" />
      <div className="relative z-10">
        {isAuthenticated ? <Navbar /> : null}
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="pb-16"
          >
            <Routes location={location}>
              {isAuthenticated ? (
                <>
                  <Route path="/" element={<Home />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/multi-campus" element={<MultiCampusDashboard />} />
                  <Route path="*" element={<Home />} />
                </>
              ) : (
                <>
                  <Route path="/" element={<Login />} />
                  <Route path="*" element={<Login />} />
                </>
              )}
            </Routes>
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
