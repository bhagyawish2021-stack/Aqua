import api from './api';
const base = pid => '/api/ponds/' + pid + '/growth';
export const getGrowth    = pid      => api.get(base(pid));
export const createGrowth = (pid, d) => api.post(base(pid), d);
export const deleteGrowth = (pid,id) => api.delete(base(pid) + '/' + id);
