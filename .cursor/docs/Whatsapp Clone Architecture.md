# MVP Architecture & Development Plan

## 🎯 MVP SCOPE (Phase 1 - 12 Weeks)

**Goal:** Build a functional WhatsApp business platform that validates core value propositions.

**Core Features Only:**
1. ✅ User authentication & business profile creation
2. ✅ WhatsApp connection (whatsapp-web.js initially)
3. ✅ Basic message sending/receiving
4. ✅ Contact management with manual tagging
5. ✅ Simple broadcast messaging
6. ✅ Basic analytics dashboard
7. ✅ REST API for integrations

**Excluded from MVP (Phase 2+):**
- ❌ AI chatbot builder (add in Phase 2)
- ❌ Automatic customer segmentation (Phase 2)
- ❌ Advanced analytics (Phase 2)
- ❌ Team collaboration features (Phase 3)
- ❌ CRM integrations (Phase 3)
- ❌ Baileys integration (Phase 2)

---

## 🏗️ SYSTEM ARCHITECTURE

### **High-Level Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Web Dashboard (Next.js)  │  Mobile App (Future)  │  REST API   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Express)                       │
│  - Authentication (JWT)                                          │
│  - Rate Limiting                                                 │
│  - Request Validation                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  Auth Service    │ │  WhatsApp        │ │  Analytics       │
│                  │ │  Manager         │ │  Service         │
│ - Registration   │ │                  │ │                  │
│ - Login          │ │ - Connection     │ │ - Message stats  │
│ - Profile Mgmt   │ │ - Send/Receive   │ │ - Engagement     │
└──────────────────┘ │ - Status Tracking│ └──────────────────┘
                     │ - Session Mgmt   │
                     └──────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ whatsapp-web.js  │ │  Message Queue   │ │  File Storage    │
│  Instances       │ │  (Bull/Redis)    │ │  (AWS S3/Local)  │
│                  │ │                  │ │                  │
│ - QR Connection  │ │ - Send Queue     │ │ - Media files    │
│ - Message Sync   │ │ - Webhook Queue  │ │ - Exports        │
└──────────────────┘ └──────────────────┘ └──────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
├──────────────────────────────────┬──────────────────────────────┤
│  PostgreSQL (Primary DB)         │  Redis (Cache & Queue)       │
│  - Users                          │  - Session data              │
│  - Business profiles              │  - WhatsApp sessions         │
│  - Contacts                       │  - Rate limiting             │
│  - Messages                       │  - Real-time updates         │
│  - Tags/Categories                │  - Job queues                │
│  - Campaigns                      │                              │
└──────────────────────────────────┴──────────────────────────────┘
```

---

## 📊 DATABASE SCHEMA

### **PostgreSQL Schema (Core Tables)**

```sql
-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Business Profiles
CREATE TABLE business_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    website VARCHAR(500),
    description TEXT,
    business_type VARCHAR(50), -- 'ecommerce', 'service', 'agency', etc.
    ai_profile JSONB, -- Stores AI-generated profile data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WhatsApp Connections
CREATE TABLE whatsapp_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    connection_mode VARCHAR(20) DEFAULT 'whatsapp-web', -- 'whatsapp-web' or 'baileys'
    status VARCHAR(20) DEFAULT 'disconnected', -- 'connected', 'disconnected', 'qr_pending'
    session_data TEXT, -- Encrypted session data
    qr_code TEXT,
    last_connected_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contacts
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    name VARCHAR(255),
    profile_pic_url VARCHAR(500),
    is_business BOOLEAN DEFAULT false,
    metadata JSONB, -- Additional contact info
    first_message_at TIMESTAMP,
    last_message_at TIMESTAMP,
    total_messages INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_profile_id, phone_number)
);

-- Tags
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7), -- Hex color code
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_profile_id, name)
);

-- Contact Tags (Many-to-Many)
CREATE TABLE contact_tags (
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (contact_id, tag_id)
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    whatsapp_message_id VARCHAR(255),
    direction VARCHAR(10) NOT NULL, -- 'inbound' or 'outbound'
    message_type VARCHAR(20) NOT NULL, -- 'text', 'image', 'video', 'document', 'audio'
    content TEXT,
    media_url VARCHAR(500),
    status VARCHAR(20), -- 'sent', 'delivered', 'read', 'failed'
    is_from_bot BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Broadcast Campaigns
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    message_content TEXT NOT NULL,
    media_url VARCHAR(500),
    target_type VARCHAR(20) NOT NULL, -- 'all', 'tags', 'custom'
    target_tags UUID[], -- Array of tag IDs
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'completed', 'failed'
    scheduled_at TIMESTAMP,
    total_recipients INT DEFAULT 0,
    sent_count INT DEFAULT 0,
    delivered_count INT DEFAULT 0,
    read_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaign Recipients (for tracking individual sends)
CREATE TABLE campaign_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'read', 'failed'
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API Keys (for REST API access)
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    last_used_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Webhooks
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    events TEXT[], -- Array of event types: 'message.received', 'message.sent', etc.
    secret VARCHAR(255), -- For webhook signature verification
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics (aggregated daily stats)
CREATE TABLE daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    messages_sent INT DEFAULT 0,
    messages_received INT DEFAULT 0,
    new_contacts INT DEFAULT 0,
    active_contacts INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_profile_id, date)
);

-- Indexes for performance
CREATE INDEX idx_messages_business_created ON messages(business_profile_id, created_at DESC);
CREATE INDEX idx_messages_contact ON messages(contact_id, created_at DESC);
CREATE INDEX idx_contacts_business ON contacts(business_profile_id);
CREATE INDEX idx_contacts_last_message ON contacts(last_message_at DESC);
CREATE INDEX idx_campaigns_business ON campaigns(business_profile_id, status);
```

---

## 🔧 TECH STACK DETAILED

### **Backend**

```javascript
// Primary Framework: Express.js with TypeScript
{
  "dependencies": {
    "express": "^4.18.2",
    "typescript": "^5.3.3",
    
    // WhatsApp
    "whatsapp-web.js": "^1.23.0",
    "qrcode": "^1.5.3",
    
    // Database
    "pg": "^8.11.3",
    "typeorm": "^0.3.19", // ORM for PostgreSQL
    "ioredis": "^5.3.2", // Redis client
    
    // Authentication
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "passport": "^0.7.0",
    
    // Queue Management
    "bull": "^4.12.0", // Job queue
    
    // API & Validation
    "express-validator": "^7.0.1",
    "helmet": "^7.1.0", // Security headers
    "cors": "^2.8.5",
    "rate-limiter-flexible": "^3.0.3",
    
    // File Upload
    "multer": "^1.4.5-lts.1",
    "aws-sdk": "^2.1524.0", // For S3
    
    // Utilities
    "dotenv": "^16.3.1",
    "winston": "^3.11.0", // Logging
    "axios": "^1.6.2",
    "cheerio": "^1.0.0-rc.12", // Web scraping
    
    // AI Integration (Phase 2)
    "openai": "^4.24.1"
  }
}
```

### **Frontend**

```javascript
// Framework: Next.js 14 with TypeScript
{
  "dependencies": {
    "next": "^14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.3",
    
    // UI Components
    "tailwindcss": "^3.4.0",
    "@headlessui/react": "^1.7.17",
    "lucide-react": "^0.303.0", // Icons
    
    // State Management
    "zustand": "^4.4.7",
    
    // Forms
    "react-hook-form": "^7.49.2",
    "zod": "^3.22.4", // Validation
    
    // Charts
    "recharts": "^2.10.3",
    
    // API Client
    "axios": "^1.6.2",
    "swr": "^2.2.4", // Data fetching
    
    // Real-time
    "socket.io-client": "^4.6.0",
    
    // Utilities
    "date-fns": "^3.0.6",
    "clsx": "^2.1.0"
  }
}
```

---

## 📁 PROJECT STRUCTURE

```
whatsflow/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── redis.ts
│   │   │   └── env.ts
│   │   ├── entities/          # TypeORM entities
│   │   │   ├── User.ts
│   │   │   ├── BusinessProfile.ts
│   │   │   ├── Contact.ts
│   │   │   └── Message.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── whatsapp.service.ts
│   │   │   ├── contact.service.ts
│   │   │   ├── message.service.ts
│   │   │   ├── campaign.service.ts
│   │   │   └── analytics.service.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── whatsapp.controller.ts
│   │   │   ├── contact.controller.ts
│   │   │   ├── message.controller.ts
│   │   │   └── campaign.controller.ts
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validate.middleware.ts
│   │   │   └── ratelimit.middleware.ts
│   │   ├── routes/
│   │   │   ├── api/
│   │   │   │   ├── v1/
│   │   │   │   │   ├── auth.routes.ts
│   │   │   │   │   ├── whatsapp.routes.ts
│   │   │   │   │   ├── contacts.routes.ts
│   │   │   │   │   ├── messages.routes.ts
│   │   │   │   │   └── campaigns.routes.ts
│   │   │   └── index.ts
│   │   ├── queues/
│   │   │   ├── message.queue.ts
│   │   │   ├── campaign.queue.ts
│   │   │   └── webhook.queue.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   ├── encryption.ts
│   │   │   └── webscraper.ts
│   │   └── app.ts
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── contacts/
│   │   │   │   ├── messages/
│   │   │   │   ├── campaigns/
│   │   │   │   ├── analytics/
│   │   │   │   └── settings/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── ui/              # Reusable UI components
│   │   │   ├── contacts/
│   │   │   ├── messages/
│   │   │   └── campaigns/
│   │   ├── lib/
│   │   │   ├── api.ts           # API client
│   │   │   └── utils.ts
│   │   ├── stores/
│   │   │   ├── auth.store.ts
│   │   │   └── whatsapp.store.ts
│   │   └── types/
│   │       └── index.ts
│   ├── public/
│   ├── package.json
│   └── next.config.js
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 DEVELOPMENT ROADMAP (12 Weeks)

### **Week 1-2: Foundation**
- [ ] Set up project structure
- [ ] Configure PostgreSQL + Redis
- [ ] Implement authentication (JWT)
- [ ] User registration/login API
- [ ] Basic dashboard UI
- [ ] Deploy development environment

**Deliverable:** Users can register and login

---

### **Week 3-4: WhatsApp Connection**
- [ ] Integrate whatsapp-web.js
- [ ] QR code generation/scanning
- [ ] Session management
- [ ] Connection status tracking
- [ ] UI for WhatsApp connection
- [ ] Handle disconnections/reconnections

**Deliverable:** Users can connect their WhatsApp number

---

### **Week 5-6: Messaging Core**
- [ ] Receive messages (webhook/polling)
- [ ] Send messages API
- [ ] Contact auto-creation
- [ ] Message storage
- [ ] Chat interface UI
- [ ] Real-time updates (Socket.io)

**Deliverable:** Users can send/receive messages through dashboard

---

### **Week 7-8: Contact Management**
- [ ] Contact list UI
- [ ] Manual tagging system
- [ ] Contact search/filter
- [ ] Contact details view
- [ ] Bulk actions
- [ ] Import/export contacts

**Deliverable:** Users can organize contacts with tags

---

### **Week 9-10: Broadcast Campaigns**
- [ ] Campaign creation UI
- [ ] Target audience selection (by tags)
- [ ] Message queue system
- [ ] Rate limiting (anti-spam)
- [ ] Campaign status tracking
- [ ] Campaign analytics

**Deliverable:** Users can send broadcast messages to segments

---

### **Week 11: Analytics & API**
- [ ] Basic analytics dashboard
- [ ] Message statistics
- [ ] Contact growth charts
- [ ] REST API endpoints
- [ ] API key generation
- [ ] API documentation

**Deliverable:** Users can view stats and integrate via API

---

### **Week 12: Polish & Launch**
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Security audit
- [ ] User testing
- [ ] Documentation
- [ ] Beta launch preparation

**Deliverable:** Production-ready MVP

---

## 🔐 SECURITY CONSIDERATIONS

### **Critical Security Measures**

1. **WhatsApp Session Security**
   - Encrypt session data at rest
   - Store credentials in environment variables
   - Implement session timeout
   - Secure QR code generation

2. **API Security**
   - JWT with refresh tokens
   - Rate limiting per user/IP
   - Input validation on all endpoints
   - SQL injection prevention (parameterized queries)
   - XSS protection

3. **Data Privacy**
   - GDPR compliance (data export/deletion)
   - Encrypt sensitive data
   - Secure file uploads
   - Audit logs

4. **Infrastructure**
   - HTTPS only
   - Secure Redis connection
   - Database backups
   - DDoS protection (Cloudflare)

---

## 📊 REST API DESIGN

### **API Endpoints (v1)**

```
Authentication:
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout

WhatsApp Connection:
GET    /api/v1/whatsapp/status
POST   /api/v1/whatsapp/connect
POST   /api/v1/whatsapp/disconnect
GET    /api/v1/whatsapp/qr

Contacts:
GET    /api/v1/contacts
GET    /api/v1/contacts/:id
POST   /api/v1/contacts
PUT    /api/v1/contacts/:id
DELETE /api/v1/contacts/:id
POST   /api/v1/contacts/:id/tags
DELETE /api/v1/contacts/:id/tags/:tagId

Messages:
GET    /api/v1/messages
GET    /api/v1/messages/:id
POST   /api/v1/messages/send
GET    /api/v1/messages/contact/:contactId

Tags:
GET    /api/v1/tags
POST   /api/v1/tags
PUT    /api/v1/tags/:id
DELETE /api/v1/tags/:id

Campaigns:
GET    /api/v1/campaigns
GET    /api/v1/campaigns/:id
POST   /api/v1/campaigns
PUT    /api/v1/campaigns/:id
DELETE /api/v1/campaigns/:id
POST   /api/v1/campaigns/:id/send

Analytics:
GET    /api/v1/analytics/overview
GET    /api/v1/analytics/messages
GET    /api/v1/analytics/contacts
GET    /api/v1/analytics/campaigns/:id

Webhooks:
GET    /api/v1/webhooks
POST   /api/v1/webhooks
PUT    /api/v1/webhooks/:id
DELETE /api/v1/webhooks/:id
```

### **Example API Request/Response**

```javascript
// Send Message
POST /api/v1/messages/send
Headers: {
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
Body: {
  "phoneNumber": "+1234567890",
  "message": "Hello from WhatsFlow!",
  "mediaUrl": "https://example.com/image.jpg" // optional
}

Response: {
  "success": true,
  "data": {
    "messageId": "uuid-here",
    "status": "sent",
    "timestamp": "2025-10-06T10:30:00Z"
  }
}
```

---

## 💰 COST ESTIMATE (Monthly)

### **Development Phase (12 weeks)**
- Developers (1-2): $0-$15K (if hiring)
- Cloud Infrastructure (Dev): $50-$100
- Tools & Services: $50-$100
**Total: $100-$15K+ depending on team**

### **Production (at scale)**

**Infrastructure:**
- VPS/Cloud (DigitalOcean/AWS): $50-$500
- PostgreSQL managed: $15-$100
- Redis managed: $10-$50
- S3 storage: $5-$50
- CDN (Cloudflare): $0-$20

**Services:**
- OpenAI API (AI features): $0-$500
- Email service (SendGrid): $0-$20
- SMS verification (Twilio): $10-$50
- Monitoring (Sentry): $0-$26

**Total Monthly:** $90-$1,300 depending on scale

---

## 📈 SCALABILITY PLAN

### **Handling Growth**

**100 users:**
- Single server
- Basic setup
- Cost: ~$100/month

**1,000 users:**
- Load balancer
- Multiple app servers
- Managed databases
- Cost: ~$500/month

**10,000 users:**
- Kubernetes cluster
- Database replication
- Redis cluster
- CDN
- Cost: ~$2,000-$5,000/month

**Key Scaling Strategies:**
1. Horizontal scaling of app servers
2. Database read replicas
3. Redis caching layer
4. Message queue for async processing
5. CDN for static assets
6. Multi-region deployment

---

## ✅ DEFINITION OF DONE (MVP)

**MVP is complete when:**
- [ ] 10 beta users successfully connected WhatsApp
- [ ] Users can send/receive messages
- [ ] Contacts are auto-created and manageable
- [ ] Tags work for segmentation
- [ ] Broadcast campaigns send successfully
- [ ] Analytics show basic stats
- [ ] REST API is documented and functional
- [ ] No critical bugs
- [ ] Load tested for 100 concurrent users
- [ ] Security audit completed
- [ ] Documentation written

---

**Ready to proceed to the Financial Model?**