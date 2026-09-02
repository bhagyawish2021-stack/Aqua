import api from './api';
export const login  = d => api.post('/api/auth/login',    d);
export const register = d => api.post('/api/auth/register', d);
export const logout = ()  => api.post('/api/auth/logout');
