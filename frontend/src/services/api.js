import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

export const predictAQI = (payload) => api.post('/predict', payload).then((res) => res.data);
export const fetchHistory = () => api.get('/history').then((res) => res.data.records || []);
export const getSample = () => api.post('/generate-sample').then((res) => res.data.sample);

export default api;
