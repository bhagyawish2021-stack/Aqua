import api from './api';
export const predict        = data => api.post('/api/ml/predict', data);
export const getMLHealth    = ()   => api.get('/api/ml/health');
export const getMLHistory   = (pid, limit) => api.get('/api/ml/history/' + pid + (limit ? '?limit=' + limit : ''));
