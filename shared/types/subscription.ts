export type PlanInterval = 'monthly' | 'annual';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'paused';

export interface Plan {
  id: string;
  name: string;
  description?: string;
  price_monthly: number;
  price_annual: number;
  features: PlanFeatures;
  limits: PlanLimits;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PlanFeatures {
  ai_replies: boolean;
  knowledge_base: boolean;
  broadcasts: boolean;
  campaigns: boolean;
  advanced_analytics: boolean;
  priority_support: boolean;
  custom_integrations: boolean;
}

export interface PlanLimits {
  devices: number;
  contacts: number;
  messages_per_month: number;
  ai_conversations: number;
  broadcasts_per_month: number;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  billing_cycle: PlanInterval;
  current_period_start: Date;
  current_period_end: Date;
  trial_ends_at?: Date;
  cancel_at_period_end: boolean;
  payment_provider: string;
  provider_subscription_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UsageStats {
  user_id: string;
  period_start: Date;
  period_end: Date;
  devices_used: number;
  contacts_count: number;
  messages_sent: number;
  ai_conversations: number;
  broadcasts_sent: number;
}


