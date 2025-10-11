# AI Conversations Tracking

## Overview

The `ai_conversations` table tracks all AI-powered conversations for analytics, debugging, and cost management.

## Field Importance & Usage

### Critical Tracking Fields

#### **device_id** (VARCHAR 36)
**Importance:** HIGH
**Purpose:** Links the AI conversation to the specific WhatsApp device/connection

**Why it matters:**
- Track which device/phone number handled the conversation
- Analyze performance per device
- Identify which personas are used on which devices
- Troubleshoot device-specific issues

**Usage Example:**
```sql
-- Get AI conversation count by device
SELECT
  wc.device_name,
  COUNT(*) as conversation_count,
  SUM(tokens_used) as total_tokens
FROM ai_conversations ac
JOIN whatsapp_connections wc ON ac.device_id = wc.id
GROUP BY wc.device_name;
```

---

#### **message_id** (VARCHAR 36)
**Importance:** HIGH
**Purpose:** References the original WhatsApp message that triggered the AI response

**Why it matters:**
- Link AI responses to actual customer messages
- Trace conversation flow
- Debug AI responses by seeing the original message context
- Generate conversation reports with full message history

**Usage Example:**
```sql
-- Get full conversation thread
SELECT
  m.direction,
  m.content as original_message,
  ac.ai_response,
  ac.created_at
FROM messages m
LEFT JOIN ai_conversations ac ON m.id = ac.message_id
WHERE m.contact_id = 'contact-uuid'
ORDER BY m.created_at DESC;
```

---

#### **model** (VARCHAR 50)
**Importance:** CRITICAL
**Purpose:** Tracks which AI model generated the response

**Why it matters:**
- **Cost Analysis:** Different models have different pricing
  - Gemini 2.5 Flash: Free tier available
  - Claude Haiku: ~$0.25/1M input tokens, ~$1.25/1M output
  - GPT-4o: ~$2.50/1M input tokens, ~$10/1M output
- **Quality Tracking:** Compare response quality across models
- **Performance Metrics:** Analyze response times per model
- **Optimization:** Identify which models work best for your use case

**Usage Example:**
```sql
-- Cost analysis by model
SELECT
  model,
  COUNT(*) as conversation_count,
  SUM(input_tokens) as total_input_tokens,
  SUM(output_tokens) as total_output_tokens,
  SUM(tokens_used) as total_tokens,
  -- Estimated costs (update prices as needed)
  CASE
    WHEN model LIKE 'gemini%' THEN 0 -- Free tier
    WHEN model LIKE 'claude-3-5-haiku%' THEN
      (SUM(input_tokens) * 0.25 / 1000000) + (SUM(output_tokens) * 1.25 / 1000000)
    WHEN model LIKE 'gpt-4o%' THEN
      (SUM(input_tokens) * 2.50 / 1000000) + (SUM(output_tokens) * 10 / 1000000)
    ELSE 0
  END as estimated_cost_usd
FROM ai_conversations
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY model
ORDER BY estimated_cost_usd DESC;
```

---

#### **tokens_used** (INT)
**Importance:** CRITICAL
**Purpose:** Total tokens consumed (input + output)

**Why it matters:**
- **Billing:** Direct cost calculation
- **Budget Monitoring:** Track spending in real-time
- **Rate Limiting:** Prevent unexpected overages
- **Optimization:** Identify conversations using too many tokens

**Usage Example:**
```sql
-- Daily token usage trend
SELECT
  DATE(created_at) as date,
  model,
  SUM(tokens_used) as daily_tokens,
  COUNT(*) as conversation_count,
  AVG(tokens_used) as avg_tokens_per_conversation
FROM ai_conversations
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at), model
ORDER BY date DESC, daily_tokens DESC;
```

---

### Supporting Fields

#### **user_message** (TEXT)
The customer's message that prompted the AI response.

**Uses:**
- Analyze common questions
- Improve prompts based on user patterns
- Train custom models
- Quality assurance

#### **ai_response** (TEXT)
The AI-generated response sent to the customer.

**Uses:**
- Quality review
- Response time analysis
- Customer satisfaction tracking
- Identify areas for improvement

#### **input_tokens** & **output_tokens** (INT)
Separate tracking of input vs output tokens.

**Uses:**
- Detailed cost breakdown
- Optimize prompts to reduce input tokens
- Monitor response length trends
- Identify verbose responses

---

## Analytics Queries

### 1. Most Active Devices
```sql
SELECT
  wc.device_name,
  wc.phone_number,
  COUNT(*) as ai_conversations,
  AVG(ac.tokens_used) as avg_tokens,
  MAX(ac.created_at) as last_conversation
FROM ai_conversations ac
JOIN whatsapp_connections wc ON ac.device_id = wc.id
WHERE ac.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY wc.id
ORDER BY ai_conversations DESC;
```

### 2. Persona Performance
```sql
SELECT
  p.name as persona_name,
  COUNT(*) as conversation_count,
  AVG(ac.tokens_used) as avg_tokens,
  SUM(ac.tokens_used) as total_tokens,
  ac.model
FROM ai_conversations ac
JOIN personas p ON ac.persona_id = p.id
GROUP BY p.id, ac.model
ORDER BY conversation_count DESC;
```

### 3. Cost per Contact
```sql
SELECT
  c.name,
  c.phone_number,
  COUNT(*) as ai_interactions,
  SUM(ac.tokens_used) as total_tokens,
  -- Estimated cost
  SUM(
    CASE
      WHEN ac.model LIKE 'claude-3-5-haiku%' THEN
        (ac.input_tokens * 0.25 / 1000000) + (ac.output_tokens * 1.25 / 1000000)
      WHEN ac.model LIKE 'gpt-4o%' THEN
        (ac.input_tokens * 2.50 / 1000000) + (ac.output_tokens * 10 / 1000000)
      ELSE 0
    END
  ) as estimated_cost_usd
FROM ai_conversations ac
JOIN contacts c ON ac.contact_id = c.id
WHERE ac.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY c.id
ORDER BY estimated_cost_usd DESC
LIMIT 20;
```

### 4. Hourly Usage Pattern
```sql
SELECT
  HOUR(created_at) as hour,
  COUNT(*) as conversation_count,
  AVG(tokens_used) as avg_tokens
FROM ai_conversations
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY HOUR(created_at)
ORDER BY hour;
```

---

## Best Practices

### 1. Regular Monitoring
- Check token usage daily to avoid surprises
- Set up alerts for unusual spikes
- Review model distribution weekly

### 2. Cost Optimization
- Use Gemini for simple queries (free tier)
- Reserve expensive models for complex tasks
- Monitor average tokens per conversation
- Optimize system prompts to reduce token usage

### 3. Quality Assurance
- Sample random conversations weekly
- Check for hallucinations or errors
- Verify multilingual responses are accurate
- Monitor customer satisfaction

### 4. Data Retention
```sql
-- Archive old conversations (older than 90 days)
-- Keep aggregated stats, delete detailed records
INSERT INTO ai_conversations_archive
SELECT * FROM ai_conversations
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

DELETE FROM ai_conversations
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

---

## Troubleshooting

### Missing device_id
**Cause:** Conversation generated before device tracking was implemented
**Solution:** Filter by `device_id IS NOT NULL` in queries

### Missing model
**Cause:** Old conversations or error during response generation
**Solution:** Assume default model from persona settings

### Zero tokens_used
**Cause:** Database migration or calculation error
**Solution:** Run update query:
```sql
UPDATE ai_conversations
SET tokens_used = input_tokens + output_tokens
WHERE tokens_used = 0;
```

---

## Future Enhancements

Consider adding:
- **response_time** - Time taken to generate response
- **language_detected** - Auto-detected language
- **sentiment_score** - Customer sentiment analysis
- **error_count** - Number of retry attempts
- **feedback_score** - Customer satisfaction rating

---

For more information, see:
- [README.md](../README.md)
- [API_REFERENCE.md](../API_REFERENCE.md)
