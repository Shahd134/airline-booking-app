import api from '../lib/axios';

export const getSeatsByFlight = (flightId) => api.get(`/seats/flight/${flightId}`).then((r) => r.data);
export const generateSeats = (flightId, payload) =>
  api.post(`/seats/generate/${flightId}`, payload).then((r) => r.data);
