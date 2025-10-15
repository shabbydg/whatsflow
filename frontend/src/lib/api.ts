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

  syncContacts: () =>
    api.post('/whatsapp/sync-contacts'),
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

// Personas API
export const personasAPI = {
  getAll: () =>
    api.get('/personas'),

  getById: (id: string) =>
    api.get(`/personas/${id}`),

  create: (data: {
    name: string;
    description?: string;
    ai_instructions?: string;
    ai_model?: string;
    tone?: string;
    response_style?: string;
  }) =>
    api.post('/personas', data),

  update: (id: string, data: any) =>
    api.put(`/personas/${id}`, data),

  delete: (id: string) =>
    api.delete(`/personas/${id}`),

  getAvailableModels: () =>
    api.get('/personas/models/available'),
};

// Devices API
export const devicesAPI = {
  getAll: () =>
    api.get('/devices'),

  getById: (id: string) =>
    api.get(`/devices/${id}`),

  create: (data: {
    device_name: string;
    phone_number: string;
    persona_id?: string;
    auto_reply_enabled?: boolean;
    working_hours_start?: string;
    working_hours_end?: string;
    working_days?: string;
  }) =>
    api.post('/devices', data),

  update: (id: string, data: any) =>
    api.put(`/devices/${id}`, data),

  delete: (id: string) =>
    api.delete(`/devices/${id}`),

  getStats: (id: string) =>
    api.get(`/devices/${id}/stats`),

  reconnect: (id: string) =>
    api.post(`/devices/${id}/reconnect`),
};

// Profile API
export const profileAPI = {
  // Get profile
  getProfile: () =>
    api.get('/profile'),

  // Update profile
  updateProfile: (data: any) =>
    api.put('/profile', data),

  // Website scraping
  scrapeWebsite: (website_url: string) =>
    api.post('/profile/scrape', { website_url }),

  getScrapingStatus: () =>
    api.get('/profile/scraping/status'),

  getScrapingProgress: () =>
    api.get('/profile/scraping/progress'),

  // Knowledge base
  getKnowledgeBase: () =>
    api.get('/profile/knowledge'),

  updateKnowledgeBase: (data: { ai_knowledge_base?: string; manual_knowledge?: string }) =>
    api.put('/profile/knowledge', data),

  uploadKnowledgeFile: (formData: FormData) => {
    return api.post('/profile/knowledge/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  addManualKnowledge: (data: { knowledge: string; title?: string }) =>
    api.post('/profile/knowledge/manual', data),
};

// Leads API
export const leadsAPI = {
  // Get all leads with optional filters
  getAll: (params?: {
    temperature?: 'hot' | 'warm' | 'cold';
    status?: string;
    minScore?: number;
  }) =>
    api.get('/leads', { params }),

  // Get lead statistics
  getStats: () =>
    api.get('/leads/stats'),

  // Get single lead by ID
  getById: (id: string) =>
    api.get(`/leads/${id}`),

  // Get lead activities/timeline
  getActivities: (id: string) =>
    api.get(`/leads/${id}/activities`),

  // Generate/regenerate lead profile
  generateProfile: (contactId: string) =>
    api.post('/leads/generate', { contactId }),

  // Detect intent from message
  detectIntent: (message: string) =>
    api.post('/leads/detect-intent', { message }),

  // Update lead status
  updateStatus: (id: string, status: string, notes?: string) =>
    api.put(`/leads/${id}/status`, { status, notes }),

  // Add note to lead
  addNote: (id: string, note: string) =>
    api.post(`/leads/${id}/notes`, { note }),

  // Qualify/disqualify lead
  qualifyLead: (id: string, qualified: boolean, notes?: string) =>
    api.put(`/leads/${id}/qualify`, { qualified, notes }),

  // Update lead profile details
  updateProfile: (id: string, data: {
    contact_name?: string;
    phone_number?: string;
    email?: string;
    company_name?: string;
    job_title?: string;
    industry?: string;
    team_size?: string;
    website?: string;
    location?: string;
    street_address?: string;
    city?: string;
    state_province?: string;
    postal_code?: string;
    country?: string;
  }) =>
    api.put(`/leads/${id}/profile`, data),
};

export default api;
