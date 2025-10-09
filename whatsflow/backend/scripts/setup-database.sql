-- WhatsFlow Database Schema
-- Make sure you run: CREATE DATABASE whatsflow; before running this script

USE whatsflow;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email)
);

-- Business profiles table
CREATE TABLE IF NOT EXISTS business_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    website VARCHAR(500),
    description TEXT,
    business_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- WhatsApp connections table
CREATE TABLE IF NOT EXISTS whatsapp_connections (
    id VARCHAR(36) PRIMARY KEY,
    business_profile_id VARCHAR(36) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    connection_mode VARCHAR(20) DEFAULT 'whatsapp-web',
    status VARCHAR(20) DEFAULT 'disconnected',
    session_data TEXT,
    qr_code TEXT,
    last_connected_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE,
    INDEX idx_business_profile (business_profile_id),
    INDEX idx_status (status)
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id VARCHAR(36) PRIMARY KEY,
    business_profile_id VARCHAR(36) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    name VARCHAR(255),
    profile_pic_url VARCHAR(500),
    is_business BOOLEAN DEFAULT FALSE,
    metadata JSON,
    first_message_at TIMESTAMP NULL,
    last_message_at TIMESTAMP NULL,
    total_messages INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_contact (business_profile_id, phone_number),
    INDEX idx_business_profile (business_profile_id),
    INDEX idx_phone (phone_number),
    INDEX idx_last_message (last_message_at)
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
    id VARCHAR(36) PRIMARY KEY,
    business_profile_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tag (business_profile_id, name),
    INDEX idx_business_profile (business_profile_id)
);

-- Contact tags (many-to-many)
CREATE TABLE IF NOT EXISTS contact_tags (
    contact_id VARCHAR(36) NOT NULL,
    tag_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (contact_id, tag_id),
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(36) PRIMARY KEY,
    business_profile_id VARCHAR(36) NOT NULL,
    contact_id VARCHAR(36) NOT NULL,
    whatsapp_message_id VARCHAR(255),
    direction ENUM('inbound', 'outbound') NOT NULL,
    message_type VARCHAR(20) NOT NULL,
    content TEXT,
    media_url VARCHAR(500),
    status VARCHAR(20),
    is_from_bot BOOLEAN DEFAULT FALSE,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    INDEX idx_business_profile (business_profile_id),
    INDEX idx_contact (contact_id),
    INDEX idx_created_at (created_at),
    INDEX idx_direction (direction)
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id VARCHAR(36) PRIMARY KEY,
    business_profile_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    message_content TEXT NOT NULL,
    media_url VARCHAR(500),
    target_type VARCHAR(20) NOT NULL,
    target_tags JSON,
    status VARCHAR(20) DEFAULT 'draft',
    scheduled_at TIMESTAMP NULL,
    total_recipients INT DEFAULT 0,
    sent_count INT DEFAULT 0,
    delivered_count INT DEFAULT 0,
    read_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE,
    INDEX idx_business_profile (business_profile_id),
    INDEX idx_status (status)
);

-- Campaign recipients table
CREATE TABLE IF NOT EXISTS campaign_recipients (
    id VARCHAR(36) PRIMARY KEY,
    campaign_id VARCHAR(36) NOT NULL,
    contact_id VARCHAR(36) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    sent_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    read_at TIMESTAMP NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    INDEX idx_campaign (campaign_id),
    INDEX idx_status (status)
);

-- API keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR(36) PRIMARY KEY,
    business_profile_id VARCHAR(36) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    last_used_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE,
    INDEX idx_business_profile (business_profile_id)
);

-- Daily stats table
CREATE TABLE IF NOT EXISTS daily_stats (
    id VARCHAR(36) PRIMARY KEY,
    business_profile_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    messages_sent INT DEFAULT 0,
    messages_received INT DEFAULT 0,
    new_contacts INT DEFAULT 0,
    active_contacts INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_stat (business_profile_id, date),
    INDEX idx_business_profile (business_profile_id),
    INDEX idx_date (date)
);
