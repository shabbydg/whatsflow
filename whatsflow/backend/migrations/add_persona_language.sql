-- Add language preference to personas table
ALTER TABLE personas
ADD COLUMN preferred_language VARCHAR(50) DEFAULT NULL
COMMENT 'Preferred language for responses (e.g., en, si, ta, auto). NULL means auto-detect from user messages';
