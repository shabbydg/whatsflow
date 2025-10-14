-- Add Test Account Flag
-- Allows marking accounts as test accounts that bypass billing restrictions

-- Add test account flag to users table (idempotent)
SET @dbname = DATABASE();

-- Add is_test_account column if not exists
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_name = 'users'
   AND table_schema = @dbname
   AND column_name = 'is_test_account') > 0,
  'SELECT 1',
  'ALTER TABLE users ADD COLUMN is_test_account BOOLEAN DEFAULT false'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add test_account_notes column if not exists
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_name = 'users'
   AND table_schema = @dbname
   AND column_name = 'test_account_notes') > 0,
  'SELECT 1',
  'ALTER TABLE users ADD COLUMN test_account_notes TEXT'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add index for quick lookups (idempotent)
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
   WHERE table_name = 'users'
   AND table_schema = @dbname
   AND index_name = 'idx_users_test_account') > 0,
  'SELECT 1',
  'CREATE INDEX idx_users_test_account ON users(is_test_account)'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

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

