/**
 * Webhooks Management API Client
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2152';

const api = axios.create({
  baseURL: `${API_URL}/api/public/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add API key to requests (for webhook management via public API)
// Note: We'll actually use JWT auth for the management interface
// So we need a separate instance for JWT-authenticated webhook management
const managementApi = axios.create({
  baseURL: `${API_URL}/api/public/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

managementApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  description?: string;
  last_triggered_at?: string;
  success_count: number;
  failure_count: number;
  created_at: string;
  updated_at: string;
}

export interface WebhookWithSecret extends Webhook {
  secret: string; // Only present on creation
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: any;
  response_status?: number;
  response_body?: string;
  attempt_number: number;
  delivered_at: string;
  success: boolean;
  error_message?: string;
  next_retry_at?: string;
}

export interface CreateWebhookData {
  url: string;
  events: string[];
  description?: string;
}

export const AVAILABLE_EVENTS = [
  { value: 'message.received', label: 'Message Received', description: 'When an inbound message is received' },
  { value: 'message.sent', label: 'Message Sent', description: 'When an outbound message is sent' },
  { value: 'message.delivered', label: 'Message Delivered', description: 'When a message is delivered' },
  { value: 'message.failed', label: 'Message Failed', description: 'When a message fails to send' },
  { value: 'device.connected', label: 'Device Connected', description: 'When a device connects' },
  { value: 'device.disconnected', label: 'Device Disconnected', description: 'When a device disconnects' },
  { value: 'device.qr_updated', label: 'QR Code Updated', description: 'When a new QR code is generated' },
];

// For now, we'll use a custom implementation that uses API key auth
// In production, you might want to create a separate backend route that uses JWT
export const webhooksAPI = {
  /**
   * Get all webhooks (uses API key authentication)
   */
  getAll: (apiKey: string) =>
    api.get<{ success: boolean; data: Webhook[] }>('/webhooks', {
      headers: { Authorization: `Bearer ${apiKey}` },
    }),

  /**
   * Create webhook (uses API key authentication)
   */
  create: (apiKey: string, data: CreateWebhookData) =>
    api.post<{ success: boolean; data: WebhookWithSecret; message: string }>(
      '/webhooks',
      data,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    ),

  /**
   * Update webhook
   */
  update: (
    apiKey: string,
    id: string,
    data: { url?: string; events?: string[]; description?: string; is_active?: boolean }
  ) =>
    api.put<{ success: boolean; data: Webhook }>(`/webhooks/${id}`, data, {
      headers: { Authorization: `Bearer ${apiKey}` },
    }),

  /**
   * Delete webhook
   */
  delete: (apiKey: string, id: string) =>
    api.delete<{ success: boolean; message: string }>(`/webhooks/${id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    }),

  /**
   * Test webhook
   */
  test: (apiKey: string, id: string) =>
    api.post<{ success: boolean; message: string }>(`/webhooks/${id}/test`, {}, {
      headers: { Authorization: `Bearer ${apiKey}` },
    }),

  /**
   * Get webhook deliveries
   */
  getDeliveries: (apiKey: string, id: string, limit: number = 50) =>
    api.get<{ success: boolean; data: WebhookDelivery[] }>(`/webhooks/${id}/deliveries`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      params: { limit },
    }),
};

