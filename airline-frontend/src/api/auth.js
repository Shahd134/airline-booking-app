import api from '../lib/axios';

export const registerRequest = (payload) => api.post('/auth/register', payload).then((r) => r.data);
export const loginRequest = (payload) => api.post('/auth/login', payload).then((r) => r.data);
export const getProfileRequest = () => api.get('/auth/profile').then((r) => r.data);
export const updateProfileRequest = (payload) => api.put('/auth/profile', payload).then((r) => r.data);
