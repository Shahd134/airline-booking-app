import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL });

// يضيف التوكن تلقائيًا لكل الطلبات لو المستخدم مسجل دخول
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skyline_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// لو التوكن انتهت صلاحيته أو غير صالح، نطلع المستخدم ونرجعه للـ login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('skyline_token');
      localStorage.removeItem('skyline_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// بيلخص رسالة الخطأ القادمة من الـ API في نص واحد سهل العرض
export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';

export default api;
