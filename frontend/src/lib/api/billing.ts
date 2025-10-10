/**
 * Billing API Client
 * Handles all API calls for billing, subscriptions, and payments
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

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price_monthly: number;
  price_annual: number;
  currency: string;
  features: Record<string, any>;
  limits: Record<string, any>;
  is_active: boolean;
  display_order: number;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'trial' | 'active' | 'past_due' | 'canceled' | 'paused' | 'expired';
  billing_cycle: 'monthly' | 'annual';
  current_price: number;
  currency: string;
  trial_ends_at?: string;
  current_period_start?: string;
  current_period_end?: string;
  next_billing_date?: string;
  cancel_at_period_end: boolean;
  is_free: boolean;
  free_reason?: string;
}

export interface Usage {
  devices_used: number;
  contacts_count: number;
  messages_sent: number;
  ai_messages_count: number;
  broadcasts_sent: number;
  messages_overage: number;
  ai_messages_overage: number;
}

export interface PayHereCheckoutData {
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  order_id: string;
  items: string;
  currency: string;
  recurrence?: string;
  duration?: string;
  amount: string;
  hash: string;
}

export const billingAPI = {
  // Plans
  getPlans: () => api.get<{ success: boolean; data: Plan[] }>('/plans'),

  getPlan: (id: string) => api.get<{ success: boolean; data: Plan }>(`/plans/${id}`),

  // Subscription
  getSubscription: () =>
    api.get<{
      success: boolean;
      data: { subscription: Subscription; plan: Plan; usage: Usage };
    }>('/subscription'),

  startTrial: () =>
    api.post<{ success: boolean; data: Subscription }>('/subscription/trial'),

  subscribe: (planId: string, billingCycle: 'monthly' | 'annual') =>
    api.post<{
      success: boolean;
      data: { checkout: PayHereCheckoutData; subscription: Subscription };
    }>('/subscription/subscribe', { plan_id: planId, billing_cycle: billingCycle }),

  cancelSubscription: (immediately: boolean = false) =>
    api.post<{ success: boolean; data: Subscription }>('/subscription/cancel', {
      immediately,
    }),

  reactivateSubscription: () =>
    api.post<{ success: boolean; data: Subscription }>('/subscription/reactivate'),

  getUsage: () =>
    api.get<{
      success: boolean;
      data: { usage: Usage; percentages: { messages: number; ai_messages: number } };
    }>('/subscription/usage'),

  // Payments
  getPaymentHistory: (limit: number = 50) =>
    api.get<{ success: boolean; data: any[] }>('/billing/payments', {
      params: { limit },
    }),
};

