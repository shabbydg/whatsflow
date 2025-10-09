// FILE: src/types/index.ts
export interface User {
  id: string;
  email: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Contact {
  id: string;
  phone_number: string;
  name: string;
  profile_pic_url?: string;
  is_business: boolean;
  last_message_at?: string;
  total_messages: number;
  tags?: Tag[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  contact_count?: number;
}

export interface Message {
  id: string;
  contact_id: string;
  contact_name?: string;
  phone_number?: string;
  direction: 'inbound' | 'outbound';
  message_type: string;
  content: string;
  media_url?: string;
  status?: string;
  created_at: string;
}

export interface WhatsAppStatus {
  status: 'not_connected' | 'qr_pending' | 'connected' | 'disconnected';
  phoneNumber?: string;
  qrCode?: string;
  lastConnected?: string;
}

export interface Campaign {
  id: string;
  name: string;
  message_content: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  created_at: string;
}

// ============================================

// FILE: src/lib/api.ts
import axios from 'axios';

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

// Auth API
export const authAPI = {
  register: (email: string, password: string, fullName: string) =>
    api.post('/auth/register', { email, password, fullName }),
  
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  getProfile: () =>
    api.get('/auth/profile'),
};

// WhatsApp API
export const whatsappAPI = {
  connect: (phoneNumber: string) =>
    api.post('/whatsapp/connect', { phoneNumber }),
  
  getStatus: () =>
    api.get('/whatsapp/status'),
  
  disconnect: () =>
    api.post('/whatsapp/disconnect'),
  
  sendMessage: (phoneNumber: string, message: string) =>
    api.post('/whatsapp/send', { phoneNumber, message }),
};

// Contacts API
export const contactsAPI = {
  getAll: (page = 1, limit = 50) =>
    api.get('/contacts', { params: { page, limit } }),
  
  getById: (id: string) =>
    api.get(`/contacts/${id}`),
  
  create: (phoneNumber: string, name?: string) =>
    api.post('/contacts', { phoneNumber, name }),
  
  update: (id: string, data: any) =>
    api.put(`/contacts/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/contacts/${id}`),
  
  search: (query: string) =>
    api.get('/contacts/search', { params: { q: query } }),
  
  getTags: () =>
    api.get('/contacts/tags'),
  
  createTag: (name: string, color: string) =>
    api.post('/contacts/tags', { name, color }),
  
  addTag: (contactId: string, tagId: string) =>
    api.post(`/contacts/${contactId}/tags`, { tagId }),
};

// Messages API
export const messagesAPI = {
  getAll: (contactId?: string, page = 1, limit = 50) =>
    api.get('/messages', { params: { contactId, page, limit } }),
  
  getConversation: (contactId: string, limit = 100) =>
    api.get(`/messages/conversation/${contactId}`, { params: { limit } }),
  
  getStats: (days = 7) =>
    api.get('/messages/stats', { params: { days } }),
};

export default api;

// ============================================

// FILE: src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

export function formatPhone(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as +1 (234) 567-8900
  if (cleaned.length === 11) {
    return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

// ============================================

// FILE: src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token });
      },
      
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },
      
      isAuthenticated: () => {
        return get().token !== null;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// ============================================

// FILE: src/stores/whatsappStore.ts
import { create } from 'zustand';
import { WhatsAppStatus } from '@/types';

interface WhatsAppState {
  status: WhatsAppStatus | null;
  setStatus: (status: WhatsAppStatus) => void;
  isConnected: () => boolean;
}

export const useWhatsAppStore = create<WhatsAppState>((set, get) => ({
  status: null,
  
  setStatus: (status) => set({ status }),
  
  isConnected: () => {
    return get().status?.status === 'connected';
  },
}));

// ============================================

// FILE: src/lib/socket.ts
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const initSocket = (businessProfileId: string) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      socket?.emit('join-business', businessProfileId);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};