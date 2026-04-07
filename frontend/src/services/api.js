import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

let accessHeaders = {
  Authorization: '',
};

export const setAuthToken = (token) => {
  accessHeaders = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

api.interceptors.request.use((config) => {
  config.headers = {
    ...config.headers,
    ...accessHeaders,
  };
  return config;
});

export const predictAQI = (payload) => api.post('/predict', payload).then((res) => res.data);
export const fetchHistory = () => api.get('/history').then((res) => res.data.records || []);
export const getSample = () => api.post('/generate-sample').then((res) => res.data.sample);
export const fetchHealth = () => api.get('/health').then((res) => res.data);
export const fetchAccessContext = () => api.get('/access/me').then((res) => res.data);
export const loginUser = (payload) => api.post('/auth/login', payload).then((res) => res.data);
export const createUser = (payload) => api.post('/users', payload).then((res) => res.data);
export const fetchUsers = () => api.get('/users').then((res) => res.data || []);
export const fetchRealtimeAQI = ({ latitude, longitude }) =>
  api
    .get('/realtime', {
      params: { latitude, longitude },
    })
    .then((res) => res.data);
export const addCampus = (payload) => api.post('/campus/add', payload).then((res) => res.data);
export const fetchCampuses = () => api.get('/campus/list').then((res) => res.data || []);
export const predictCampusAQI = (payload) => api.post('/campus/predict', payload).then((res) => res.data);
export const fetchCampusComparison = () => api.get('/campus/compare').then((res) => res.data || []);
export const fetchCampusHistory = (campusId, limit = 50) =>
  api.get(`/campus/${campusId}/history`, { params: { limit } }).then((res) => res.data);
export const fetchNearestCampus = ({ latitude, longitude }) =>
  api.get('/campus/nearest', { params: { latitude, longitude } }).then((res) => res.data);
export const fetchLiveCampusAQI = (campusId) => api.get(`/campus/${campusId}/live`).then((res) => res.data);

export default api;
