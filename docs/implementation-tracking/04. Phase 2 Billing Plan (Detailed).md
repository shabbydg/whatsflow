# Phase 2: Plans & Billing System - Implementation Plan

**Created:** October 10, 2025  
**Status:** Ready for Implementation  
**Payment Provider:** PayHere.lk (Sri Lanka)

---

## AI Cost Analysis & Profitability

### Current AI Model Costs (2024-2025 Pricing)

Based on your backend's installed AI providers:

| Provider | Model | Input Cost | Output Cost | Total per Message* |
|----------|-------|------------|-------------|-------------------|
| **Google Gemini** | 2.0 Flash | $0.075/1M tokens | $0.30/1M tokens | **$0.000098** |
| OpenAI | GPT-4o mini | $0.15/1M tokens | $0.60/1M tokens | $0.000195 |
| Anthropic | Claude Sonnet | $3.00/1M tokens | $15.00/1M tokens | $4.050 |

*Assumes avg 500 input tokens (message + context) + 200 output tokens per AI reply

### Recommended: **Gemini 2.0 Flash**
- **Lowest cost:** ~$0.0001 per AI message
- **Free tier:** 1,500 requests/day = 45,000/month FREE
- **Quality:** Excellent for customer service
- **Speed:** Very fast response times

---

## AI Cost Calculations Per Plan

### Trial Plan (7 days)
**Limits:** 100 messages, 10 AI replies, 10-page web scraping

**Costs:**
- AI Messaging: 10 × $0.0001 = **$0.001**
- Web Scraping (AI): ~1,000 tokens = **$0.0001**
- **Total Trial Cost:** ~$0.0011 ≈ **FREE** (within Gemini free tier)

### Starter Plan - $29/month
**Limits:** 2 devices, 1,000 contacts, 5,000 messages/month, Basic AI

**AI Usage Assumptions:**
- 20% of messages use AI = 1,000 AI replies/month
- Monthly knowledge base updates = ~10,000 tokens

**Costs:**
- AI Messaging: 1,000 × $0.0001 = **$0.10**
- Knowledge base: **$0.001**
- **Total AI Cost:** **$0.10/month**
- **Revenue:** $29
- **Gross Margin:** $28.90 = **99.7%** ✅

### Professional Plan - $99/month  
**Limits:** 5 devices, 10,000 contacts, 50,000 messages/month, Advanced AI

**AI Usage Assumptions:**
- 30% of messages use AI = 15,000 AI replies/month
- Advanced knowledge base + file processing = ~50,000 tokens

**Costs:**
- AI Messaging: 15,000 × $0.0001 = **$1.50**
- Knowledge processing: **$0.01**
- **Total AI Cost:** **$1.51/month**
- **Revenue:** $99
- **Gross Margin:** $97.49 = **98.5%** ✅

### Enterprise Plan - Custom (Suggested $299/month)
**Limits:** Unlimited devices, contacts, messages

**AI Usage Assumptions (Conservative):**
- 100,000 AI replies/month
- Heavy knowledge base processing = ~200,000 tokens

**Costs:**
- AI Messaging: 100,000 × $0.0001 = **$10.00**
- Knowledge processing: **$0.04**
- **Total AI Cost:** **$10.04/month**
- **Revenue:** $299
- **Gross Margin:** $288.96 = **96.6%** ✅

### Additional Costs to Consider

1. **Infrastructure (per user/month):**
   - Server/hosting: ~$2-5
   - Database: ~$1-2  
   - Redis: ~$0.50
   - Storage: ~$0.50
   - **Total:** ~$4-8/month

2. **WhatsApp Business API:**
   - Currently using web.js (FREE)
   - If switching to official API: $0.005-0.01 per conversation

3. **PayHere Transaction Fees:**
   - **3.5% + LKR 5** per transaction
   - Starter ($29): ~$1.02 + LKR 5 ≈ **$1.05**
   - Pro ($99): ~$3.47 + LKR 5 ≈ **$3.50**
   - Enterprise ($299): ~$10.47 + LKR 5 ≈ **$10.50**

### **Final Profitability Analysis**

| Plan | Monthly Revenue | AI Cost | Infrastructure | PayHere Fee | Total Cost | Gross Profit | Margin |
|------|----------------|---------|----------------|-------------|-----------|--------------|--------|
| **Trial** | $0 | $0 | $4 | $0 | $4 | -$4 | - |
| **Starter** | $29 | $0.10 | $4 | $1.05 | $5.15 | **$23.85** | **82%** ✅ |
| **Pro** | $99 | $1.51 | $5 | $3.50 | $10.01 | **$88.99** | **90%** ✅ |
| **Enterprise** | $299 | $10.04 | $8 | $10.50 | $28.54 | **$270.46** | **90%** ✅ |

**Conclusion:** All plans exceed your 40% margin requirement! Even with conservative infrastructure estimates, margins are 80-90%.

---

## Plan Structure (Final)

### **Trial** - 7 Days FREE
- ✅ 1 WhatsApp device
- ✅ 100 contacts
- ✅ 100 messages total
- ✅ 10 AI-powered replies
- ✅ Basic AI persona
- ✅ Web scraping (10 pages only)
- ✅ Email support
- ❌ No file uploads for knowledge base
- ❌ No broadcasts
- ❌ No custom personas
- **Duration:** 7 days, auto-converts to Starter if not canceled

### **Starter** - $29/month ($24.65/month annually)
- ✅ 2 WhatsApp devices
- ✅ 1,000 contacts
- ✅ 5,000 messages/month
- ✅ Basic AI replies (limited context)
- ✅ Web scraping (unlimited pages)
- ✅ Email support
- ✅ Basic analytics
- ❌ No file knowledge uploads
- ❌ No broadcasts
- ❌ Limited to 1 custom persona

**Add-ons:**
- +$10/month per additional device

### **Professional** - $99/month ($84.15/month annually)
- ✅ 5 WhatsApp devices
- ✅ 10,000 contacts
- ✅ 50,000 messages/month
- ✅ Advanced AI + full knowledge base
- ✅ File uploads (PDF, DOCX, TXT)
- ✅ Unlimited custom personas
- ✅ Broadcasts & campaigns
- ✅ Priority support
- ✅ Advanced analytics

**Add-ons:**
- +$10/month per additional device

### **Enterprise** - $299/month ($254.15/month annually)
- ✅ Unlimited WhatsApp devices
- ✅ Unlimited contacts
- ✅ Unlimited messages
- ✅ Custom AI training
- ✅ Advanced analytics & reporting
- ✅ Dedicated account manager
- ✅ Custom integrations
- ✅ White-label options
- ✅ 24/7 priority support

**Pricing Notes:**
- Annual discount: **15% off** (saves ~2 months)
- All prices in USD
- PayHere supports LKR and USD

---

## PayHere.lk Integration Architecture

### API Credentials Required

**Environment Variables (.env):**
```bash
# PayHere Configuration
PAYHERE_MERCHANT_ID=your_merchant_id_here
PAYHERE_MERCHANT_SECRET=your_merchant_secret_here
PAYHERE_APP_ID=your_app_id_here
PAYHERE_APP_SECRET=your_app_secret_here
PAYHERE_MODE=sandbox  # or 'live' for production

# PayHere URLs
PAYHERE_CHECKOUT_URL=https://sandbox.payhere.lk/pay/checkout  # Live: https://www.payhere.lk/pay/checkout
PAYHERE_API_URL=https://sandbox.payhere.lk/merchant/v1  # Live: https://www.payhere.lk/merchant/v1

# Your App URLs
PAYHERE_RETURN_URL=http://localhost:2153/billing/success
PAYHERE_CANCEL_URL=http://localhost:2153/billing/cancel
PAYHERE_NOTIFY_URL=https://api.whatsflow.ai/api/v1/billing/webhook
```

**Where to Add:**
1. **Merchant ID & Secret:** PayHere Dashboard → Integrations → Add Domain → Get Secret
2. **App ID & Secret:** PayHere Dashboard → Settings → API Keys → Create Key (enable "Automated Charging API")

### PayHere APIs We'll Use

#### 1. **Checkout API** (Initial Subscription)
- User selects plan → redirect to PayHere
- PayHere processes payment
- Returns to success URL
- Sends webhook to notify URL

#### 2. **Recurring API** (Monthly Billing)
- Automatically charges on renewal
- No user interaction required
- Sends webhook on each charge

#### 3. **Subscription Manager API** (Management)
- **View subscriptions:** `GET /subscription/list`
- **Retry failed payment:** `POST /subscription/retry-payment`
- **Cancel subscription:** `POST /subscription/cancel`
- **OAuth Authentication Required**

---

## Database Schema

```sql
-- Plans table
CREATE TABLE plans (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_annual DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  features JSON NOT NULL,
  limits JSON NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert plans
INSERT INTO plans (id, name, slug, price_monthly, price_annual, features, limits, display_order) VALUES
(UUID(), 'Trial', 'trial', 0.00, 0.00, 
  JSON_OBJECT(
    'ai_replies', true,
    'knowledge_base', true,
    'web_scraping', true,
    'web_scraping_pages', 10,
    'file_uploads', false,
    'broadcasts', false,
    'custom_personas', 0,
    'priority_support', false
  ),
  JSON_OBJECT(
    'devices', 1,
    'contacts', 100,
    'messages_per_month', 100,
    'ai_messages_per_month', 10,
    'trial_days', 7
  ), 0),

(UUID(), 'Starter', 'starter', 29.00, 296.40,
  JSON_OBJECT(
    'ai_replies', true,
    'knowledge_base', true,
    'web_scraping', true,
    'web_scraping_pages', -1,
    'file_uploads', false,
    'broadcasts', false,
    'custom_personas', 1,
    'priority_support', false
  ),
  JSON_OBJECT(
    'devices', 2,
    'contacts', 1000,
    'messages_per_month', 5000,
    'ai_messages_per_month', 1000
  ), 1),

(UUID(), 'Professional', 'professional', 99.00, 1009.80,
  JSON_OBJECT(
    'ai_replies', true,
    'knowledge_base', true,
    'web_scraping', true,
    'web_scraping_pages', -1,
    'file_uploads', true,
    'broadcasts', true,
    'custom_personas', -1,
    'priority_support', true,
    'advanced_analytics', true
  ),
  JSON_OBJECT(
    'devices', 5,
    'contacts', 10000,
    'messages_per_month', 50000,
    'ai_messages_per_month', 15000
  ), 2),

(UUID(), 'Enterprise', 'enterprise', 299.00, 3049.80,
  JSON_OBJECT(
    'ai_replies', true,
    'knowledge_base', true,
    'web_scraping', true,
    'web_scraping_pages', -1,
    'file_uploads', true,
    'broadcasts', true,
    'custom_personas', -1,
    'priority_support', true,
    'advanced_analytics', true,
    'custom_integrations', true,
    'dedicated_support', true,
    'white_label', true
  ),
  JSON_OBJECT(
    'devices', -1,
    'contacts', -1,
    'messages_per_month', -1,
    'ai_messages_per_month', -1
  ), 3);

-- Subscriptions table
CREATE TABLE subscriptions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  plan_id VARCHAR(36) NOT NULL,
  status ENUM('trial', 'active', 'past_due', 'canceled', 'paused', 'expired') DEFAULT 'trial',
  billing_cycle ENUM('monthly', 'annual') DEFAULT 'monthly',
  
  -- PayHere specific fields
  payhere_subscription_id VARCHAR(255),
  payhere_order_id VARCHAR(255),
  payhere_payment_id VARCHAR(255),
  
  -- Pricing
  current_price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Billing periods
  trial_ends_at TIMESTAMP,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  next_billing_date TIMESTAMP,
  
  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP,
  
  -- Special flags
  is_free BOOLEAN DEFAULT false COMMENT 'Admin override - make account free',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id),
  INDEX idx_user_status (user_id, status),
  INDEX idx_next_billing (next_billing_date)
);

-- Payments/Transactions table
CREATE TABLE payments (
  id VARCHAR(36) PRIMARY KEY,
  subscription_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  
  -- Payment details
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status ENUM('pending', 'succeeded', 'failed', 'refunded', 'processing') DEFAULT 'pending',
  payment_type ENUM('subscription', 'addon', 'overage', 'one_time') DEFAULT 'subscription',
  
  -- PayHere response data
  payhere_order_id VARCHAR(255),
  payhere_payment_id VARCHAR(255),
  payhere_method VARCHAR(50),
  payhere_status_code VARCHAR(10),
  payhere_md5sig VARCHAR(255),
  payhere_status_message TEXT,
  
  -- Invoice
  invoice_number VARCHAR(50) UNIQUE,
  invoice_url VARCHAR(500),
  
  -- Timestamps
  attempted_at TIMESTAMP,
  paid_at TIMESTAMP,
  refunded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_payments (user_id, created_at),
  INDEX idx_status (status),
  INDEX idx_payhere_order (payhere_order_id)
);

-- Usage tracking table  
CREATE TABLE usage_tracking (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  subscription_id VARCHAR(36) NOT NULL,
  
  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Usage counts
  devices_used INT DEFAULT 0,
  contacts_count INT DEFAULT 0,
  messages_sent INT DEFAULT 0,
  messages_received INT DEFAULT 0,
  ai_messages_count INT DEFAULT 0,
  broadcasts_sent INT DEFAULT 0,
  
  -- Overage flags
  messages_overage INT DEFAULT 0,
  ai_messages_overage INT DEFAULT 0,
  
  -- Timestamps
  last_reset_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_period (user_id, period_start),
  INDEX idx_period (period_start, period_end)
);

-- Subscription add-ons table
CREATE TABLE subscription_addons (
  id VARCHAR(36) PRIMARY KEY,
  subscription_id VARCHAR(36) NOT NULL,
  addon_type ENUM('device') NOT NULL,
  quantity INT DEFAULT 1,
  price_per_unit DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

-- Coupons/Promo codes table
CREATE TABLE coupons (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  
  -- Discount
  discount_type ENUM('percentage', 'fixed') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  
  -- Restrictions
  applies_to_plans JSON COMMENT 'Array of plan IDs',
  max_uses INT,
  times_used INT DEFAULT 0,
  
  -- Validity
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(36) COMMENT 'Admin user ID',
  
  INDEX idx_code (code),
  INDEX idx_valid (valid_from, valid_until, is_active)
);

-- Coupon usage tracking
CREATE TABLE coupon_usage (
  id VARCHAR(36) PRIMARY KEY,
  coupon_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  subscription_id VARCHAR(36),
  discount_amount DECIMAL(10,2),
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (coupon_id) REFERENCES coupons(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id),
  UNIQUE KEY unique_user_coupon (user_id, coupon_id)
);

-- Failed payment retry log
CREATE TABLE payment_retry_log (
  id VARCHAR(36) PRIMARY KEY,
  payment_id VARCHAR(36) NOT NULL,
  subscription_id VARCHAR(36) NOT NULL,
  attempt_number INT NOT NULL,
  status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
  error_message TEXT,
  next_retry_at TIMESTAMP,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (payment_id) REFERENCES payments(id),
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id),
  INDEX idx_next_retry (next_retry_at, status)
);

-- Update users table to track trial usage
ALTER TABLE users ADD COLUMN trial_used BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN trial_started_at TIMESTAMP;
```

---

## Overage Handling System

### Credit-Based Overage Model

When users exceed limits, we'll use a **credit system**:

1. **Message Overages:**
   - Base rate: **$0.01 per message** over limit
   - Bulk discount: 1000+ messages = $0.008 per message
   
2. **AI Message Overages:**
   - Base rate: **$0.02 per AI message** over limit
   
3. **Credit Purchase:**
   - Users can prepay for credits
   - Credits roll over month-to-month
   - Applied automatically when usage exceeds limits

```sql
-- User credits table
CREATE TABLE user_credits (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  credit_balance DECIMAL(10,2) DEFAULT 0.00,
  total_purchased DECIMAL(10,2) DEFAULT 0.00,
  total_used DECIMAL(10,2) DEFAULT 0.00,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_credit (user_id)
);

-- Credit transactions
CREATE TABLE credit_transactions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10,2) NOT NULL COMMENT 'Positive for purchase, negative for usage',
  balance_after DECIMAL(10,2) NOT NULL,
  transaction_type ENUM('purchase', 'overage_charge', 'refund', 'admin_adjustment') NOT NULL,
  description TEXT,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_transactions (user_id, created_at)
);
```

---

## Implementation Phases

### **Phase 2A: Core Billing Infrastructure** (Week 1-2)

#### Backend Tasks:
- [ ] Create database migrations for all tables
- [ ] Create Plan model and service
- [ ] Create Subscription model and service  
- [ ] Create Payment model and service
- [ ] Create Usage Tracking service
- [ ] Install PayHere SDK/libraries
- [ ] Create PayHere service wrapper
- [ ] Implement hash generation for security
- [ ] Create billing configuration file

#### API Endpoints to Create:
```typescript
// Plans
GET    /api/v1/plans                    // List all active plans
GET    /api/v1/plans/:id                // Get plan details

// Subscriptions
GET    /api/v1/subscription             // Get current user's subscription
POST   /api/v1/subscription/subscribe   // Start new subscription/trial
POST   /api/v1/subscription/upgrade     // Upgrade plan
POST   /api/v1/subscription/downgrade   // Downgrade plan
POST   /api/v1/subscription/cancel      // Cancel subscription
POST   /api/v1/subscription/reactivate  // Reactivate canceled subscription

// Add-ons
POST   /api/v1/subscription/addons      // Add device addon
DELETE /api/v1/subscription/addons/:id  // Remove addon

// Usage
GET    /api/v1/usage/current            // Get current period usage
GET    /api/v1/usage/history            // Get usage history

// Credits
GET    /api/v1/credits                  // Get credit balance
POST   /api/v1/credits/purchase         // Purchase credits

// Webhooks (no auth required - verified via hash)
POST   /api/v1/billing/webhook          // PayHere notification handler
```

#### Files to Create:
```
whatsflow/backend/src/
├── services/
│   ├── billing/
│   │   ├── payhere.service.ts      # PayHere API wrapper
│   │   ├── subscription.service.ts # Subscription management
│   │   ├── payment.service.ts      # Payment processing
│   │   ├── usage.service.ts        # Usage tracking
│   │   ├── invoice.service.ts      # Invoice generation
│   │   └── credit.service.ts       # Credit management
├── controllers/
│   ├── plan.controller.ts
│   ├── subscription.controller.ts
│   ├── billing.controller.ts
│   └── credit.controller.ts
├── routes/
│   ├── plan.routes.ts
│   ├── subscription.routes.ts
│   ├── billing.routes.ts
│   └── credit.routes.ts
├── middleware/
│   ├── plan-enforcement.middleware.ts  # Check limits
│   └── subscription.middleware.ts      # Verify active subscription
├── utils/
│   ├── payhere-hash.ts            # Hash generation
│   └── invoice-generator.ts      # PDF invoice
└── workers/
    ├── billing-cycle.worker.ts    # Process recurring billing
    ├── usage-reset.worker.ts      # Reset monthly usage
    └── failed-payment-retry.worker.ts  # Retry failed payments
```

---

### **Phase 2B: PayHere Integration** (Week 2-3)

#### Tasks:
- [ ] Implement PayHere checkout flow
- [ ] Create subscription initiation process
- [ ] Implement webhook handler
- [ ] Verify PayHere signatures
- [ ] Handle payment statuses (success, pending, failed)
- [ ] Implement OAuth for Subscription Manager API
- [ ] Create subscription view/retry/cancel functions
- [ ] Test in sandbox environment

#### PayHere Integration Flow:

```typescript
// 1. User Subscribes
User selects plan
  ↓
Generate PayHere form with hash
  ↓
Redirect to PayHere checkout
  ↓
User completes payment
  ↓
PayHere redirects to return_url
  ↓
PayHere sends webhook to notify_url
  ↓
Verify webhook hash
  ↓
Create subscription in database
  ↓
Activate user's plan features

// 2. Monthly Recurring
Cron job checks upcoming renewals
  ↓
PayHere auto-charges (handled by PayHere)
  ↓
Webhook received
  ↓
If success: Extend subscription period
  ↓
If failed: Create retry job
  ↓
Generate invoice & send email

// 3. Failed Payment Retry
Detect failed payment
  ↓
Schedule retry (Day 1, 3, 7)
  ↓
Use Subscription Manager API to retry
  ↓
If success: Resume service
  ↓
If all retries fail: Suspend account
```

---

### **Phase 2C: Frontend Implementation** (Week 3-4)

#### Main App (`/frontend`) Tasks:
- [ ] Create pricing comparison page
- [ ] Create subscription selection flow
- [ ] Create billing settings page
- [ ] Create payment method management
- [ ] Create usage dashboard with progress bars
- [ ] Create invoice history page
- [ ] Create credits purchase page
- [ ] Implement upgrade/downgrade modals
- [ ] Add usage warnings (80%, 90%, 100%)
- [ ] Add plan limit enforcement UI

#### Pages to Create:
```
frontend/src/app/(dashboard)/
├── billing/
│   ├── page.tsx                    # Subscription overview
│   ├── plans/page.tsx              # Plan selection
│   ├── upgrade/page.tsx            # Upgrade flow
│   ├── invoices/page.tsx           # Invoice history
│   ├── credits/page.tsx            # Credits management
│   ├── success/page.tsx            # Payment success
│   └── cancel/page.tsx             # Payment canceled
```

#### Components to Create:
```
frontend/src/components/billing/
├── PlanCard.tsx
├── SubscriptionStatus.tsx
├── UsageProgress.tsx
├── InvoiceList.tsx
├── UpgradePrompt.tsx
├── PaymentMethodCard.tsx
└── CreditBalance.tsx
```

---

### **Phase 2D: Admin Panel Features** (Week 4-5)

#### Admin Panel (`/admin`) Tasks:
- [ ] Create plan management UI (CRUD)
- [ ] Create user subscription viewer
- [ ] Create subscription modification tools
- [ ] Create payment transaction viewer
- [ ] Create failed payment manager
- [ ] Create refund processing
- [ ] Create coupon management UI
- [ ] Create revenue analytics dashboard
- [ ] Create "Make Account Free" toggle
- [ ] Create credit adjustment tools

#### Backend Admin Endpoints:
```typescript
// Admin - Plan Management
POST   /api/v1/admin/plans              // Create plan
PUT    /api/v1/admin/plans/:id          // Update plan
DELETE /api/v1/admin/plans/:id          // Delete plan

// Admin - Subscription Management
GET    /api/v1/admin/subscriptions      // List all subscriptions
GET    /api/v1/admin/subscriptions/:id  // Get subscription details
PUT    /api/v1/admin/subscriptions/:id  // Modify subscription
POST   /api/v1/admin/subscriptions/:id/make-free  // Make account free
POST   /api/v1/admin/subscriptions/:id/reset-trial // Reset trial

// Admin - Payment Management
GET    /api/v1/admin/payments           // List all payments
GET    /api/v1/admin/payments/failed    // List failed payments
POST   /api/v1/admin/payments/:id/retry // Manually retry payment
POST   /api/v1/admin/payments/:id/refund // Issue refund

// Admin - Coupon Management
GET    /api/v1/admin/coupons            // List coupons
POST   /api/v1/admin/coupons            // Create coupon
PUT    /api/v1/admin/coupons/:id        // Update coupon
DELETE /api/v1/admin/coupons/:id        // Delete coupon
GET    /api/v1/admin/coupons/:id/usage  // View coupon usage

// Admin - Analytics
GET    /api/v1/admin/analytics/revenue  // Revenue metrics
GET    /api/v1/admin/analytics/churn    // Churn analytics
GET    /api/v1/admin/analytics/usage    // Platform usage stats

// Admin - Credits
POST   /api/v1/admin/credits/:userId/adjust  // Adjust user credits
```

---

### **Phase 2E: Usage Enforcement & Limits** (Week 5)

#### Tasks:
- [ ] Create middleware to check limits before actions
- [ ] Implement soft limits with warnings
- [ ] Implement hard limits with blocks
- [ ] Create overage credit deduction system
- [ ] Add upgrade prompts when limits reached
- [ ] Create usage reset cron job (monthly)
- [ ] Test all limit scenarios

#### Usage Enforcement Points:

```typescript
// Message sending - check before send
if (usage.messages_sent >= plan_limits.messages_per_month) {
  if (user_credits >= overage_cost) {
    // Deduct credits, allow send
  } else {
    // Block send, show upgrade prompt
  }
}

// AI message - check before AI processes
if (usage.ai_messages_count >= plan_limits.ai_messages_per_month) {
  if (user_credits >= ai_overage_cost) {
    // Deduct credits, allow AI
  } else {
    // Disable AI, use standard message
  }
}

// Device connection - check before connect
if (active_devices >= plan_limits.devices) {
  // Block connection, show upgrade or addon prompt
}

// Broadcast - check before send
if (!plan_features.broadcasts) {
  // Show upgrade to Pro required
}
```

---

### **Phase 2F: Email & Invoice System** (Week 6)

#### Tasks:
- [ ] Create email templates (HTML)
- [ ] Implement PDF invoice generation
- [ ] Create email service wrapper
- [ ] Send welcome email on subscription
- [ ] Send invoice email on payment
- [ ] Send payment failed email
- [ ] Send trial ending reminder (2 days before)
- [ ] Send subscription ending reminder
- [ ] Send usage warning emails (80%, 90%)
- [ ] Test all email triggers

#### Email Templates Needed:
1. **trial_welcome.html** - Trial started
2. **trial_ending.html** - Trial ending in 2 days
3. **subscription_created.html** - New subscription
4. **payment_success.html** - Payment successful + invoice
5. **payment_failed.html** - Payment failed
6. **payment_retry.html** - Retry scheduled
7. **subscription_upgraded.html** - Plan upgraded
8. **subscription_canceled.html** - Subscription canceled
9. **usage_warning.html** - 80%, 90% usage warning
10. **invoice.html** - Invoice template (PDF)

---

### **Phase 2G: Testing & Deployment** (Week 7)

#### Testing Checklist:
- [ ] Test trial signup and auto-convert
- [ ] Test plan subscription (monthly/annual)
- [ ] Test plan upgrades with proration
- [ ] Test plan downgrades
- [ ] Test cancellations
- [ ] Test PayHere webhook handling
- [ ] Test failed payment retry logic
- [ ] Test usage tracking and resets
- [ ] Test overage credit deductions
- [ ] Test add-on purchases
- [ ] Test coupon codes
- [ ] Test admin making account free
- [ ] Test all email triggers
- [ ] Test invoice generation
- [ ] Load test billing system

#### Deployment Tasks:
- [ ] Get PayHere production credentials
- [ ] Configure production environment variables
- [ ] Run database migrations on production
- [ ] Deploy backend changes
- [ ] Deploy frontend changes
- [ ] Deploy admin panel changes
- [ ] Configure PayHere production webhooks
- [ ] Test end-to-end in production
- [ ] Monitor first transactions closely

---

## PayHere Integration Code Snippets

### Generating Payment Hash

```typescript
// whatsflow/backend/src/utils/payhere-hash.ts
import crypto from 'crypto';

export function generatePayHereHash(
  merchantId: string,
  orderId: string,
  amount: string,
  currency: string,
  merchantSecret: string
): string {
  const hash = crypto
    .createHash('md5')
    .update(
      merchantId +
      orderId +
      amount +
      currency +
      crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase()
    )
    .digest('hex')
    .toUpperCase();
  
  return hash;
}

export function verifyPayHereNotification(
  merchantId: string,
  orderId: string,
  paymentId: string,
  payhereAmount: string,
  payhereCurrency: string,
  statusCode: string,
  md5sig: string,
  merchantSecret: string
): boolean {
  const localHash = crypto
    .createHash('md5')
    .update(
      merchantId +
      orderId +
      payhereAmount +
      payhereCurrency +
      statusCode +
      crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase()
    )
    .digest('hex')
    .toUpperCase();
  
  return localHash === md5sig;
}
```

### Subscription Creation

```typescript
// whatsflow/backend/src/services/billing/payhere.service.ts
export class PayHereService {
  async createSubscription(userId: string, planId: string, billingCycle: 'monthly' | 'annual') {
    const user = await getUserById(userId);
    const plan = await getPlanById(planId);
    
    const orderId = `SUB-${userId}-${Date.now()}`;
    const amount = billingCycle === 'annual' ? plan.price_annual : plan.price_monthly;
    const recurrence = billingCycle === 'annual' ? '1 Year' : '1 Month';
    const duration = 'Forever';  // Continuous until canceled
    
    const hash = generatePayHereHash(
      process.env.PAYHERE_MERCHANT_ID!,
      orderId,
      amount.toFixed(2),
      'USD',
      process.env.PAYHERE_MERCHANT_SECRET!
    );
    
    // Return data to render PayHere form
    return {
      merchant_id: process.env.PAYHERE_MERCHANT_ID,
      return_url: `${process.env.APP_URL}/billing/success`,
      cancel_url: `${process.env.APP_URL}/billing/cancel`,
      notify_url: `${process.env.API_URL}/api/v1/billing/webhook`,
      first_name: user.full_name.split(' ')[0],
      last_name: user.full_name.split(' ').slice(1).join(' '),
      email: user.email,
      phone: user.phone || '',
      address: '',
      city: '',
      country: 'Sri Lanka',
      order_id: orderId,
      items: `${plan.name} - ${billingCycle} subscription`,
      currency: 'USD',
      recurrence,
      duration,
      amount: amount.toFixed(2),
      hash,
    };
  }
}
```

### Webhook Handler

```typescript
// whatsflow/backend/src/controllers/billing.controller.ts
export async function handlePayHereWebhook(req: Request, res: Response) {
  const {
    merchant_id,
    order_id,
    payment_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig,
    status_message,
    method,
  } = req.body;
  
  // Verify hash
  const isValid = verifyPayHereNotification(
    merchant_id,
    order_id,
    payment_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig,
    process.env.PAYHERE_MERCHANT_SECRET!
  );
  
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid signature' });
  }
  
  // Process payment based on status_code
  // 2 = Success, 0 = Pending, -1 = Canceled, -2 = Failed, -3 = Chargedback
  
  if (status_code === '2') {
    // Payment successful
    await processSuccessfulPayment(order_id, payment_id, payhere_amount);
  } else if (status_code === '-2') {
    // Payment failed
    await processFailedPayment(order_id, payment_id, status_message);
  }
  
  res.status(200).send('OK');
}
```

---

## Proration Calculation

When users upgrade/downgrade mid-cycle:

```typescript
function calculateProration(
  currentPlan: Plan,
  newPlan: Plan,
  daysRemainingInPeriod: number,
  totalDaysInPeriod: number
): number {
  // Current plan unused value
  const unusedValue = (currentPlan.price_monthly / totalDaysInPeriod) * daysRemainingInPeriod;
  
  // New plan value for remaining days
  const newPlanValue = (newPlan.price_monthly / totalDaysInPeriod) * daysRemainingInPeriod;
  
  // Amount to charge (or credit)
  const prorationAmount = newPlanValue - unusedValue;
  
  return prorationAmount;
}

// Example: Upgrade from Starter to Pro mid-month
// Day 15 of 30-day period
// Unused Starter value: ($29 / 30) × 15 = $14.50
// Pro value for 15 days: ($99 / 30) × 15 = $49.50  
// Charge immediately: $49.50 - $14.50 = $35.00
```

---

## Coupon System

### Coupon Types:

1. **Percentage Discount**
   - Example: `LAUNCH50` = 50% off first month
   - Applied at checkout

2. **Fixed Amount Discount**
   - Example: `SAVE10` = $10 off
   - Applied at checkout

### Admin Coupon Management:

```typescript
// Create coupon
{
  code: 'LAUNCH50',
  discount_type: 'percentage',
  discount_value: 50,
  applies_to_plans: ['starter', 'professional'], // Plan slugs
  max_uses: 100,
  valid_from: '2025-01-01',
  valid_until: '2025-03-31',
  is_active: true
}
```

---

## Monitoring & Alerts

### Key Metrics to Track:

1. **Revenue Metrics:**
   - MRR (Monthly Recurring Revenue)
   - ARR (Annual Recurring Revenue)
   - Revenue by plan
   - Revenue trends

2. **Subscription Metrics:**
   - New subscriptions
   - Cancellations (churn rate)
   - Upgrades/downgrades
   - Trial conversion rate

3. **Payment Metrics:**
   - Success rate
   - Failed payment rate
   - Average payment amount
   - Refund rate

4. **Usage Metrics:**
   - Users at limit
   - Overage revenue
   - Credit purchases

### Alerts to Configure:

- Payment failure rate > 5%
- Churn rate > 10%
- Trial conversion < 20%
- Failed webhook deliveries

---

## Implementation Checklist

### Week 1-2: Core Infrastructure
- [x] Create comprehensive plan document
- [ ] Run database migrations
- [ ] Create plan seeds
- [ ] Implement Plan service
- [ ] Implement Subscription service
- [ ] Implement Payment service
- [ ] Implement Usage Tracking service
- [ ] Create PayHere hash utilities

### Week 2-3: PayHere Integration
- [ ] Set up PayHere sandbox account
- [ ] Implement checkout flow
- [ ] Implement webhook handler
- [ ] Test subscription creation
- [ ] Implement Subscription Manager API client
- [ ] Test recurring billing
- [ ] Test failed payment handling

### Week 3-4: Frontend
- [ ] Create billing pages
- [ ] Create subscription UI
- [ ] Create usage dashboard
- [ ] Implement upgrade/downgrade flows
- [ ] Add plan enforcement
- [ ] Create invoice viewer
- [ ] Test user flows

### Week 4-5: Admin Panel
- [ ] Implement admin backend
- [ ] Create plan management UI
- [ ] Create subscription management
- [ ] Create payment tracking
- [ ] Create coupon management
- [ ] Create analytics dashboards
- [ ] Test admin features

### Week 5-6: Credits & Enforcement
- [ ] Implement credit system
- [ ] Create usage enforcement middleware
- [ ] Implement overage charges
- [ ] Create usage reset jobs
- [ ] Test limit scenarios

### Week 6-7: Email & Polish
- [ ] Create email templates
- [ ] Implement email service
- [ ] Generate PDF invoices
- [ ] Test all email triggers
- [ ] Final end-to-end testing

### Week 7: Deployment
- [ ] Get production credentials
- [ ] Deploy to production
- [ ] Monitor first transactions
- [ ] Create user documentation

---

## Risk Mitigation

### Payment Failures
- Retry 3 times (Day 1, 3, 7)
- Clear communication with users
- Allow manual payment updates
- Grace period before suspension

### Usage Overages
- Warning emails at 80%, 90%
- Clear pricing for overages
- Easy upgrade path
- Credit system as safety net

### Refunds
- Clear refund policy (14 days)
- Admin tools for processing
- Automatic credit balance handling

---

## Success Metrics

- Trial to paid conversion: **>20%**
- Monthly churn rate: **<5%**
- Payment success rate: **>95%**
- Customer support tickets (billing): **<10%** of users
- Gross profit margin: **>40%** (Target: 80-90% achieved)

---

**Document Status:** ✅ Complete  
**Ready for:** Implementation  
**Estimated Duration:** 7 weeks  
**Next Step:** Approve plan and begin Phase 2A

---

*Last Updated: October 10, 2025*

