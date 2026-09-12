import api from './api';

export const getSpeciesCategories = () =>
  api.get('/api/hatcheries/species');

export const getFarmerHubs = () =>
  api.get('/api/hatcheries/hubs');

export const getHatcheries = (params = {}) =>
  api.get('/api/hatcheries', { params });

export const getHatcheryById = (id, params = {}) =>
  api.get(`/api/hatcheries/${id}`, { params });

export const createHatchery = (data) =>
  api.post('/api/hatcheries', data);

export const verifyHatchery = (id, isApproved = true) =>
  api.patch(`/api/hatcheries/${id}/verify`, { is_approved: isApproved });

export const addProduct = (hatcheryId, data) =>
  api.post(`/api/hatcheries/${hatcheryId}/products`, data);

export const updateProduct = (productId, data) =>
  api.patch(`/api/hatcheries/products/${productId}`, data);

export const createSeedOrder = (data) =>
  api.post('/api/hatcheries/orders', data);

export const getFarmerOrders = (farmerId) =>
  api.get('/api/hatcheries/orders/farmer', { params: { farmer_id: farmerId } });

export const getHatcheryOrders = (hatcheryId) =>
  api.get(`/api/hatcheries/${hatcheryId}/orders`);

export const updateOrderStatus = (orderId, status, rejectionReason = null) =>
  api.patch(`/api/hatcheries/orders/${orderId}/status`, { status, rejection_reason: rejectionReason });

export const submitReview = (hatcheryId, data) =>
  api.post(`/api/hatcheries/${hatcheryId}/reviews`, data);
