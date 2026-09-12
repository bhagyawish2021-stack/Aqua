import api from './api';

export const getMarketOverview = (params = {}) =>
  api.get('/api/market/overview', { params });

export const getSpecies = () =>
  api.get('/api/market/species');

export const getLocations = () =>
  api.get('/api/market/locations');

export const getPriceHistory = (priceId, range = 'daily') =>
  api.get(`/api/market/history/${priceId}`, { params: { range } });

export const getWatchlist = () =>
  api.get('/api/market/watchlist');

export const addToWatchlist = (priceId) =>
  api.post(`/api/market/watchlist/${priceId}`);

export const removeFromWatchlist = (priceId) =>
  api.delete(`/api/market/watchlist/${priceId}`);

export const getAlerts = () =>
  api.get('/api/market/alerts');

export const createAlert = (data) =>
  api.post('/api/market/alerts', data);

export const deleteAlert = (alertId) =>
  api.delete(`/api/market/alerts/${alertId}`);

export const updatePriceAdmin = (data) =>
  api.put('/api/market/admin/price', data);
