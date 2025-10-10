-- Seed Initial Plans
-- Phase 2: Plans & Billing Implementation
-- Created: October 10, 2025

-- Clear existing plans (for fresh setup)
DELETE FROM plans;

-- ==================== TRIAL PLAN ====================

INSERT INTO plans (id, name, slug, description, price_monthly, price_annual, currency, features, limits, is_active, display_order) 
VALUES (
  UUID(),
  'Trial',
  'trial',
  '7-day free trial with basic features to test the platform',
  0.00,
  0.00,
  'USD',
  JSON_OBJECT(
    'ai_replies', true,
    'knowledge_base', true,
    'web_scraping', true,
    'web_scraping_pages', 10,
    'file_uploads', false,
    'broadcasts', false,
    'custom_personas', 0,
    'priority_support', false,
    'advanced_analytics', false
  ),
  JSON_OBJECT(
    'devices', 1,
    'contacts', 100,
    'messages_per_month', 100,
    'ai_messages_per_month', 10,
    'broadcasts_per_month', 0,
    'trial_days', 7
  ),
  true,
  0
);

-- ==================== STARTER PLAN ====================

INSERT INTO plans (id, name, slug, description, price_monthly, price_annual, currency, features, limits, is_active, display_order) 
VALUES (
  UUID(),
  'Starter',
  'starter',
  'Perfect for small businesses getting started with WhatsApp automation',
  29.00,
  296.40,
  'USD',
  JSON_OBJECT(
    'ai_replies', true,
    'knowledge_base', true,
    'web_scraping', true,
    'web_scraping_pages', -1,
    'file_uploads', false,
    'broadcasts', false,
    'custom_personas', 1,
    'priority_support', false,
    'advanced_analytics', false,
    'email_support', true
  ),
  JSON_OBJECT(
    'devices', 2,
    'contacts', 1000,
    'messages_per_month', 5000,
    'ai_messages_per_month', 1000,
    'broadcasts_per_month', 0
  ),
  true,
  1
);

-- ==================== PROFESSIONAL PLAN ====================

INSERT INTO plans (id, name, slug, description, price_monthly, price_annual, currency, features, limits, is_active, display_order) 
VALUES (
  UUID(),
  'Professional',
  'professional',
  'For growing businesses that need advanced features and higher limits',
  99.00,
  1009.80,
  'USD',
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
    'email_support', true,
    'api_access', true
  ),
  JSON_OBJECT(
    'devices', 5,
    'contacts', 10000,
    'messages_per_month', 50000,
    'ai_messages_per_month', 15000,
    'broadcasts_per_month', 100
  ),
  true,
  2
);

-- ==================== ENTERPRISE PLAN ====================

INSERT INTO plans (id, name, slug, description, price_monthly, price_annual, currency, features, limits, is_active, display_order) 
VALUES (
  UUID(),
  'Enterprise',
  'enterprise',
  'For large organizations requiring unlimited access and premium support',
  299.00,
  3049.80,
  'USD',
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
    'email_support', true,
    'api_access', true,
    'custom_integrations', true,
    'dedicated_support', true,
    'white_label', true,
    'custom_ai_training', true
  ),
  JSON_OBJECT(
    'devices', -1,
    'contacts', -1,
    'messages_per_month', -1,
    'ai_messages_per_month', -1,
    'broadcasts_per_month', -1
  ),
  true,
  3
);

-- ==================== CREATE DEFAULT ADMIN USER ====================

-- Password: Admin@123 (CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN!)
-- Hash generated with bcrypt rounds=10
INSERT INTO admin_users (id, email, password_hash, full_name, role, is_active)
VALUES (
  UUID(),
  'admin@whatsflow.ai',
  '$2a$10$rQ8Ks9LhFxEKxK5K5K5K5OeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  'System Administrator',
  'super_admin',
  true
);

-- Note: You'll need to generate the actual bcrypt hash for your password
-- Example in Node.js: bcryptjs.hashSync('Admin@123', 10)

-- ==================== SAMPLE COUPON ====================

INSERT INTO coupons (id, code, description, discount_type, discount_value, applies_to_plans, max_uses, valid_from, valid_until, is_active)
VALUES (
  UUID(),
  'LAUNCH50',
  '50% off first month for early adopters',
  'percentage',
  50.00,
  JSON_ARRAY('starter', 'professional'),
  100,
  NOW(),
  DATE_ADD(NOW(), INTERVAL 3 MONTH),
  true
);

-- ==================== VERIFICATION QUERIES ====================

-- Verify plans were created
SELECT id, name, slug, price_monthly, price_annual FROM plans ORDER BY display_order;

-- Verify admin user was created
SELECT id, email, full_name, role FROM admin_users;

-- Verify sample coupon
SELECT id, code, discount_type, discount_value, max_uses FROM coupons;

