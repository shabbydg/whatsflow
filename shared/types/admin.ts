export type AdminRole = 'super_admin' | 'support_admin' | 'finance_admin' | 'read_only';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  is_active: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface AdminActivityLog {
  id: string;
  admin_user_id: string;
  action: string;
  target_type: string;
  target_id: string;
  details?: any;
  ip_address: string;
  created_at: Date;
}


