/**
 * Admin API Client
 * Handles all API calls for the admin panel
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2152';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  // Get token from zustand persisted state
  const authStorage = localStorage.getItem('admin-auth-storage');
  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch (error) {
      console.error('Failed to parse auth storage:', error);
    }
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin-auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminAPI = {
  // Auth
  login: (email: string, password: string) =>
    api.post('/admin/auth/login', { email, password }),

  getProfile: () => api.get('/admin/auth/profile'),

  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard/stats'),

  // Users
  getUsers: (params?: { status?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/admin/users', { params }),

  getUserDetails: (id: string) => api.get(`/admin/users/${id}`),

  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),

  // Subscriptions
  getSubscriptions: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/admin/subscriptions', { params }),

  makeAccountFree: (id: string, reason: string) =>
    api.post(`/admin/subscriptions/${id}/make-free`, { reason }),

  removeFreeStatus: (id: string) =>
    api.post(`/admin/subscriptions/${id}/remove-free`),

  // Payments
  getPayments: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/admin/payments', { params }),

  processRefund: (id: string, reason: string) =>
    api.post(`/admin/payments/${id}/refund`, { reason }),

  // Coupons
  getCoupons: () => api.get('/admin/coupons'),

  createCoupon: (data: any) => api.post('/admin/coupons', data),

  deleteCoupon: (id: string) => api.delete(`/admin/coupons/${id}`),
};
