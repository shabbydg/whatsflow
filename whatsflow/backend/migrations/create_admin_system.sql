-- Admin System Tables
-- Creates tables for admin authentication and activity logging

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'support_admin', 'finance_admin', 'read_only') NOT NULL DEFAULT 'read_only',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin Activity Logs
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id VARCHAR(36) PRIMARY KEY,
  admin_user_id VARCHAR(36) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id VARCHAR(36) NOT NULL,
  details JSON,
  ip_address VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
  INDEX idx_admin_user (admin_user_id),
  INDEX idx_action (action),
  INDEX idx_target (target_type, target_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add refund columns to payments table
ALTER TABLE payments 
ADD COLUMN refund_reason TEXT,
ADD COLUMN refunded_at TIMESTAMP NULL;

-- Create default super admin (password: Admin@123)
-- IMPORTANT: Change this password immediately after first login!
INSERT INTO admin_users (id, email, password_hash, full_name, role)
VALUES (
  UUID(),
  'admin@whatsflow.ai',
  '$2a$10$rQ8Ks9LhFxEKxK5K5K5K5OeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK', -- This is a placeholder - replace with actual bcrypt hash
  'System Administrator',
  'super_admin'
)
ON DUPLICATE KEY UPDATE email = email; -- Don't create if already exists

