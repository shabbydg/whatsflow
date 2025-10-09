-- Migration: Add devices and personas support
-- This enables multiple WhatsApp connections per business with different personas

-- 1. Create personas table (reusable AI personalities/roles)
CREATE TABLE IF NOT EXISTS personas (
  id VARCHAR(36) PRIMARY KEY,
  business_profile_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL, -- e.g., "Sales", "Support", "Billing"
  description TEXT, -- What this persona does
  ai_instructions TEXT, -- Instructions for AI when handling messages
  ai_model VARCHAR(50) DEFAULT 'gpt-4o-mini', -- Which AI model to use
  tone VARCHAR(50), -- e.g., "professional", "friendly", "casual"
  response_style VARCHAR(50), -- e.g., "concise", "detailed"
  is_system BOOLEAN DEFAULT 0, -- System-provided personas (cannot be deleted)
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE,
  INDEX idx_business_profile (business_profile_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Modify whatsapp_connections to support multiple devices with personas
ALTER TABLE whatsapp_connections
  ADD COLUMN device_name VARCHAR(100) AFTER business_profile_id,
  ADD COLUMN persona_id VARCHAR(36) AFTER device_name,
  ADD COLUMN is_primary BOOLEAN DEFAULT 0 AFTER persona_id,
  ADD COLUMN auto_reply_enabled BOOLEAN DEFAULT 0,
  ADD COLUMN working_hours_start TIME DEFAULT '09:00:00',
  ADD COLUMN working_hours_end TIME DEFAULT '17:00:00',
  ADD COLUMN working_days VARCHAR(50) DEFAULT 'Mon,Tue,Wed,Thu,Fri', -- Comma-separated
  DROP INDEX phone_number, -- Remove unique constraint on phone_number
  ADD INDEX idx_business_device (business_profile_id, device_name),
  ADD FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE SET NULL;

-- 3. Insert default system personas
INSERT INTO personas (id, business_profile_id, name, description, ai_instructions, is_system)
SELECT
  UUID() as id,
  bp.id as business_profile_id,
  'Sales' as name,
  'Handles sales inquiries, product information, and closes deals' as description,
  'You are a professional sales representative. Your goal is to understand customer needs, provide product information, and guide them towards a purchase. Be persuasive but not pushy. Always ask qualifying questions and provide relevant solutions.' as ai_instructions,
  1 as is_system
FROM business_profiles bp;

INSERT INTO personas (id, business_profile_id, name, description, ai_instructions, is_system)
SELECT
  UUID() as id,
  bp.id as business_profile_id,
  'Support' as name,
  'Provides customer support and resolves issues' as description,
  'You are a helpful customer support agent. Your goal is to resolve customer issues quickly and effectively. Be empathetic, ask clarifying questions, and provide step-by-step solutions. Escalate to human agents when necessary.' as ai_instructions,
  1 as is_system
FROM business_profiles bp;

INSERT INTO personas (id, business_profile_id, name, description, ai_instructions, is_system)
SELECT
  UUID() as id,
  bp.id as business_profile_id,
  'General' as name,
  'General purpose assistant for all inquiries' as description,
  'You are a friendly business assistant. Help customers with general inquiries, provide information about the business, and route complex questions appropriately. Be professional yet approachable.' as ai_instructions,
  1 as is_system
FROM business_profiles bp;

-- 4. Update existing connections to have device names and personas
UPDATE whatsapp_connections wc
JOIN business_profiles bp ON wc.business_profile_id = bp.id
JOIN personas p ON p.business_profile_id = bp.id AND p.name = 'General'
SET
  wc.device_name = 'Primary Device',
  wc.persona_id = p.id,
  wc.is_primary = 1
WHERE wc.device_name IS NULL;

-- 5. Add AI conversation history table
CREATE TABLE IF NOT EXISTS ai_conversations (
  id VARCHAR(36) PRIMARY KEY,
  business_profile_id VARCHAR(36) NOT NULL,
  contact_id VARCHAR(36) NOT NULL,
  persona_id VARCHAR(36),
  device_id VARCHAR(36),
  message_id VARCHAR(36),
  role ENUM('user', 'assistant', 'system') NOT NULL,
  content TEXT NOT NULL,
  tokens_used INT DEFAULT 0,
  model VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE SET NULL,
  FOREIGN KEY (device_id) REFERENCES whatsapp_connections(id) ON DELETE SET NULL,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  INDEX idx_conversation (contact_id, created_at),
  INDEX idx_business_profile (business_profile_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Enhance business_profiles for AI scraping
ALTER TABLE business_profiles
  ADD COLUMN logo_url VARCHAR(500) AFTER description,
  ADD COLUMN address TEXT AFTER logo_url,
  ADD COLUMN phone VARCHAR(50) AFTER address,
  ADD COLUMN email VARCHAR(255) AFTER phone,
  ADD COLUMN social_media JSON AFTER email, -- Store social media links
  ADD COLUMN business_hours JSON AFTER social_media, -- Store operating hours
  ADD COLUMN products_services JSON AFTER business_hours, -- Store product/service catalog
  ADD COLUMN faq JSON AFTER products_services, -- Store frequently asked questions
  ADD COLUMN ai_knowledge_base TEXT AFTER faq, -- AI-generated knowledge base
  ADD COLUMN last_scraped_at TIMESTAMP NULL AFTER ai_knowledge_base,
  ADD COLUMN scraping_status ENUM('pending', 'in_progress', 'completed', 'failed') DEFAULT 'pending';
