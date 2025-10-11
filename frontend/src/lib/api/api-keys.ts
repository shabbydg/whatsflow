/**
 * API Keys Management API Client
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2152';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface APIKey {
  id: string;
  name: string;
  scopes: string[];
  environment: 'live' | 'test';
  is_active: boolean;
  last_used_at?: string;
  requests_count: number;
  created_at: string;
}

export interface CreateAPIKeyData {
  name: string;
  scopes?: string[];
  environment?: 'live' | 'test';
}

export interface APIKeyWithSecret extends APIKey {
  key: string; // Only present on creation
}

export const apiKeysAPI = {
  /**
   * Get all API keys
   */
  getAll: () => api.get<{ success: boolean; data: APIKey[] }>('/api-keys'),

  /**
   * Create new API key
   */
  create: (data: CreateAPIKeyData) =>
    api.post<{ success: boolean; data: APIKeyWithSecret; message: string }>(
      '/api-keys',
      data
    ),

  /**
   * Update API key
   */
  update: (id: string, data: { name?: string; scopes?: string[]; is_active?: boolean }) =>
    api.put<{ success: boolean; data: APIKey }>(`/api-keys/${id}`, data),

  /**
   * Delete API key
   */
  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/api-keys/${id}`),

  /**
   * Get usage statistics
   */
  getUsage: (id: string, days: number = 7) =>
    api.get<{
      success: boolean;
      data: Array<{ date: string; requests: number; avg_response_time: number }>;
    }>(`/api-keys/${id}/usage`, { params: { days } }),
};

