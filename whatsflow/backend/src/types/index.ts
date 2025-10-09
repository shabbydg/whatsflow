export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

export interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  industry?: string;
  website?: string;
  description?: string;
  business_type?: string;
  created_at: Date;
  updated_at: Date;
}

export interface WhatsAppConnection {
  id: string;
  business_profile_id: string;
  phone_number: string;
  connection_mode: 'whatsapp-web' | 'baileys';
  status: 'connected' | 'disconnected' | 'qr_pending';
  session_data?: string;
  qr_code?: string;
  last_connected_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Contact {
  id: string;
  business_profile_id: string;
  phone_number: string;
  name?: string;
  profile_pic_url?: string;
  is_business: boolean;
  metadata?: any;
  first_message_at?: Date;
  last_message_at?: Date;
  total_messages: number;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: string;
  business_profile_id: string;
  contact_id: string;
  whatsapp_message_id?: string;
  direction: 'inbound' | 'outbound';
  message_type: string;
  content?: string;
  media_url?: string;
  status?: string;
  is_from_bot: boolean;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface Tag {
  id: string;
  business_profile_id: string;
  name: string;
  color: string;
  created_at: Date;
}

export interface Campaign {
  id: string;
  business_profile_id: string;
  name: string;
  message_content: string;
  media_url?: string;
  target_type: 'all' | 'tags' | 'custom';
  target_tags?: string[];
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  scheduled_at?: Date;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  created_at: Date;
  updated_at: Date;
}
