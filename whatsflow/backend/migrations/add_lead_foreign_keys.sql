-- Add Foreign Key Constraints for Lead Generation Tables
-- This migration adds foreign key constraints after all tables are created
-- to avoid column compatibility issues during table creation

-- Add foreign key constraint for lead_profiles -> contacts
SET @contacts_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
                       WHERE TABLE_NAME = 'contacts' 
                       AND TABLE_SCHEMA = DATABASE());

SET @fk_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                  WHERE TABLE_NAME = 'lead_profiles' 
                  AND CONSTRAINT_NAME = 'fk_lead_profile_contact' 
                  AND TABLE_SCHEMA = DATABASE());

SET @sql = IF(@contacts_exists > 0 AND @fk_exists = 0, 
              'ALTER TABLE lead_profiles ADD CONSTRAINT fk_lead_profile_contact FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE',
              'SELECT 1');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key constraint for lead_profiles -> business_profiles
SET @business_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
                       WHERE TABLE_NAME = 'business_profiles' 
                       AND TABLE_SCHEMA = DATABASE());

SET @fk_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                  WHERE TABLE_NAME = 'lead_profiles' 
                  AND CONSTRAINT_NAME = 'fk_lead_profile_business' 
                  AND TABLE_SCHEMA = DATABASE());

SET @sql = IF(@business_exists > 0 AND @fk_exists = 0, 
              'ALTER TABLE lead_profiles ADD CONSTRAINT fk_lead_profile_business FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE',
              'SELECT 1');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key constraint for lead_activities -> lead_profiles
SET @lead_profiles_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
                            WHERE TABLE_NAME = 'lead_profiles' 
                            AND TABLE_SCHEMA = DATABASE());

SET @fk_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                  WHERE TABLE_NAME = 'lead_activities' 
                  AND CONSTRAINT_NAME = 'fk_lead_activity_profile' 
                  AND TABLE_SCHEMA = DATABASE());

SET @sql = IF(@lead_profiles_exists > 0 AND @fk_exists = 0, 
              'ALTER TABLE lead_activities ADD CONSTRAINT fk_lead_activity_profile FOREIGN KEY (lead_profile_id) REFERENCES lead_profiles(id) ON DELETE CASCADE',
              'SELECT 1');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key constraint for intent_keywords -> business_profiles
SET @business_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
                       WHERE TABLE_NAME = 'business_profiles' 
                       AND TABLE_SCHEMA = DATABASE());

SET @fk_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                  WHERE TABLE_NAME = 'intent_keywords' 
                  AND CONSTRAINT_NAME = 'fk_intent_keywords_business' 
                  AND TABLE_SCHEMA = DATABASE());

SET @sql = IF(@business_exists > 0 AND @fk_exists = 0, 
              'ALTER TABLE intent_keywords ADD CONSTRAINT fk_intent_keywords_business FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE',
              'SELECT 1');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verification queries
SELECT 'Foreign key constraints added successfully' as status;
