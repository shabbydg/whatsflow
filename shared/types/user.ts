export interface User {
  id: string;
  email: string;
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


