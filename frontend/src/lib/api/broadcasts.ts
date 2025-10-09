/**
 * Broadcast API Client
 * Handles all API calls for broadcast campaigns
 */

import axios from 'axios';

// Create axios instance with base config
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

import type {
  Broadcast,
  BroadcastRecipient,
  BroadcastStats,
  BroadcastGuidelines,
  CreateBroadcastData,
  UpdateBroadcastData,
  ContactList,
  ContactListMember,
} from '@/types';

interface PaginatedResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

// ==================== Contact Lists ====================

export const contactListsApi = {
  /**
   * Get all contact lists
   */
  async getAll(): Promise<ContactList[]> {
    const response = await api.get<PaginatedResponse<ContactList[]>>('/contact-lists');
    return response.data.data;
  },

  /**
   * Get a single contact list by ID
   */
  async getById(listId: string): Promise<ContactList> {
    const response = await api.get<{ success: boolean; data: ContactList }>(
      `/contact-lists/${listId}`
    );
    return response.data.data;
  },

  /**
   * Create a new contact list
   */
  async create(data: { name: string; description?: string }): Promise<ContactList> {
    const response = await api.post<{ success: boolean; data: ContactList }>(
      '/contact-lists',
      data
    );
    return response.data.data;
  },

  /**
   * Update a contact list
   */
  async update(
    listId: string,
    data: { name?: string; description?: string }
  ): Promise<ContactList> {
    const response = await api.put<{ success: boolean; data: ContactList }>(
      `/contact-lists/${listId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete a contact list
   */
  async delete(listId: string): Promise<void> {
    await api.delete(`/contact-lists/${listId}`);
  },

  /**
   * Get members of a contact list
   */
  async getMembers(
    listId: string,
    options?: {
      page?: number;
      limit?: number;
      excludeOptedOut?: boolean;
    }
  ): Promise<{ members: ContactListMember[]; total: number }> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.excludeOptedOut) params.append('excludeOptedOut', 'true');

    const response = await api.get<PaginatedResponse<ContactListMember[]>>(
      `/contact-lists/${listId}/members?${params.toString()}`
    );

    return {
      members: response.data.data,
      total: response.data.pagination?.total || 0,
    };
  },

  /**
   * Add a contact to a list
   */
  async addMember(
    listId: string,
    data: {
      phone_number: string;
      full_name?: string;
      contact_id?: string;
      custom_fields?: Record<string, any>;
    }
  ): Promise<ContactListMember> {
    const response = await api.post<{ success: boolean; data: ContactListMember }>(
      `/contact-lists/${listId}/members`,
      data
    );
    return response.data.data;
  },

  /**
   * Remove a contact from a list
   */
  async removeMember(listId: string, memberId: string): Promise<void> {
    await api.delete(`/contact-lists/${listId}/members/${memberId}`);
  },

  /**
   * Import contacts from CSV file
   */
  async importCsv(
    listId: string,
    file: File
  ): Promise<{ added: number; errors: string[]; total: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<{
      success: boolean;
      data: { added: number; errors: string[]; total: number };
    }>(`/contact-lists/${listId}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },

  /**
   * Mark a contact as opted out
   */
  async markOptOut(listId: string, memberId: string): Promise<void> {
    await api.post(`/contact-lists/${listId}/members/${memberId}/opt-out`);
  },

  /**
   * Mark a contact as opted in
   */
  async markOptIn(listId: string, memberId: string): Promise<void> {
    await api.post(`/contact-lists/${listId}/members/${memberId}/opt-in`);
  },
};

// ==================== Broadcasts ====================

export const broadcastsApi = {
  /**
   * Get safety guidelines
   */
  async getGuidelines(): Promise<BroadcastGuidelines> {
    const response = await api.get<{ success: boolean; data: BroadcastGuidelines }>(
      '/broadcasts/guidelines'
    );
    return response.data.data;
  },

  /**
   * Acknowledge guidelines
   */
  async acknowledgeGuidelines(): Promise<void> {
    await api.post('/broadcasts/acknowledge-guidelines');
  },

  /**
   * Check if user has acknowledged guidelines
   */
  async getGuidelinesStatus(): Promise<{ acknowledged: boolean; acknowledged_at: string | null }> {
    const response = await api.get<{
      success: boolean;
      data: { acknowledged: boolean; acknowledged_at: string | null };
    }>('/broadcasts/guidelines-status');
    return response.data.data;
  },

  /**
   * Get all broadcasts
   */
  async getAll(options?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ broadcasts: Broadcast[]; total: number }> {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());

    const response = await api.get<PaginatedResponse<Broadcast[]>>(
      `/broadcasts?${params.toString()}`
    );

    return {
      broadcasts: response.data.data,
      total: response.data.pagination?.total || 0,
    };
  },

  /**
   * Get a single broadcast by ID
   */
  async getById(broadcastId: string): Promise<Broadcast> {
    const response = await api.get<{ success: boolean; data: Broadcast }>(
      `/broadcasts/${broadcastId}`
    );
    return response.data.data;
  },

  /**
   * Create a new broadcast
   */
  async create(data: CreateBroadcastData): Promise<Broadcast> {
    const response = await api.post<{ success: boolean; data: Broadcast }>('/broadcasts', data);
    return response.data.data;
  },

  /**
   * Update a broadcast (draft only)
   */
  async update(broadcastId: string, data: UpdateBroadcastData): Promise<Broadcast> {
    const response = await api.put<{ success: boolean; data: Broadcast }>(
      `/broadcasts/${broadcastId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete a broadcast
   */
  async delete(broadcastId: string): Promise<void> {
    await api.delete(`/broadcasts/${broadcastId}`);
  },

  /**
   * Start sending a broadcast
   */
  async send(broadcastId: string): Promise<void> {
    await api.post(`/broadcasts/${broadcastId}/send`);
  },

  /**
   * Cancel a broadcast
   */
  async cancel(broadcastId: string): Promise<void> {
    await api.post(`/broadcasts/${broadcastId}/cancel`);
  },

  /**
   * Get broadcast progress/stats
   */
  async getProgress(broadcastId: string): Promise<BroadcastStats> {
    const response = await api.get<{ success: boolean; data: BroadcastStats }>(
      `/broadcasts/${broadcastId}/progress`
    );
    return response.data.data;
  },

  /**
   * Get broadcast recipients
   */
  async getRecipients(
    broadcastId: string,
    options?: {
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ recipients: BroadcastRecipient[]; total: number }> {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());

    const response = await api.get<PaginatedResponse<BroadcastRecipient[]>>(
      `/broadcasts/${broadcastId}/recipients?${params.toString()}`
    );

    return {
      recipients: response.data.data,
      total: response.data.pagination?.total || 0,
    };
  },
};
