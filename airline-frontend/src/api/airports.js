import api from '../lib/axios';

export const getAirports = () => api.get('/airports').then((r) => r.data);
export const createAirport = (payload) => api.post('/airports', payload).then((r) => r.data);
