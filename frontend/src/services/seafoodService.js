import api from './api';

export const getTaxonomy = () =>
  api.get('/api/seafood/taxonomy');

export const getListings = (params = {}) =>
  api.get('/api/seafood/listings', { params });

export const getListingById = (id, params = {}) =>
  api.get(`/api/seafood/listings/${id}`, { params });

export const createListing = (data) =>
  api.post('/api/seafood/listings', data);

export const submitInquiryOrOffer = (data) =>
  api.post('/api/seafood/offers', data);

export const getFarmerOffers = () =>
  api.get('/api/seafood/offers/farmer');

export const getBuyerOffers = () =>
  api.get('/api/seafood/offers/buyer');

export const getOfferById = (id) =>
  api.get(`/api/seafood/offers/${id}`);

export const submitCounterOffer = (offerId, data) =>
  api.post(`/api/seafood/offers/${offerId}/counter`, data);

export const acceptOffer = (offerId, data = {}) =>
  api.patch(`/api/seafood/offers/${offerId}/accept`, data);

export const rejectOffer = (offerId, data = {}) =>
  api.patch(`/api/seafood/offers/${offerId}/reject`, data);

export const updateTradeStatus = (offerId, data) =>
  api.patch(`/api/seafood/offers/${offerId}/status`, data);

export const submitTradeReview = (offerId, data) =>
  api.post(`/api/seafood/offers/${offerId}/reviews`, data);
