import api from './api';

export const getTaxonomy = () =>
  api.get('/api/jobs/taxonomy');

export const getJobs = (params = {}) =>
  api.get('/api/jobs', { params });

export const getJobById = (id) =>
  api.get(`/api/jobs/${id}`);

export const createJob = (data) =>
  api.post('/api/jobs', data);

export const updateJob = (id, data) =>
  api.put(`/api/jobs/${id}`, data);

export const deleteJob = (id) =>
  api.delete(`/api/jobs/${id}`);

export const getWorkers = (params = {}) =>
  api.get('/api/jobs/workers', { params });

export const getMyWorkerProfile = () =>
  api.get('/api/jobs/workers/me');

export const saveMyWorkerProfile = (data) =>
  api.post('/api/jobs/workers/me', data);

export const applyForJob = (jobId, data) =>
  api.post(`/api/jobs/${jobId}/apply`, data);

export const getJobApplications = (jobId) =>
  api.get(`/api/jobs/${jobId}/applications`);

export const getMyApplications = () =>
  api.get('/api/jobs/applications/me');

export const updateApplicationStatus = (applicationId, status) =>
  api.patch(`/api/jobs/applications/${applicationId}/status`, { status });

export const submitReview = (data) =>
  api.post('/api/jobs/reviews', data);

export const submitReport = (data) =>
  api.post('/api/jobs/reports', data);
