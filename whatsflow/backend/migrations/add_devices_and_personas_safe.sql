-- Migration: Add devices and personas support (SAFE VERSION)
-- This enables multiple WhatsApp connections per business with different personas

-- 1. Create personas table (reusable AI personalities/roles)
CREATE TABLE IF NOT EXISTS personas (
  id VARCHAR(36) PRIMARY KEY,
  business_profile_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  ai_instructions TEXT,
  ai_model VARCHAR(50) DEFAULT 'gpt-4o-mini',
  tone VARCHAR(50),
  response_style VARCHAR(50),
  is_system BOOLEAN DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE,
  INDEX idx_business_profile (business_profile_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Add new columns to whatsapp_connections if they don't exist
-- Check and add device_name
SET @dbname = DATABASE();
SET @tablename = 'whatsapp_connections';
SET @columnname = 'device_name';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " VARCHAR(100) AFTER business_profile_id")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Check and add persona_id
SET @columnname = 'persona_id';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " VARCHAR(36) AFTER device_name")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Check and add is_primary
SET @columnname = 'is_primary';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " BOOLEAN DEFAULT 0 AFTER persona_id")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Check and add auto_reply_enabled
SET @columnname = 'auto_reply_enabled';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " BOOLEAN DEFAULT 0")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Check and add working_hours_start
SET @columnname = 'working_hours_start';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " TIME DEFAULT '09:00:00'")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Check and add working_hours_end
SET @columnname = 'working_hours_end';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " TIME DEFAULT '17:00:00'")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Check and add working_days
SET @columnname = 'working_days';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " VARCHAR(50) DEFAULT 'Mon,Tue,Wed,Thu,Fri'")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 3. Insert default system personas (only if they don't exist)
INSERT IGNORE INTO personas (id, business_profile_id, name, description, ai_instructions, is_system)
SELECT
  UUID() as id,
  bp.id as business_profile_id,
  'Sales' as name,
  'Handles sales inquiries, product information, and closes deals' as description,
  'You are a professional sales representative. Your goal is to understand customer needs, provide product information, and guide them towards a purchase. Be persuasive but not pushy. Always ask qualifying questions and provide relevant solutions.' as ai_instructions,
  1 as is_system
FROM business_profiles bp
WHERE NOT EXISTS (
  SELECT 1 FROM personas WHERE business_profile_id = bp.id AND name = 'Sales'
);

INSERT IGNORE INTO personas (id, business_profile_id, name, description, ai_instructions, is_system)
SELECT
  UUID() as id,
  bp.id as business_profile_id,
  'Support' as name,
  'Provides customer support and resolves issues' as description,
  'You are a helpful customer support agent. Your goal is to resolve customer issues quickly and effectively. Be empathetic, ask clarifying questions, and provide step-by-step solutions. Escalate to human agents when necessary.' as ai_instructions,
  1 as is_system
FROM business_profiles bp
WHERE NOT EXISTS (
  SELECT 1 FROM personas WHERE business_profile_id = bp.id AND name = 'Support'
);

INSERT IGNORE INTO personas (id, business_profile_id, name, description, ai_instructions, is_system)
SELECT
  UUID() as id,
  bp.id as business_profile_id,
  'General' as name,
  'General purpose assistant for all inquiries' as description,
  'You are a friendly business assistant. Help customers with general inquiries, provide information about the business, and route complex questions appropriately. Be professional yet approachable.' as ai_instructions,
  1 as is_system
FROM business_profiles bp
WHERE NOT EXISTS (
  SELECT 1 FROM personas WHERE business_profile_id = bp.id AND name = 'General'
);

-- 4. Update existing connections to have device names and personas
UPDATE whatsapp_connections wc
JOIN business_profiles bp ON wc.business_profile_id = bp.id
JOIN personas p ON p.business_profile_id = bp.id AND p.name = 'General'
SET
  wc.device_name = COALESCE(wc.device_name, 'Primary Device'),
  wc.persona_id = COALESCE(wc.persona_id, p.id),
  wc.is_primary = COALESCE(wc.is_primary, 1)
WHERE wc.device_name IS NULL OR wc.device_name = '';

-- 5. Add AI conversation history table
CREATE TABLE IF NOT EXISTS ai_conversations (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  business_profile_id VARCHAR(36) NOT NULL,
  contact_id VARCHAR(36) NOT NULL,
  persona_id VARCHAR(36),
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  input_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  model VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE SET NULL,
  INDEX idx_conversation (contact_id, created_at),
  INDEX idx_business_profile (business_profile_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Enhance business_profiles for AI scraping
SET @tablename = 'business_profiles';

-- Add logo_url
SET @columnname = 'logo_url';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " VARCHAR(500) AFTER description")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add address
SET @columnname = 'address';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " TEXT AFTER logo_url")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add phone
SET @columnname = 'phone';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " VARCHAR(50) AFTER address")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add email
SET @columnname = 'email';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " VARCHAR(255) AFTER phone")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add ai_knowledge_base
SET @columnname = 'ai_knowledge_base';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " TEXT")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
