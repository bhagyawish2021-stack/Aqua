import api from './api';
export const chat = data => api.post('/api/ai/chat', data);
