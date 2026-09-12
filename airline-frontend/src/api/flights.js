import api from '../lib/axios';

export const searchFlights = (params) => api.get('/flights', { params }).then((r) => r.data);
export const getFlight = (id) => api.get(`/flights/${id}`).then((r) => r.data);
export const createFlight = (payload) => api.post('/flights', payload).then((r) => r.data);
export const updateFlight = (id, payload) => api.put(`/flights/${id}`, payload).then((r) => r.data);
export const deleteFlight = (id) => api.delete(`/flights/${id}`).then((r) => r.data);
