import { BarChart3, Crosshair, Filter, LocateFixed, MapPin, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useAccessControl } from '../components/AccessControl';
import AddCampusForm from '../components/AddCampusForm';
import CampusCard from '../components/CampusCard';
import CampusSelector from '../components/CampusSelector';
import ComparisonChart from '../components/ComparisonChart';
import UserProvisionForm from '../components/UserProvisionForm';
import { addCampus, createUser, fetchCampusComparison, fetchCampusHistory, fetchCampuses, fetchLiveCampusAQI, fetchNearestCampus, fetchUsers, getSample, predictCampusAQI } from '../services/api';

const defaultInputs = {
  temperature: 30,
  humidity: 60,
  wind_speed: 5,
  pm2_5: 80,
  pm10: 120,
  no2: 40,
  co: 1.2,
  so2: 10,
  o3: 25,
};

const inputLabels = {
  temperature: 'Temperature',
  humidity: 'Humidity',
  wind_speed: 'Wind Speed',
  pm2_5: 'PM2.5',
  pm10: 'PM10',
  no2: 'NO2',
  co: 'CO',
  so2: 'SO2',
  o3: 'O3',
};

export default function MultiCampusDashboard() {
  const { user } = useAccessControl();
  const [campuses, setCampuses] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [selectedCampusId, setSelectedCampusId] = useState('');
  const [selectedHistory, setSelectedHistory] = useState({ records: [] });
  const [predictForm, setPredictForm] = useState(defaultInputs);
  const [topCount, setTopCount] = useState(5);
  const [loading, setLoading] = useState(true);
  const [submittingCampus, setSubmittingCampus] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [message, setMessage] = useState('');
  const [nearestCampus, setNearestCampus] = useState(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [users, setUsers] = useState([]);
  const [creatingUser, setCreatingUser] = useState(false);

  const role = user?.role || 'student';
  const assignedCampusId = user?.assigned_campus_id || '';

  const loadCampuses = async (preferredCampusId = '') => {
    setLoading(true);
    try {
      const [campusList, comparisonData] = await Promise.all([fetchCampuses(), fetchCampusComparison()]);
      setCampuses(campusList);
      setComparison(comparisonData);
      const nextId = preferredCampusId || assignedCampusId || selectedCampusId || campusList[0]?.id || '';
      setSelectedCampusId(nextId);
    } catch {
      setMessage('Unable to load campus data right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampuses();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserLocation(coords);
        try {
          const nearest = await fetchNearestCampus(coords);
          setNearestCampus(nearest);
        } catch {
          setMessage((prev) => prev || 'Could not determine the nearest campus.');
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    if (!selectedCampusId) {
      setSelectedHistory({ records: [] });
      return;
    }

    fetchCampusHistory(selectedCampusId, 24)
      .then(setSelectedHistory)
      .catch(() => setSelectedHistory({ records: [] }));
  }, [selectedCampusId]);

  useEffect(() => {
    if (role !== 'admin') {
      return;
    }
    fetchUsers().then(setUsers).catch(() => setUsers([]));
  }, [role]);

  const selectedCampus = useMemo(() => campuses.find((campus) => campus.id === selectedCampusId) || null, [campuses, selectedCampusId]);
  const sortedComparison = useMemo(() => [...comparison].sort((a, b) => (b.aqi ?? -1) - (a.aqi ?? -1)), [comparison]);
  const topCampuses = sortedComparison.slice(0, topCount);
  const highestCampusId = sortedComparison[0]?.campus_id;

  const handleAddCampus = async (payload) => {
    setSubmittingCampus(true);
    setMessage('');
    try {
      const created = await addCampus(payload);
      await loadCampuses(created.id);
      setMessage(`Campus ${created.name} added successfully.`);
      return created;
    } catch {
      setMessage('Failed to add campus.');
      return null;
    } finally {
      setSubmittingCampus(false);
    }
  };

  const handlePredict = async () => {
    if (!selectedCampusId) {
      setMessage('Select a campus before running prediction.');
      return;
    }

    setPredicting(true);
    setMessage('');
    try {
      const response = await predictCampusAQI({ campus_id: selectedCampusId, ...predictForm });
      await loadCampuses(selectedCampusId);
      const history = await fetchCampusHistory(selectedCampusId, 24);
      setSelectedHistory(history);
      setMessage(`${response.campus} predicted AQI: ${response.predicted_aqi} (${response.category})`);
    } catch {
      setMessage('Campus AQI prediction failed.');
    } finally {
      setPredicting(false);
    }
  };

  const handleLivePredict = async () => {
    if (!selectedCampusId) {
      setMessage('Select a campus before using live external data.');
      return;
    }

    setPredicting(true);
    setMessage('');
    try {
      const response = await fetchLiveCampusAQI(selectedCampusId);
      await loadCampuses(selectedCampusId);
      const history = await fetchCampusHistory(selectedCampusId, 24);
      setSelectedHistory(history);
      setMessage(
        `${response.campus} live AQI: ${response.predicted_aqi} (${response.category}) via ${response.sources.join(' + ')}`
      );
    } catch {
      setMessage('Live campus AQI fetch failed.');
    } finally {
      setPredicting(false);
    }
  };

  const handleCreateUser = async (payload) => {
    setCreatingUser(true);
    try {
      const created = await createUser(payload);
      setUsers((prev) => [created, ...prev]);
      setMessage(`Created ${created.role} account for ${created.username}.`);
      return created;
    } catch {
      setMessage('Failed to create user.');
      return null;
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div className="glass-panel glass-panel-strong p-8">
        <p className="eyebrow">Multi-Campus Operations</p>
        <div className="mt-4 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              Multi-campus AQI comparison dashboard
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Register campuses, predict AQI independently per location, compare pollution levels across campuses, and inspect historical trends.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="metric-chip">
              <BarChart3 className="h-3.5 w-3.5 text-blue-600" />
              {comparison.length} campuses tracked
            </span>
            <span className="metric-chip">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              Campus-level alerts
            </span>
          </div>
        </div>
      </div>

      {message ? (
        <div className="glass-panel p-4">
          <p className="text-sm text-slate-700">{message}</p>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="space-y-6">
          <CampusSelector campuses={campuses} selectedCampusId={selectedCampusId} onChange={setSelectedCampusId} loading={loading} />
          {role === 'admin' ? <AddCampusForm onSubmit={handleAddCampus} submitting={submittingCampus} /> : null}
          {role === 'admin' ? <UserProvisionForm campuses={campuses} onCreate={handleCreateUser} loading={creatingUser} /> : null}
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Auto Detection</p>
                <h3 className="mt-3 font-display text-2xl font-semibold text-slate-900">Nearest campus from your location</h3>
                <p className="mt-1 text-sm text-slate-600">Browser geolocation detects the nearest registered campus and shows its latest AQI.</p>
              </div>
              <LocateFixed className="h-10 w-10 text-blue-600" />
            </div>
            <div className="mt-5 space-y-3">
              {detectingLocation ? <p className="text-sm text-slate-600">Detecting your location…</p> : null}
              {userLocation ? (
                <div className="metric-chip">
                  <Crosshair className="h-3.5 w-3.5 text-blue-600" />
                  {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                </div>
              ) : null}
              {nearestCampus ? (
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{nearestCampus.campus}</p>
                      <p className="mt-1 text-sm text-slate-600">{nearestCampus.location}</p>
                    </div>
                    <span className="metric-chip">
                      <MapPin className="h-3.5 w-3.5 text-blue-600" />
                      {nearestCampus.distance_km} km
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <span className="metric-chip">AQI {nearestCampus.aqi ?? '--'}</span>
                    <span className="metric-chip">{nearestCampus.category}</span>
                    <button type="button" className="btn-secondary" onClick={() => setSelectedCampusId(nearestCampus.campus_id)}>
                      Open campus
                    </button>
                  </div>
                </div>
              ) : (
                !detectingLocation && <p className="text-sm text-slate-600">Location unavailable or nearest campus has not been determined yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Campus Prediction</p>
              <h3 className="mt-3 font-display text-2xl font-semibold text-slate-900">
                {selectedCampus ? `Predict AQI for ${selectedCampus.name}` : 'Select a campus to predict AQI'}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {role === 'student'
                  ? 'Students can review campus AQI and receive alerts, but cannot modify system data.'
                  : 'Use the existing ML model to generate AQI for the selected campus and store it in history.'}
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                const sample = await getSample();
                setPredictForm(sample);
              }}
              className="btn-secondary"
            >
              Load sample inputs
            </button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {Object.entries(predictForm).map(([key, value]) => (
              <label key={key}>
                <span className="field-label">{inputLabels[key]}</span>
                <input
                  type="number"
                  step="0.1"
                  className="field-input"
                  value={value}
                  onChange={(e) => setPredictForm((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                />
              </label>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="btn-primary" onClick={handlePredict} disabled={predicting || !selectedCampusId || role === 'student'}>
              {predicting ? 'Predicting…' : 'Predict campus AQI'}
            </button>
            <button type="button" className="btn-secondary" onClick={handleLivePredict} disabled={predicting || !selectedCampusId || role === 'student'}>
              {predicting ? 'Fetching live data…' : 'Use live external data'}
            </button>
            {selectedCampus ? <span className="metric-chip">{selectedCampus.location}</span> : null}
            <span className="metric-chip">Role: {role}</span>
          </div>
        </div>
      </div>

      {role === 'admin' ? (
        <div className="glass-panel p-5">
          <p className="eyebrow">Users</p>
          <h3 className="mt-3 font-display text-2xl font-semibold text-slate-900">Issued student and authority accounts</h3>
          <div className="mt-5 grid gap-3">
            {users.length ? (
              users.map((account) => (
                <div key={account.id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-slate-900">{account.username}</span>
                    <span className="metric-chip">{account.role}</span>
                    {account.assigned_campus_id ? <span className="metric-chip">Campus {account.assigned_campus_id}</span> : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No managed users yet.</p>
            )}
          </div>
        </div>
      ) : null}

      <div className="glass-panel p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">Filters</p>
            <p className="mt-2 text-sm text-slate-600">Sort campuses by AQI and show the highest pollution sites first.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="metric-chip">
              <Filter className="h-3.5 w-3.5 text-blue-600" />
              Top polluted campuses
            </span>
            <select className="field-input w-auto min-w-28" value={topCount} onChange={(e) => setTopCount(Number(e.target.value))}>
              {[3, 5, 10].map((count) => (
                <option key={count} value={count}>
                  Top {count}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {topCampuses.map((campus) => (
          <CampusCard key={campus.campus_id} campus={campus} highlighted={campus.campus_id === highestCampusId && (campus.aqi ?? 0) > 0} />
        ))}
      </div>

      <ComparisonChart comparison={sortedComparison} history={selectedHistory} />
    </motion.section>
  );
}
