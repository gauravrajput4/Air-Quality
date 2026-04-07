import { Activity, Bot, Gauge, MapPinned, Radio, RefreshCcw, ShieldAlert, Siren, TriangleAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import AlertBanner from '../components/AlertBanner';
import AQICard from '../components/AQICard';
import Charts from '../components/Charts';
import PredictionForm from '../components/PredictionForm';
import { fetchHealth, fetchHistory, fetchRealtimeAQI, getSample, predictAQI } from '../services/api';

const MAX_POINTS = 120;
const severityMeta = {
  yellow: { label: 'Moderate', icon: Activity },
  orange: { label: 'Elevated', icon: TriangleAlert },
  red: { label: 'Severe', icon: Siren },
  'dark-red': { label: 'Emergency', icon: Siren },
  maroon: { label: 'Critical', icon: Siren },
};

function formatTimestamp(value) {
  if (!value) return 'No timestamp';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No timestamp';
  return date.toLocaleString();
}

export default function Dashboard() {
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [tracking, setTracking] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState('');
  const [liveError, setLiveError] = useState('');
  const [predictionError, setPredictionError] = useState('');
  const [apiHealth, setApiHealth] = useState(null);
  const [coords, setCoords] = useState({
    latitude: Number(import.meta.env.VITE_CAMPUS_LAT || 12.9716),
    longitude: Number(import.meta.env.VITE_CAMPUS_LON || 77.5946),
  });

  const loadHistory = async () => {
    setLoadingHistory(true);
    setHistoryError('');
    try {
      const records = await fetchHistory();
      setHistory(records);
    } catch {
      setHistory([]);
      setHistoryError('History service is currently unavailable.');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    fetchHealth().then(setApiHealth).catch(() => setApiHealth({ status: 'degraded', service: 'api unavailable' }));
  }, []);

  useEffect(() => {
    if (!tracking) return undefined;
    let cancelled = false;

    const tick = async () => {
      try {
        const live = await fetchRealtimeAQI(coords);
        if (cancelled) return;
        setLiveError('');
        setResult(live);
        setHistory((prev) => [live, ...prev].slice(0, MAX_POINTS));
      } catch {
        if (!cancelled) {
          setLiveError('Live feed is unavailable. Showing the latest stored readings.');
        }
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [tracking, coords]);

  const handlePredict = async (payload) => {
    setPredicting(true);
    setPredictionError('');
    try {
      const data = await predictAQI(payload);
      setResult(data);
      const updated = await fetchHistory();
      setHistory(updated);
    } catch {
      setPredictionError('Prediction request failed. Verify the backend and try again.');
    } finally {
      setPredicting(false);
    }
  };

  const pointCount = useMemo(() => history.length, [history]);
  const current = result || history[0] || null;
  const currentAqi = current?.predicted_aqi ?? '--';
  const currentCategory = current?.pollution_category ?? 'Awaiting live feed';
  const riskTone =
    current?.alert_level === 'red' || current?.alert_level === 'dark-red' || current?.alert_level === 'maroon'
      ? 'rose'
      : current?.alert_level === 'orange' || current?.alert_level === 'yellow'
        ? 'amber'
        : 'emerald';
  const highRiskCount = useMemo(() => history.filter((item) => Number(item.predicted_aqi || 0) > 100).length, [history]);
  const recentEvents = useMemo(() => history.slice(0, 5), [history]);

  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="glass-panel glass-panel-strong overflow-hidden p-8">
          <p className="eyebrow">Operations</p>
          <div className="mt-5 flex flex-wrap items-start justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl">{currentAqi}</h1>
              <p className="mt-3 text-xl text-slate-700">{currentCategory}</p>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                {current?.health_warning || 'Waiting for a live reading or manual forecast to establish current exposure guidance.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="metric-chip">Last update {formatTimestamp(current?.created_at)}</span>
                <span className="metric-chip">{highRiskCount} unsafe points in buffer</span>
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-white px-5 py-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Monitoring state</p>
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-900">
                <span className="live-dot" />
                {tracking ? 'Live stream active' : 'Live stream paused'}
              </div>
              <p className="mt-2 text-xs text-slate-500">{pointCount} recent points collected</p>
              {liveError ? <p className="mt-3 text-xs text-amber-700">{liveError}</p> : null}
            </div>
          </div>
        </div>

        <div className="glass-panel p-6">
          <p className="eyebrow">Campus Tracking</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label>
              <span className="field-label">Latitude</span>
              <input
                type="number"
                step="0.0001"
                value={coords.latitude}
                onChange={(e) => setCoords((c) => ({ ...c, latitude: Number(e.target.value) }))}
                className="field-input"
              />
            </label>
            <label>
              <span className="field-label">Longitude</span>
              <input
                type="number"
                step="0.0001"
                value={coords.longitude}
                onChange={(e) => setCoords((c) => ({ ...c, longitude: Number(e.target.value) }))}
                className="field-input"
              />
            </label>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={() => setTracking((s) => !s)} className="btn-primary" type="button">
              <Radio className="h-4 w-4" />
              {tracking ? 'Pause live' : 'Resume live'}
            </button>
            <button onClick={loadHistory} className="btn-secondary" type="button">
              <RefreshCcw className="h-4 w-4" />
              Refresh history
            </button>
            <div className="metric-chip">
              <MapPinned className="h-3.5 w-3.5 text-blue-600" />
              {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <PredictionForm onSubmit={handlePredict} onSample={getSample} />
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <p className="eyebrow">Model Status</p>
            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-4 rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Random Forest inference</p>
                  <p className="mt-1 text-sm text-slate-600">Manual predictions are written back into history for side-by-side analysis.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
                  <Gauge className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{predicting ? 'Prediction running' : 'Ready for forecast'}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {predicting ? 'Submitting custom environmental conditions to the API.' : 'Current model confidence shown in the global navigation.'}
                  </p>
                  {predictionError ? <p className="mt-2 text-xs text-rose-700">{predictionError}</p> : null}
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
                  <ShieldAlert className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Alert routing</p>
                  <p className="mt-1 text-sm text-slate-600">Visual severity escalates automatically when the alert band rises above green.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">API health</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {apiHealth ? `${apiHealth.service} is ${apiHealth.status}.` : 'Checking backend health endpoint.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <AQICard title="Current AQI" value={currentAqi} subtitle="Most recent model output" tone={riskTone} detail="Live" />
        <AQICard title="Pollution Level" value={currentCategory} subtitle="Current campus air band" tone="sky" detail="Category" />
        <AQICard
          title="Health Warning"
          value={current ? 'Active' : '--'}
          subtitle={current?.health_warning ?? 'Awaiting prediction'}
          tone="rose"
          detail="Response"
        />
        <AQICard title="Prediction Confidence" value="92%" subtitle="Random Forest ensemble" tone="amber" detail="Model" />
      </div>

      <AlertBanner alertLevel={current?.alert_level} category={current?.pollution_category} warning={current?.health_warning} />
      {(loadingHistory || historyError) && (
        <div className="glass-panel p-5">
          <p className="text-sm text-slate-700">{loadingHistory ? 'Loading prediction history…' : historyError}</p>
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Charts history={history} />
        <div className="glass-panel p-6">
          <p className="eyebrow">Recent Events</p>
          <div className="mt-5 space-y-4">
            {recentEvents.length ? (
              recentEvents.map((event, index) => {
                const meta = severityMeta[event.alert_level] || severityMeta.yellow;
                const Icon = meta.icon;

                return (
                  <div key={`${event.created_at || index}-${index}`} className="flex items-start gap-4 rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50">
                      <Icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">{event.pollution_category || 'Unknown'}</p>
                        <span className="metric-chip">{meta.label}</span>
                        <span className="metric-chip">AQI {event.predicted_aqi ?? '--'}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{event.health_warning || 'No warning text available.'}</p>
                      <p className="mt-2 text-xs text-slate-500">{formatTimestamp(event.created_at)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-600">No recent events yet.</p>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
