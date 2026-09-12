import api from '../lib/axios';

export const getDashboardStats = () => api.get('/admin/dashboard').then((r) => r.data);
export const getAllUsers = (params) => api.get('/admin/users', { params }).then((r) => r.data);
export const updateUser = (id, payload) => api.put(`/admin/users/${id}`, payload).then((r) => r.data);
export const getAllBookingsAdmin = (params) => api.get('/admin/bookings', { params }).then((r) => r.data);
