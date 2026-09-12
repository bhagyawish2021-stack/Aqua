import api from './api';

export const getCategories = () =>
  api.get('/api/equipment/categories');

export const getListings = (params = {}) =>
  api.get('/api/equipment', { params });

export const getListingById = (id) =>
  api.get(`/api/equipment/${id}`);

export const createListing = (data) =>
  api.post('/api/equipment', data);

export const updateListing = (id, data) =>
  api.put(`/api/equipment/${id}`, data);

export const markListingStatus = (id, status) =>
  api.patch(`/api/equipment/${id}/status`, { status });

export const deleteListing = (id) =>
  api.delete(`/api/equipment/${id}`);

export const getFavorites = () =>
  api.get('/api/equipment/favorites/me');

export const toggleFavorite = (id, action) =>
  api.post(`/api/equipment/${id}/favorite`, { action });

export const submitReview = (data) =>
  api.post('/api/equipment/reviews', data);

export const submitReport = (data) =>
  api.post('/api/equipment/reports', data);

export const recordInquiry = (id) =>
  api.post(`/api/equipment/${id}/inquire`);

