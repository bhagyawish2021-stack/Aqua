import api from './api';

export const getSpecializations = () =>
  api.get('/api/consultations/specializations');

export const getExperts = (params = {}) =>
  api.get('/api/consultations/experts', { params });

export const getExpertById = (id) =>
  api.get(`/api/consultations/experts/${id}`);

export const bookAppointment = (data) =>
  api.post('/api/consultations/appointments', data);

export const getFarmerAppointments = () =>
  api.get('/api/consultations/appointments/farmer');

export const getExpertAppointments = (expertId) =>
  api.get(`/api/consultations/appointments/expert/${expertId}`);

export const updateAppointmentStatus = (id, data) =>
  api.patch(`/api/consultations/appointments/${id}/status`, data);

export const submitReview = (expertId, data) =>
  api.post(`/api/consultations/experts/${expertId}/reviews`, data);
