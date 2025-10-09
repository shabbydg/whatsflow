-- Update ai_conversations table to improve tracking and analytics
-- This migration adds comments to clarify field purposes

-- Add column comments for better documentation
ALTER TABLE ai_conversations
  MODIFY COLUMN device_id VARCHAR(36) DEFAULT NULL
  COMMENT 'WhatsApp device/connection that handled this conversation',

  MODIFY COLUMN message_id VARCHAR(36) DEFAULT NULL
  COMMENT 'Reference to the original WhatsApp message that triggered the AI response',

  MODIFY COLUMN model VARCHAR(50) DEFAULT NULL
  COMMENT 'AI model used (e.g., gemini-2.5-flash, claude-3-5-haiku)',

  MODIFY COLUMN tokens_used INT(11) DEFAULT 0
  COMMENT 'Total tokens used (input + output) for cost tracking',

  MODIFY COLUMN input_tokens INT(11) DEFAULT 0
  COMMENT 'Tokens used in the input/prompt',

  MODIFY COLUMN output_tokens INT(11) DEFAULT 0
  COMMENT 'Tokens used in the AI response',

  MODIFY COLUMN user_message TEXT DEFAULT NULL
  COMMENT 'The user message that prompted the AI response',

  MODIFY COLUMN ai_response TEXT DEFAULT NULL
  COMMENT 'The AI-generated response';

-- Note: Existing NULL values will remain NULL for device_id, message_id, and model
-- Future conversations will automatically populate these fields
-- This is acceptable as historical data may not have this information

-- Optionally, update tokens_used for existing records where it's 0 or NULL
UPDATE ai_conversations
SET tokens_used = COALESCE(input_tokens, 0) + COALESCE(output_tokens, 0)
WHERE tokens_used = 0 OR tokens_used IS NULL;
