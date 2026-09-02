import api from './api';
const base = pid => '/api/ponds/' + pid + '/business';
export const getBusiness        = pid      => api.get(base(pid));
export const getBusinessSummary = pid      => api.get(base(pid) + '/summary');
export const createBusiness     = (pid, d) => api.post(base(pid), d);
export const deleteBusiness     = (pid,id) => api.delete(base(pid) + '/' + id);
