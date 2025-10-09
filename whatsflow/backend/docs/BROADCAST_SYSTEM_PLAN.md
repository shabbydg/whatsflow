# Broadcast Campaign System - Implementation Plan

## Overview
Create a WhatsApp broadcast system that allows users to send messages to multiple contacts while respecting WhatsApp Business API Terms of Service and rate limits.

## Key Requirements

### 1. WhatsApp Business Compliance
- **Rate Limiting**: Implement message throttling to prevent spam
- **Opt-out Support**: Allow recipients to unsubscribe
- **24-hour Window**: Respect WhatsApp's 24-hour messaging window
- **Content Guidelines**: Warn users about appropriate content
- **User Consent**: Only message contacts who opted-in

### 2. Features
- Contact list management (import, create, manage)
- Template messages with custom fields
- Message personalization (name, phone, custom fields)
- Scheduled broadcasts
- Real-time progress tracking
- Delivery status monitoring
- Draft save functionality

### 3. Rate Limiting Strategy
- **Slow**: 30 seconds delay between messages (120 msg/hour)
- **Normal**: 20 seconds delay (180 msg/hour)
- **Fast**: 10 seconds delay (360 msg/hour)
- **Custom**: User-defined delay
- Max 1000 messages per broadcast
- Queue-based processing

## Database Schema

### Tables to Create/Update

#### 1. contact_lists
```sql
CREATE TABLE contact_lists (
  id VARCHAR(36) PRIMARY KEY,
  business_profile_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  total_contacts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE,
  INDEX idx_business_profile (business_profile_id)
);
```

#### 2. contact_list_members
```sql
CREATE TABLE contact_list_members (
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
  UNIQUE KEY unique_list_phone (list_id, phone_number)
);
```

#### 3. broadcasts
```sql
CREATE TABLE broadcasts (
  id VARCHAR(36) PRIMARY KEY,
  business_profile_id VARCHAR(36) NOT NULL,
  device_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  message_content TEXT NOT NULL,
  message_type ENUM('text', 'image', 'file') DEFAULT 'text',
  media_url VARCHAR(500),
  status ENUM('draft', 'scheduled', 'sending', 'completed', 'failed', 'cancelled') DEFAULT 'draft',
  send_speed ENUM('slow', 'normal', 'fast', 'custom') DEFAULT 'normal',
  custom_delay INT,
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
  INDEX idx_status (status)
);
```

#### 4. broadcast_recipients
```sql
CREATE TABLE broadcast_recipients (
  id VARCHAR(36) PRIMARY KEY,
  broadcast_id VARCHAR(36) NOT NULL,
  contact_id VARCHAR(36),
  phone_number VARCHAR(50) NOT NULL,
  full_name VARCHAR(255),
  personalized_message TEXT,
  status ENUM('pending', 'sending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
  message_id VARCHAR(36),
  error_message TEXT,
  sent_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (broadcast_id) REFERENCES broadcasts(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
  INDEX idx_broadcast (broadcast_id),
  INDEX idx_status (status)
);
```

#### 5. broadcast_contact_lists
```sql
CREATE TABLE broadcast_contact_lists (
  id VARCHAR(36) PRIMARY KEY,
  broadcast_id VARCHAR(36) NOT NULL,
  list_id VARCHAR(36) NOT NULL,
  FOREIGN KEY (broadcast_id) REFERENCES broadcasts(id) ON DELETE CASCADE,
  FOREIGN KEY (list_id) REFERENCES contact_lists(id) ON DELETE CASCADE,
  UNIQUE KEY unique_broadcast_list (broadcast_id, list_id)
);
```

## API Endpoints

### Contact Lists
- `GET /api/v1/contact-lists` - Get all lists
- `POST /api/v1/contact-lists` - Create list
- `GET /api/v1/contact-lists/:id` - Get list details
- `PUT /api/v1/contact-lists/:id` - Update list
- `DELETE /api/v1/contact-lists/:id` - Delete list
- `POST /api/v1/contact-lists/:id/contacts` - Add contacts to list
- `DELETE /api/v1/contact-lists/:id/contacts/:contactId` - Remove contact
- `POST /api/v1/contact-lists/:id/import` - Import contacts (CSV)

### Broadcasts
- `GET /api/v1/broadcasts` - Get all broadcasts
- `POST /api/v1/broadcasts` - Create broadcast
- `GET /api/v1/broadcasts/:id` - Get broadcast details
- `PUT /api/v1/broadcasts/:id` - Update broadcast
- `DELETE /api/v1/broadcasts/:id` - Delete broadcast
- `POST /api/v1/broadcasts/:id/send` - Start sending
- `POST /api/v1/broadcasts/:id/cancel` - Cancel broadcast
- `GET /api/v1/broadcasts/:id/progress` - Get progress
- `GET /api/v1/broadcasts/:id/recipients` - Get recipients list

### Safety Guidelines
- `GET /api/v1/broadcasts/guidelines` - Get safety guidelines
- `POST /api/v1/broadcasts/acknowledge-guidelines` - Mark as read

## Frontend Pages

### 1. Contact Lists Page (`/campaigns/lists`)
- List all contact lists
- Create/edit/delete lists
- Import contacts from CSV
- View list members

### 2. Broadcasts Page (`/campaigns`)
- List all broadcasts (drafts, scheduled, completed)
- Create new broadcast button
- Filter by status
- View broadcast stats

### 3. Create Broadcast Wizard (`/campaigns/create`)
**Step 1: Broadcast Details**
- Broadcast name
- Select device
- Select contact lists
- Preview recipient count

**Step 2: Message Content**
- Message type (text, image, file)
- Message editor with custom field support
- Available fields: [full_name], [phone]
- Message preview

**Step 3: Sending Options**
- Send speed (Slow, Normal, Fast, Custom)
- When to send (Immediately or Schedule)
- Safety guidelines modal
- Review summary

### 4. Broadcast Details Page (`/campaigns/:id`)
- Broadcast info
- Real-time progress
- Recipient list with status
- Analytics (sent, delivered, failed)
- Cancel option

## Message Personalization

Support custom field replacement:
```
Hello [full_name],
Your order is ready for pickup.
Contact us at +94771234567
```

Becomes:
```
Hello John Doe,
Your order is ready for pickup.
Contact us at +94771234567
```

## Safety Guidelines Modal

Show on first broadcast creation:
- Content guidelines
- Rate limit information
- Best practices
- Opt-out requirements
- Warning about violations

## Queue Processing

Use Bull Queue for message sending:
1. User creates broadcast
2. Recipients added to queue
3. Worker processes queue with delays
4. Status updates in real-time
5. Retry failed messages (up to 3 attempts)

## Implementation Steps

### Phase 1: Database & Backend Core (Steps 1-5)
1. Create database migrations
2. Create contact list service
3. Create broadcast service
4. Create queue worker
5. Create API endpoints

### Phase 2: Frontend Core (Steps 6-8)
6. Create contact lists page
7. Create broadcasts list page
8. Create TypeScript types

### Phase 3: Broadcast Wizard (Steps 9-11)
9. Step 1: Broadcast details
10. Step 2: Message content
11. Step 3: Sending options

### Phase 4: Monitoring & Safety (Steps 12-14)
12. Broadcast progress tracking
13. Safety guidelines modal
14. Testing & documentation

## Security & Compliance

1. **Rate Limiting**: Enforce delays between messages
2. **Validation**: Validate phone numbers before sending
3. **Opt-out**: Honor opt-out requests
4. **Audit Log**: Track all broadcast activities
5. **User Education**: Clear guidelines and warnings

## Testing Checklist

- [ ] Create contact list
- [ ] Import contacts from CSV
- [ ] Create draft broadcast
- [ ] Preview personalized messages
- [ ] Send test broadcast (3 contacts)
- [ ] Monitor progress in real-time
- [ ] Cancel broadcast mid-sending
- [ ] Schedule broadcast for future
- [ ] Verify rate limiting
- [ ] Check delivery status updates
- [ ] Test with opted-out contacts

## Success Metrics

- Broadcast creation success rate
- Message delivery rate
- Average send time per broadcast
- User compliance with guidelines
- System stability under load
