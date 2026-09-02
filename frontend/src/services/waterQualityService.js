import api from './api';
const base = pid => '/api/ponds/' + pid + '/water-quality';
export const getWQ    = pid      => api.get(base(pid));
export const createWQ = (pid, d) => api.post(base(pid), d);
export const deleteWQ = (pid,id) => api.delete(base(pid) + '/' + id);
