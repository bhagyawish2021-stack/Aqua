import api from './api';

export const getCategories = () =>
  api.get('/api/supplies/categories');

export const getProducts = (params = {}) =>
  api.get('/api/supplies/products', { params });

export const getProductById = (id) =>
  api.get(`/api/supplies/products/${id}`);

export const createProduct = (data) =>
  api.post('/api/supplies/products', data);

export const updateProductStock = (id, stock_quantity) =>
  api.patch(`/api/supplies/products/${id}/stock`, { stock_quantity });

export const placeOrder = (data) =>
  api.post('/api/supplies/orders', data);

export const getFarmerOrders = () =>
  api.get('/api/supplies/orders/farmer');

export const getSellerOrders = (sellerId = 'seller-godavari-01') =>
  api.get(`/api/supplies/orders/seller/${sellerId}`);

export const updateOrderStatus = (id, data) =>
  api.patch(`/api/supplies/orders/${id}/status`, data);

export const submitProductReview = (id, data) =>
  api.post(`/api/supplies/products/${id}/reviews`, data);
