/**
 * Billing Configuration
 * Central configuration for billing, plans, and payment processing
 */

export const billingConfig = {
  // PayHere Configuration
  payhere: {
    merchantId: process.env.PAYHERE_MERCHANT_ID || '',
    merchantSecret: process.env.PAYHERE_MERCHANT_SECRET || '',
    appId: process.env.PAYHERE_APP_ID || '',
    appSecret: process.env.PAYHERE_APP_SECRET || '',
    mode: process.env.PAYHERE_MODE || 'sandbox',
    
    // URLs
    checkoutUrl: process.env.PAYHERE_MODE === 'live' 
      ? 'https://www.payhere.lk/pay/checkout'
      : 'https://sandbox.payhere.lk/pay/checkout',
    apiUrl: process.env.PAYHERE_MODE === 'live'
      ? 'https://www.payhere.lk/merchant/v1'
      : 'https://sandbox.payhere.lk/merchant/v1',
    
    // Callback URLs
    returnUrl: process.env.PAYHERE_RETURN_URL || 'http://localhost:2153/billing/success',
    cancelUrl: process.env.PAYHERE_CANCEL_URL || 'http://localhost:2153/billing/cancel',
    notifyUrl: process.env.PAYHERE_NOTIFY_URL || 'http://localhost:2152/api/v1/billing/webhook',
  },

  // Currency configuration
  currency: {
    default: 'USD',
    supported: ['USD', 'LKR'],
  },

  // Trial configuration
  trial: {
    durationDays: 7,
    requiresCreditCard: false,
  },

  // Overage pricing (per unit in USD)
  overagePricing: {
    message: 0.01,          // $0.01 per message
    aiMessage: 0.02,        // $0.02 per AI message
    bulkDiscount: {
      enabled: true,
      threshold: 1000,
      discountRate: 0.20,   // 20% off for 1000+ messages
    },
  },

  // Add-on pricing
  addons: {
    device: {
      price: 10.00,         // $10 per additional device
      billingCycle: 'monthly',
    },
  },

  // Payment retry configuration
  paymentRetry: {
    maxAttempts: 3,
    retrySchedule: [1, 3, 7], // Days after failure
    gracePeriodDays: 10,      // Days before suspension
  },

  // Invoice configuration
  invoice: {
    prefix: 'INV',
    numberLength: 8,
    includesPdf: true,
  },

  // Usage reset configuration
  usage: {
    resetDay: 1,              // First day of month
    warningThresholds: [0.8, 0.9], // 80% and 90%
  },

  // Proration
  proration: {
    enabled: true,
    calculateOnDayBasis: true,
  },

  // Email configuration
  email: {
    from: process.env.EMAIL_FROM || 'noreply@whatsflow.ai',
    replyTo: process.env.EMAIL_REPLY_TO || 'support@whatsflow.ai',
  },
};

// Plan feature flags
export const planFeatures = {
  ai_replies: 'AI-powered automatic replies',
  knowledge_base: 'Custom knowledge base',
  web_scraping: 'Website scraping for AI training',
  file_uploads: 'Upload PDF/DOCX for knowledge',
  broadcasts: 'Bulk messaging campaigns',
  custom_personas: 'Custom AI personalities',
  priority_support: 'Priority email/chat support',
  advanced_analytics: 'Advanced analytics dashboard',
  api_access: 'REST API access',
  custom_integrations: 'Custom integrations',
  dedicated_support: 'Dedicated account manager',
  white_label: 'White-label options',
  custom_ai_training: 'Custom AI model training',
};

// Plan limit keys
export const planLimits = {
  devices: 'WhatsApp devices',
  contacts: 'Contacts',
  messages_per_month: 'Messages per month',
  ai_messages_per_month: 'AI messages per month',
  broadcasts_per_month: 'Broadcasts per month',
  trial_days: 'Trial duration (days)',
};

// Helper to check if limit is unlimited
export function isUnlimited(limit: number): boolean {
  return limit === -1;
}

// Helper to format limit display
export function formatLimit(limit: number, suffix: string = ''): string {
  if (isUnlimited(limit)) {
    return 'Unlimited';
  }
  if (limit >= 1000) {
    return `${(limit / 1000).toFixed(0)}K${suffix}`;
  }
  return `${limit}${suffix}`;
}

