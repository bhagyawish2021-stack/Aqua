import api from './api';
export const getProfile    = ()   => api.get('/api/profile');
export const updateProfile = data => api.put('/api/profile', data);
