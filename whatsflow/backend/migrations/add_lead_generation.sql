-- Migration: Add Lead Generation & Intelligence System
-- Enables AI-powered lead profiling, scoring, and intent detection

-- 1. Create lead_profiles table (without foreign keys initially)
CREATE TABLE IF NOT EXISTS lead_profiles (
  id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PRIMARY KEY,
  contact_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  business_profile_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  
  -- Extracted Profile Information
  company_name VARCHAR(255),
  job_title VARCHAR(255),
  industry VARCHAR(100),
  team_size VARCHAR(50),
  location VARCHAR(255),
  email VARCHAR(255),
  website VARCHAR(255),
  
  -- Lead Intelligence (JSON fields)
  pain_points JSON COMMENT 'Array of identified customer problems',
  interests JSON COMMENT 'Products/services the lead is interested in',
  intent_keywords JSON COMMENT 'High-intent keywords detected in conversations',
  
  -- Qualification Data
  budget_range VARCHAR(100),
  timeline VARCHAR(100),
  decision_stage ENUM('awareness', 'consideration', 'decision', 'purchased') DEFAULT 'awareness',
  
  -- Lead Scoring
  lead_score INT DEFAULT 0 COMMENT 'Score 0-100 based on engagement and intent',
  lead_temperature ENUM('cold', 'warm', 'hot') DEFAULT 'cold',
  
  -- Qualification Status
  is_qualified BOOLEAN DEFAULT false,
  qualification_notes TEXT,
  
  -- Engagement Metrics
  first_interaction_at TIMESTAMP NULL,
  last_interaction_at TIMESTAMP NULL,
  total_interactions INT DEFAULT 0,
  avg_response_time INT COMMENT 'Average response time in seconds',
  
  -- AI Generated Insights
  conversation_summary TEXT COMMENT 'AI-generated summary of conversations',
  next_best_action TEXT COMMENT 'AI-suggested next action',
  
  -- Sales Assignment
  assigned_to VARCHAR(36) COMMENT 'User ID from users table',
  lead_status ENUM('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost') DEFAULT 'new',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_lead_score (lead_score DESC),
  INDEX idx_lead_status (lead_status),
  INDEX idx_temperature (lead_temperature),
  INDEX idx_business_profile (business_profile_id),
  INDEX idx_decision_stage (decision_stage)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- NOTE: Foreign key constraints will be added in a separate migration
-- after all tables are created to avoid column compatibility issues

-- 2. Create lead_activities table (activity timeline)
CREATE TABLE IF NOT EXISTS lead_activities (
  id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PRIMARY KEY,
  lead_profile_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  activity_type ENUM(
    'profile_created',
    'message_received', 
    'message_sent',
    'score_increased',
    'score_decreased',
    'stage_changed',
    'status_changed',
    'note_added',
    'assigned',
    'intent_detected',
    'qualified',
    'disqualified'
  ) NOT NULL,
  description TEXT,
  old_value VARCHAR(255),
  new_value VARCHAR(255),
  metadata JSON COMMENT 'Additional activity context',
  created_by VARCHAR(36) COMMENT 'User ID who triggered the activity',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_lead_activity (lead_profile_id, created_at DESC),
  INDEX idx_activity_type (activity_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- NOTE: Foreign key constraints will be added in a separate migration

-- 3. Create intent_keywords table (for custom lead scoring)
CREATE TABLE IF NOT EXISTS intent_keywords (
  id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PRIMARY KEY,
  business_profile_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  keyword VARCHAR(100) NOT NULL,
  category ENUM('high_intent', 'medium_intent', 'low_intent', 'negative') NOT NULL,
  score_value INT DEFAULT 0 COMMENT 'Points to add/subtract from lead score',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_keyword (business_profile_id, keyword),
  INDEX idx_business_profile (business_profile_id),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- NOTE: Foreign key constraints will be added in a separate migration

-- 4. Insert default high-intent keywords for all business profiles
INSERT IGNORE INTO intent_keywords (id, business_profile_id, keyword, category, score_value)
SELECT 
  UUID() as id,
  bp.id as business_profile_id,
  keyword_data.keyword,
  keyword_data.category,
  keyword_data.score_value
FROM business_profiles bp
CROSS JOIN (
  -- High Intent Keywords
  SELECT 'price' as keyword, 'high_intent' as category, 20 as score_value UNION ALL
  SELECT 'pricing', 'high_intent', 20 UNION ALL
  SELECT 'cost', 'high_intent', 20 UNION ALL
  SELECT 'quote', 'high_intent', 25 UNION ALL
  SELECT 'proposal', 'high_intent', 25 UNION ALL
  SELECT 'buy', 'high_intent', 30 UNION ALL
  SELECT 'purchase', 'high_intent', 30 UNION ALL
  SELECT 'order', 'high_intent', 30 UNION ALL
  SELECT 'demo', 'high_intent', 20 UNION ALL
  SELECT 'trial', 'high_intent', 20 UNION ALL
  SELECT 'contract', 'high_intent', 25 UNION ALL
  SELECT 'payment', 'high_intent', 25 UNION ALL
  SELECT 'invoice', 'high_intent', 25 UNION ALL
  
  -- Medium Intent Keywords
  SELECT 'features', 'medium_intent', 10 UNION ALL
  SELECT 'how does', 'medium_intent', 10 UNION ALL
  SELECT 'can it', 'medium_intent', 10 UNION ALL
  SELECT 'does it support', 'medium_intent', 10 UNION ALL
  SELECT 'integration', 'medium_intent', 10 UNION ALL
  SELECT 'setup', 'medium_intent', 10 UNION ALL
  SELECT 'implementation', 'medium_intent', 10 UNION ALL
  SELECT 'comparison', 'medium_intent', 10 UNION ALL
  
  -- Low Intent Keywords
  SELECT 'information', 'low_intent', 5 UNION ALL
  SELECT 'learn more', 'low_intent', 5 UNION ALL
  SELECT 'curious', 'low_intent', 5 UNION ALL
  
  -- Negative Keywords (reduce score)
  SELECT 'just browsing', 'negative', -10 UNION ALL
  SELECT 'not interested', 'negative', -20 UNION ALL
  SELECT 'too expensive', 'negative', -15 UNION ALL
  SELECT 'maybe later', 'negative', -10
) as keyword_data;

-- 5. Add lead_profile_id to contacts table for quick lookup (if not exists)
SET @dbname = DATABASE();
SET @tablename = 'contacts';
SET @columnname = 'lead_profile_id';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL AFTER metadata")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Note: Foreign key constraint for contacts.lead_profile_id is added in add_lead_foreign_keys.sql

-- 7. Create view for lead dashboard (hot, warm, cold leads)
CREATE OR REPLACE VIEW lead_dashboard AS
SELECT 
  lp.*,
  c.name as contact_name,
  c.phone_number,
  c.profile_pic_url,
  c.last_message_at,
  bp.business_name,
  (SELECT COUNT(*) FROM lead_activities la WHERE la.lead_profile_id COLLATE utf8mb4_unicode_ci = lp.id COLLATE utf8mb4_unicode_ci) as activity_count,
  (SELECT COUNT(*) FROM messages m WHERE m.contact_id COLLATE utf8mb4_unicode_ci = lp.contact_id COLLATE utf8mb4_unicode_ci AND m.direction COLLATE utf8mb4_unicode_ci = 'inbound') as messages_received,
  (SELECT COUNT(*) FROM messages m WHERE m.contact_id COLLATE utf8mb4_unicode_ci = lp.contact_id COLLATE utf8mb4_unicode_ci AND m.direction COLLATE utf8mb4_unicode_ci = 'outbound') as messages_sent,
  CASE 
    WHEN lp.lead_score >= 70 THEN 'hot'
    WHEN lp.lead_score >= 40 THEN 'warm'
    ELSE 'cold'
  END as calculated_temperature
FROM lead_profiles lp
JOIN contacts c ON lp.contact_id COLLATE utf8mb4_unicode_ci = c.id COLLATE utf8mb4_unicode_ci
JOIN business_profiles bp ON lp.business_profile_id COLLATE utf8mb4_unicode_ci = bp.id COLLATE utf8mb4_unicode_ci
ORDER BY lp.lead_score DESC, lp.updated_at DESC;

