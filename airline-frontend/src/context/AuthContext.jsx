import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginRequest, registerRequest, getProfileRequest, updateProfileRequest } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('skyline_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  // عند فتح التطبيق: لو فيه توكن، نتأكد إنه لسه صالح ونجيب بيانات المستخدم المحدّثة
  useEffect(() => {
    const token = localStorage.getItem('skyline_token');
    if (!token) {
      setLoading(false);
      return;
    }
    getProfileRequest()
      .then((res) => {
        setUser(res.data);
        localStorage.setItem('skyline_user', JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.removeItem('skyline_token');
        localStorage.removeItem('skyline_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = (data) => {
    const { token, ...userData } = data;
    localStorage.setItem('skyline_token', token);
    localStorage.setItem('skyline_user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email, password) => {
    const res = await loginRequest({ email, password });
    persist(res.data);
    return res.data;
  };

  const register = async (payload) => {
    const res = await registerRequest(payload);
    persist(res.data);
    return res.data;
  };

  const updateProfile = async (payload) => {
    const res = await updateProfileRequest(payload);
    const merged = { ...user, ...res.data };
    localStorage.setItem('skyline_user', JSON.stringify(merged));
    setUser(merged);
    return merged;
  };

  const logout = () => {
    localStorage.removeItem('skyline_token');
    localStorage.removeItem('skyline_user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
