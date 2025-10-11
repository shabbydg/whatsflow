-- WhatsFlow API System Migration
-- Creates tables for API keys, webhooks, and API request tracking

-- Update api_keys table with additional fields
ALTER TABLE api_keys 
ADD COLUMN scopes JSON DEFAULT NULL COMMENT 'Array of permission scopes',
ADD COLUMN rate_limit_tier VARCHAR(20) DEFAULT 'standard' COMMENT 'Rate limit tier for this key',
ADD COLUMN environment VARCHAR(10) DEFAULT 'live' COMMENT 'live or test',
ADD COLUMN requests_count INT DEFAULT 0 COMMENT 'Total requests made with this key',
ADD COLUMN last_request_at TIMESTAMP NULL,
ADD INDEX idx_environment (environment),
ADD INDEX idx_is_active (is_active);

-- Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
    id VARCHAR(36) PRIMARY KEY,
    business_profile_id VARCHAR(36) NOT NULL,
    url VARCHAR(500) NOT NULL,
    secret VARCHAR(64) NOT NULL COMMENT 'Secret for HMAC signature verification',
    events JSON NOT NULL COMMENT 'Array of subscribed events',
    is_active BOOLEAN DEFAULT TRUE,
    description VARCHAR(255),
    last_triggered_at TIMESTAMP NULL,
    success_count INT DEFAULT 0,
    failure_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE,
    INDEX idx_business_profile (business_profile_id),
    INDEX idx_is_active (is_active)
);

-- Webhook deliveries log
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id VARCHAR(36) PRIMARY KEY,
    webhook_id VARCHAR(36) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    payload JSON NOT NULL,
    response_status INT,
    response_body TEXT,
    attempt_number INT DEFAULT 1,
    delivered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    next_retry_at TIMESTAMP NULL,
    FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE,
    INDEX idx_webhook (webhook_id),
    INDEX idx_event_type (event_type),
    INDEX idx_success (success),
    INDEX idx_delivered_at (delivered_at),
    INDEX idx_next_retry (next_retry_at)
);

-- API request logs for analytics
CREATE TABLE IF NOT EXISTS api_request_logs (
    id VARCHAR(36) PRIMARY KEY,
    api_key_id VARCHAR(36) NOT NULL,
    business_profile_id VARCHAR(36) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INT,
    response_time_ms INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_body JSON,
    response_body JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE,
    FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE,
    INDEX idx_api_key (api_key_id),
    INDEX idx_business_profile (business_profile_id),
    INDEX idx_created_at (created_at),
    INDEX idx_endpoint (endpoint)
);

