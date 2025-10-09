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
  last_device_id?: string;
  device_name?: string;
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
  device_id?: string;
  device_name?: string;
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

// Broadcast System Types
export type MessageType = 'text' | 'image' | 'file' | 'location';
export type BroadcastStatus = 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed' | 'cancelled';
export type SendSpeed = 'slow' | 'normal' | 'fast' | 'custom';
export type RecipientStatus = 'pending' | 'queued' | 'sending' | 'sent' | 'delivered' | 'failed' | 'skipped';

export interface ContactList {
  id: string;
  business_profile_id: string;
  name: string;
  description?: string;
  total_contacts: number;
  created_at: string;
  updated_at: string;
}

export interface ContactListMember {
  id: string;
  list_id: string;
  contact_id?: string;
  phone_number: string;
  full_name?: string;
  custom_fields?: Record<string, any>;
  opted_out: boolean;
  created_at: string;
}

export interface Broadcast {
  id: string;
  business_profile_id: string;
  device_id: string;
  name: string;
  message_content: string;
  message_type: MessageType;
  media_url?: string;
  status: BroadcastStatus;
  send_speed: SendSpeed;
  custom_delay?: number;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BroadcastRecipient {
  id: string;
  broadcast_id: string;
  contact_id?: string;
  phone_number: string;
  full_name?: string;
  personalized_message?: string;
  status: RecipientStatus;
  message_id?: string;
  error_message?: string;
  sent_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BroadcastStats {
  total: number;
  pending: number;
  queued: number;
  sending: number;
  sent: number;
  delivered: number;
  failed: number;
  skipped: number;
}

export interface CreateBroadcastData {
  name: string;
  device_id: string;
  message_content: string;
  message_type?: MessageType;
  media_url?: string;
  send_speed?: SendSpeed;
  custom_delay?: number;
  scheduled_at?: string;
  contact_list_ids: string[];
}

export interface UpdateBroadcastData {
  name?: string;
  message_content?: string;
  message_type?: MessageType;
  media_url?: string;
  send_speed?: SendSpeed;
  custom_delay?: number;
  scheduled_at?: string;
}

export interface BroadcastGuidelines {
  title: string;
  sections: Array<{
    title: string;
    items: string[];
  }>;
}

export interface Persona {
  id: string;
  business_profile_id: string;
  name: string;
  description?: string;
  ai_instructions?: string;
  ai_model?: string;
  tone?: string;
  response_style?: string;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  device_count?: number;
}

export interface Device {
  id: string;
  business_profile_id: string;
  device_name: string;
  persona_id?: string;
  persona_name?: string;
  phone_number: string;
  connection_mode: string;
  status: 'qr_pending' | 'connected' | 'disconnected';
  is_primary: boolean;
  auto_reply_enabled: boolean;
  ai_enabled: boolean;
  ai_schedule?: { from: string; to: string }[];
  working_hours_start?: string;
  working_hours_end?: string;
  working_days?: string;
  email_on_disconnect?: boolean;
  qr_code?: string;
  last_connected_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AIModel {
  value: string;
  label: string;
  provider: string;
}

export interface BusinessProfile {
  id: string;
  business_name: string;
  industry?: string;
  website?: string;
  description?: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  business_hours?: {
    [key: string]: string;
  };
  products_services?: string[];
  faq?: Array<{ question: string; answer: string }>;
  business_type?: string;
  created_at: string;
  updated_at: string;
  last_scraped_at?: string;
  scraping_status?: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface ScrapingProgress {
  status: 'pending' | 'scraping' | 'analyzing' | 'completed' | 'failed';
  currentPage: number;
  totalPages: number;
  message: string;
  error?: string;
}

export interface KnowledgeBase {
  combined_knowledge: string;
  sources: {
    scraped: boolean;
    manual: boolean;
    files_count: number;
  };
  uploaded_files: Array<{
    filename: string;
    path: string;
    size: number;
    type: string;
    uploadedAt: string;
  }>;
}
