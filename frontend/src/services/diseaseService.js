import api from './api';

export const analyzeSpecimen = (data) =>
  api.post('/api/disease/analyze', data);

export const getDiseaseHistory = (params = {}) =>
  api.get('/api/disease/history', { params });

export const getPondDiseaseHistory = (pondId) =>
  api.get(`/api/disease/history/pond/${pondId}`);

export const requestExpertConsultation = (analysisId, data = {}) =>
  api.patch(`/api/disease/${analysisId}/expert-consultation`, data);

export const getDiseaseAlerts = (farmerId) =>
  api.get('/api/disease/alerts', { params: { farmer_id: farmerId } });

export const markAlertAsRead = (alertId) =>
  api.patch(`/api/disease/alerts/${alertId}/read`);
