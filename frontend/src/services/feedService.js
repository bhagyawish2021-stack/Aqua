import api from './api';
const base = pid => '/api/ponds/' + pid + '/feed';
export const getFeed    = pid      => api.get(base(pid));
export const createFeed = (pid, d) => api.post(base(pid), d);
export const deleteFeed = (pid,id) => api.delete(base(pid) + '/' + id);
