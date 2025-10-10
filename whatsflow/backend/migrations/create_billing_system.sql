-- WhatsFlow Billing System
-- Phase 2: Plans & Billing Implementation
-- Created: October 10, 2025

-- ==================== PLANS TABLE ====================

CREATE TABLE IF NOT EXISTS plans (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_annual DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  features JSON NOT NULL COMMENT 'Plan features object',
  limits JSON NOT NULL COMMENT 'Usage limits object',
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_active (is_active, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== SUBSCRIPTIONS TABLE ====================

CREATE TABLE IF NOT EXISTS subscriptions (
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
  free_reason TEXT COMMENT 'Why account was made free',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id),
  INDEX idx_user_status (user_id, status),
  INDEX idx_next_billing (next_billing_date),
  INDEX idx_payhere_subscription (payhere_subscription_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== PAYMENTS TABLE ====================

CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(36) PRIMARY KEY,
  subscription_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  
  -- Payment details
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status ENUM('pending', 'succeeded', 'failed', 'refunded', 'processing') DEFAULT 'pending',
  payment_type ENUM('subscription', 'addon', 'overage', 'credit_purchase', 'one_time') DEFAULT 'subscription',
  description TEXT,
  
  -- PayHere response data
  payhere_order_id VARCHAR(255),
  payhere_payment_id VARCHAR(255),
  payhere_method VARCHAR(50),
  payhere_status_code VARCHAR(10),
  payhere_md5sig VARCHAR(255),
  payhere_status_message TEXT,
  payhere_card_holder VARCHAR(255),
  payhere_card_no VARCHAR(20),
  
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
  INDEX idx_payhere_order (payhere_order_id),
  INDEX idx_invoice (invoice_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== USAGE TRACKING TABLE ====================

CREATE TABLE IF NOT EXISTS usage_tracking (
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
  web_scraping_pages INT DEFAULT 0,
  
  -- Overage counts
  messages_overage INT DEFAULT 0,
  ai_messages_overage INT DEFAULT 0,
  
  -- Overage charges
  overage_credits_used DECIMAL(10,2) DEFAULT 0.00,
  
  -- Timestamps
  last_reset_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_period (user_id, period_start),
  INDEX idx_period (period_start, period_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== SUBSCRIPTION ADD-ONS TABLE ====================

CREATE TABLE IF NOT EXISTS subscription_addons (
  id VARCHAR(36) PRIMARY KEY,
  subscription_id VARCHAR(36) NOT NULL,
  addon_type ENUM('device') NOT NULL,
  quantity INT DEFAULT 1,
  price_per_unit DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
  INDEX idx_subscription (subscription_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== COUPONS TABLE ====================

CREATE TABLE IF NOT EXISTS coupons (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  
  -- Discount
  discount_type ENUM('percentage', 'fixed') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  
  -- Restrictions
  applies_to_plans JSON COMMENT 'Array of plan slugs or null for all plans',
  max_uses INT COMMENT 'Null for unlimited',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== COUPON USAGE TABLE ====================

CREATE TABLE IF NOT EXISTS coupon_usage (
  id VARCHAR(36) PRIMARY KEY,
  coupon_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  subscription_id VARCHAR(36),
  discount_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
  UNIQUE KEY unique_user_coupon (user_id, coupon_id),
  INDEX idx_coupon (coupon_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== PAYMENT RETRY LOG TABLE ====================

CREATE TABLE IF NOT EXISTS payment_retry_log (
  id VARCHAR(36) PRIMARY KEY,
  payment_id VARCHAR(36) NOT NULL,
  subscription_id VARCHAR(36) NOT NULL,
  attempt_number INT NOT NULL,
  status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
  error_message TEXT,
  next_retry_at TIMESTAMP,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
  INDEX idx_next_retry (next_retry_at, status),
  INDEX idx_subscription (subscription_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== USER CREDITS TABLE ====================

CREATE TABLE IF NOT EXISTS user_credits (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  credit_balance DECIMAL(10,2) DEFAULT 0.00,
  total_purchased DECIMAL(10,2) DEFAULT 0.00,
  total_used DECIMAL(10,2) DEFAULT 0.00,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_credit (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== CREDIT TRANSACTIONS TABLE ====================

CREATE TABLE IF NOT EXISTS credit_transactions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10,2) NOT NULL COMMENT 'Positive for purchase/refund, negative for usage',
  balance_after DECIMAL(10,2) NOT NULL,
  transaction_type ENUM('purchase', 'overage_charge', 'refund', 'admin_adjustment') NOT NULL,
  description TEXT,
  metadata JSON,
  payment_id VARCHAR(36) COMMENT 'Related payment if applicable',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
  INDEX idx_user_transactions (user_id, created_at),
  INDEX idx_type (transaction_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== ADMIN USERS TABLE ====================

CREATE TABLE IF NOT EXISTS admin_users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('super_admin', 'support_admin', 'finance_admin', 'read_only') DEFAULT 'read_only',
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== ADMIN ACTIVITY LOG TABLE ====================

CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id VARCHAR(36) PRIMARY KEY,
  admin_user_id VARCHAR(36) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) COMMENT 'user, subscription, payment, coupon, etc.',
  target_id VARCHAR(36),
  details JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
  INDEX idx_admin (admin_user_id, created_at),
  INDEX idx_target (target_type, target_id),
  INDEX idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== UPDATE USERS TABLE ====================

-- Add trial tracking to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_used BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP;

-- ==================== INDEXES FOR PERFORMANCE ====================

-- Add composite index for subscription queries
ALTER TABLE subscriptions ADD INDEX idx_status_billing (status, next_billing_date);

-- Add index for payment queries
ALTER TABLE payments ADD INDEX idx_subscription_status (subscription_id, status, created_at);

