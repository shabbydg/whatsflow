-- Add Test Account Flag
-- Allows marking accounts as test accounts that bypass billing restrictions

-- Add test account flag to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_test_account BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS test_account_notes TEXT;

-- Add index for quick lookups
CREATE INDEX IF NOT EXISTS idx_users_test_account ON users(is_test_account);

-- Add test account tracking
CREATE TABLE IF NOT EXISTS test_accounts_log (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  action ENUM('enabled', 'disabled', 'note_updated') NOT NULL,
  performed_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Example: Enable test account for a user
-- UPDATE users SET is_test_account = true, test_account_notes = 'Internal testing account' WHERE email = 'test@example.com';

-- Example: Disable test account
-- UPDATE users SET is_test_account = false, test_account_notes = NULL WHERE email = 'test@example.com';

