-- Add user_message and ai_response columns to ai_conversations table
-- This allows storing the full conversation context

ALTER TABLE ai_conversations
ADD COLUMN IF NOT EXISTS user_message TEXT AFTER persona_id,
ADD COLUMN IF NOT EXISTS ai_response TEXT AFTER user_message;
