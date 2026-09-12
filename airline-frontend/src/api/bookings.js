import api from '../lib/axios';

export const createBooking = (payload) => api.post('/bookings', payload).then((r) => r.data);
export const getMyBookings = (params) => api.get('/bookings/my', { params }).then((r) => r.data);
export const getBookingById = (id) => api.get(`/bookings/${id}`).then((r) => r.data);
export const getBookingByReference = (ref) => api.get(`/bookings/reference/${ref}`).then((r) => r.data);
export const cancelBooking = (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }).then((r) => r.data);
export const payForBooking = (id, cardNumber) => api.post(`/bookings/${id}/pay`, { cardNumber }).then((r) => r.data);
