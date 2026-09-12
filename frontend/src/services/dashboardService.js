import api from './api';

export const getFarmerOverview = (params = {}) =>
  api.get('/api/dashboard/overview', { params });

export const getRoleDashboard = (role = 'farmer', params = {}) =>
  api.get('/api/dashboard/role-view', { params: { role, ...params } });

export const markNotificationRead = (id) =>
  api.patch(`/api/dashboard/notifications/${id}/read`);
