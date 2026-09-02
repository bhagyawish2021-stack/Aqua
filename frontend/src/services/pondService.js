import api from './api';
export const getPonds    = ()      => api.get('/api/ponds');
export const getPond     = id      => api.get('/api/ponds/' + id);
export const createPond  = data    => api.post('/api/ponds', data);
export const updatePond  = (id, d) => api.put('/api/ponds/' + id, d);
export const deletePond  = id      => api.delete('/api/ponds/' + id);
