export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  subscription_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: string;
  provider_payment_id?: string;
  invoice_url?: string;
  attempted_at: Date;
  paid_at?: Date;
  created_at: Date;
}

export interface Invoice {
  id: string;
  subscription_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void';
  invoice_number: string;
  invoice_url?: string;
  due_date: Date;
  paid_at?: Date;
  created_at: Date;
}


