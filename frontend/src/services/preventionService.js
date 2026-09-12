import api from './api';

export const evaluatePondHealth = (data) =>
  api.post('/api/prevention/evaluate', data);

export const getHealthHistory = (params = {}) =>
  api.get('/api/prevention/history', { params });

export const getPondHealthHistory = (pondId) =>
  api.get(`/api/prevention/history/pond/${pondId}`);

export const getPondTasks = (pondId) =>
  api.get(`/api/prevention/tasks/${pondId}`);

export const toggleTask = (taskId) =>
  api.patch(`/api/prevention/tasks/${taskId}/toggle`);

export const getNotifications = (farmerId) =>
  api.get('/api/prevention/notifications', { params: { farmer_id: farmerId } });

export const markNotificationRead = (id) =>
  api.patch(`/api/prevention/notifications/${id}/read`);
