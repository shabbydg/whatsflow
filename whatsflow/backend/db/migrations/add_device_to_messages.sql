-- Add device_id to messages table to track which device handled each message
ALTER TABLE messages
ADD COLUMN device_id VARCHAR(36) AFTER contact_id,
ADD KEY idx_device_id (device_id);

-- Add device_id to contacts to track last device used
ALTER TABLE contacts
ADD COLUMN last_device_id VARCHAR(36) AFTER business_profile_id,
ADD KEY idx_last_device (last_device_id);
