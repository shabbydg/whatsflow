-- Broadcast System Database Schema
-- Creates tables for contact lists, broadcasts, and message tracking

-- 1. Contact Lists Table
CREATE TABLE IF NOT EXISTS contact_lists (
  id VARCHAR(36) PRIMARY KEY,
  business_profile_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  total_contacts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE,
  INDEX idx_business_profile (business_profile_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. Contact List Members Table
CREATE TABLE IF NOT EXISTS contact_list_members (
  id VARCHAR(36) PRIMARY KEY,
  list_id VARCHAR(36) NOT NULL,
  contact_id VARCHAR(36),
  phone_number VARCHAR(50) NOT NULL,
  full_name VARCHAR(255),
  custom_fields JSON,
  opted_out BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (list_id) REFERENCES contact_lists(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
  INDEX idx_list (list_id),
  INDEX idx_contact (contact_id),
  INDEX idx_opted_out (opted_out),
  UNIQUE KEY unique_list_phone (list_id, phone_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Broadcasts Table
CREATE TABLE IF NOT EXISTS broadcasts (
  id VARCHAR(36) PRIMARY KEY,
  business_profile_id VARCHAR(36) NOT NULL,
  device_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  message_content TEXT NOT NULL,
  message_type ENUM('text', 'image', 'file', 'location') DEFAULT 'text',
  media_url VARCHAR(500),
  status ENUM('draft', 'scheduled', 'sending', 'completed', 'failed', 'cancelled') DEFAULT 'draft',
  send_speed ENUM('slow', 'normal', 'fast', 'custom') DEFAULT 'normal',
  custom_delay INT COMMENT 'Delay in seconds (for custom speed)',
  total_recipients INT DEFAULT 0,
  sent_count INT DEFAULT 0,
  delivered_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  scheduled_at TIMESTAMP NULL,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (device_id) REFERENCES whatsapp_connections(id) ON DELETE CASCADE,
  INDEX idx_business_profile (business_profile_id),
  INDEX idx_device (device_id),
  INDEX idx_status (status),
  INDEX idx_scheduled_at (scheduled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. Broadcast Recipients Table
CREATE TABLE IF NOT EXISTS broadcast_recipients (
  id VARCHAR(36) PRIMARY KEY,
  broadcast_id VARCHAR(36) NOT NULL,
  contact_id VARCHAR(36),
  phone_number VARCHAR(50) NOT NULL,
  full_name VARCHAR(255),
  personalized_message TEXT,
  status ENUM('pending', 'queued', 'sending', 'sent', 'delivered', 'failed', 'skipped') DEFAULT 'pending',
  message_id VARCHAR(36) COMMENT 'Reference to messages table',
  error_message TEXT,
  sent_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (broadcast_id) REFERENCES broadcasts(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
  INDEX idx_broadcast (broadcast_id),
  INDEX idx_status (status),
  INDEX idx_phone (phone_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 5. Broadcast Contact Lists (Junction Table)
CREATE TABLE IF NOT EXISTS broadcast_contact_lists (
  id VARCHAR(36) PRIMARY KEY,
  broadcast_id VARCHAR(36) NOT NULL,
  list_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (broadcast_id) REFERENCES broadcasts(id) ON DELETE CASCADE,
  FOREIGN KEY (list_id) REFERENCES contact_lists(id) ON DELETE CASCADE,
  UNIQUE KEY unique_broadcast_list (broadcast_id, list_id),
  INDEX idx_broadcast (broadcast_id),
  INDEX idx_list (list_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 6. User Preferences for Broadcast Guidelines
CREATE TABLE IF NOT EXISTS user_broadcast_preferences (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  guidelines_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
