-- Add email notification field to whatsapp_connections table
ALTER TABLE whatsapp_connections
ADD COLUMN email_on_disconnect BOOLEAN DEFAULT FALSE COMMENT 'Send email alert when device disconnects';

-- Add index for faster queries
CREATE INDEX idx_email_on_disconnect ON whatsapp_connections(email_on_disconnect);
