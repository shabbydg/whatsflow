# WhatsFlow - WhatsApp Business Platform

A complete, production-ready WhatsApp Business Platform built with Next.js, Node.js, and MySQL.

## 🚀 Quick Start Guide

### Prerequisites

Make sure you have these installed:
- ✅ Node.js v18+
- ✅ MySQL 8+
- ✅ Redis

### Step 1: Start Backend Server

Open **Terminal 1**:

```bash
cd /Users/digitalarc/Development/Webroot/whatsflow/whatsflow/backend

# Kill any existing process on port 5000 (if needed)
lsof -ti:5000 | xargs kill -9

# Start the backend
npm run dev
```

**Backend will run on:** `http://localhost:2152`

You should see:
```
✅ Redis connected
🚀 Server running on port 2152
📝 Environment: development
🌐 CORS origin: http://localhost:2153
```

---

### Step 2: Start Frontend Server

Open **Terminal 2**:

```bash
cd /Users/digitalarc/Development/Webroot/whatsflow/frontend

# Start the frontend
npm run dev
```

**Frontend will run on:** `http://localhost:2153`

---

### Step 3: Use the Application

1. **Open your browser:** `http://localhost:2153`
2. **Register** a new account
3. **Login** with your credentials
4. **Go to Settings** page
5. **Enter your phone number** (with country code, e.g., +1234567890)
6. **Click "Connect WhatsApp"**
7. **Scan the QR code** with your WhatsApp mobile app:
   - Open WhatsApp on your phone
   - Tap Menu → Settings → Linked Devices
   - Tap "Link a Device"
   - Point your phone at the QR code
8. **Start messaging!**

---

## 📱 Features

### ✅ Completed Features:
- **Authentication** - Secure login/register with JWT
- **WhatsApp Integration** - Connect via QR code (whatsapp-web.js)
- **Real-time Messaging** - Send and receive messages instantly
- **Contact Management** - Organize contacts with tags
- **Message History** - View full conversation history
- **Dashboard Analytics** - See message statistics
- **Responsive Design** - Works on desktop and mobile
- **Socket.IO** - Real-time updates across the app
- **Public API** - Full REST API for external integrations
- **Webhooks** - Real-time event notifications
- **API Key Management** - Secure token-based authentication
- **AI Auto-Reply** - Multi-language AI responses
- **Lead Generation** - Automatic lead intelligence
- **Broadcast Campaigns** - Send to multiple contacts
- **Multi-Device Support** - Multiple WhatsApp numbers
- **Billing System** - Subscription management with PayHere

---

## 🔧 Troubleshooting

### Port 2152 Already in Use (Backend)

```bash
# Kill the process using port 2152
lsof -ti:2152 | xargs kill -9

# Or kill all node processes
pkill -f node
```

### Port 2153 Already in Use (Frontend)

```bash
# Kill the process using port 2153
lsof -ti:2153 | xargs kill -9
```

### Database Connection Issues

```bash
# Make sure MySQL is running
mysql --version

# Reset the database
mysql -u root whatsflow < /Users/digitalarc/Development/Webroot/whatsflow/whatsflow/backend/scripts/setup-database.sql
```

### Redis Not Running

```bash
# Start Redis
redis-server

# Or on macOS with Homebrew
brew services start redis

# Check if Redis is running
redis-cli ping
# Should return: PONG
```

### Backend Won't Start

```bash
# Check logs
tail -f /Users/digitalarc/Development/Webroot/whatsflow/whatsflow/backend/logs/combined.log

# Reinstall dependencies
cd /Users/digitalarc/Development/Webroot/whatsflow/whatsflow/backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend Build Errors

```bash
# Clear Next.js cache
cd /Users/digitalarc/Development/Webroot/whatsflow/frontend
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📁 Project Structure

```
whatsflow/
├── whatsflow/backend/              # Backend API Server
│   ├── src/
│   │   ├── config/                # Database & Redis config
│   │   │   ├── database.ts
│   │   │   └── redis.ts
│   │   ├── controllers/           # API Controllers
│   │   │   ├── auth.controller.ts
│   │   │   ├── whatsapp.controller.ts
│   │   │   ├── contact.controller.ts
│   │   │   └── message.controller.ts
│   │   ├── services/              # Business Logic
│   │   │   ├── auth.service.ts
│   │   │   ├── whatsapp.service.ts
│   │   │   ├── contact.service.ts
│   │   │   └── message.service.ts
│   │   ├── middleware/            # Auth & Error Handling
│   │   │   ├── auth.middleware.ts
│   │   │   └── errorHandler.middleware.ts
│   │   ├── routes/                # API Routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── whatsapp.routes.ts
│   │   │   ├── contact.routes.ts
│   │   │   └── message.routes.ts
│   │   ├── utils/                 # Utilities
│   │   │   ├── logger.ts
│   │   │   └── jwt.ts
│   │   ├── types/                 # TypeScript Types
│   │   │   └── index.ts
│   │   └── app.ts                 # Main Server File
│   ├── scripts/
│   │   └── setup-database.sql     # Database Schema
│   ├── .env                       # Environment Variables
│   └── package.json
│
└── frontend/                       # Frontend Next.js App
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/            # Auth Pages
    │   │   │   ├── login/
    │   │   │   └── register/
    │   │   ├── (dashboard)/       # Dashboard Pages
    │   │   │   ├── dashboard/
    │   │   │   ├── messages/
    │   │   │   ├── contacts/
    │   │   │   └── settings/
    │   │   ├── layout.tsx
    │   │   └── page.tsx
    │   ├── components/            # Reusable Components
    │   ├── lib/                   # API Client & Utils
    │   │   ├── api.ts
    │   │   ├── socket.ts
    │   │   └── utils.ts
    │   ├── stores/                # State Management
    │   │   ├── authStore.ts
    │   │   └── whatsappStore.ts
    │   └── types/                 # TypeScript Types
    │       └── index.ts
    ├── .env.local                 # Environment Variables
    └── package.json
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get user profile (requires auth)

### WhatsApp
- `POST /api/v1/whatsapp/connect` - Connect WhatsApp (requires auth)
- `GET /api/v1/whatsapp/status` - Get connection status (requires auth)
- `POST /api/v1/whatsapp/disconnect` - Disconnect WhatsApp (requires auth)
- `POST /api/v1/whatsapp/send` - Send message (requires auth)

### Contacts
- `GET /api/v1/contacts` - List all contacts (requires auth)
- `GET /api/v1/contacts/:id` - Get contact details (requires auth)
- `POST /api/v1/contacts` - Create contact (requires auth)
- `PUT /api/v1/contacts/:id` - Update contact (requires auth)
- `DELETE /api/v1/contacts/:id` - Delete contact (requires auth)
- `GET /api/v1/contacts/search?q=term` - Search contacts (requires auth)
- `POST /api/v1/contacts/:id/tags` - Add tag to contact (requires auth)

### Tags
- `GET /api/v1/contacts/tags` - List all tags (requires auth)
- `POST /api/v1/contacts/tags` - Create tag (requires auth)

### Messages
- `GET /api/v1/messages` - List messages (requires auth)
- `GET /api/v1/messages/conversation/:contactId` - Get conversation (requires auth)
- `GET /api/v1/messages/stats` - Get message statistics (requires auth)

---

## 🧪 Testing the API

### Test Registration
```bash
curl -X POST http://localhost:2152/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:2152/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Save the token from the response, then:**

### Test WhatsApp Connection
```bash
curl -X POST http://localhost:2152/api/v1/whatsapp/connect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "phoneNumber": "+1234567890"
  }'
```

### Get WhatsApp Status
```bash
curl -X GET http://localhost:2152/api/v1/whatsapp/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🗄️ Database Schema

The application uses MySQL with the following tables:

- **users** - User accounts
- **business_profiles** - Business information
- **whatsapp_connections** - WhatsApp device connections (multi-device support)
- **contacts** - Contact information
- **messages** - Message history
- **tags** - Contact tags
- **contact_tags** - Many-to-many relationship for contact tags
- **personas** - AI personalities
- **devices** - Alias for whatsapp_connections
- **broadcasts** - Broadcast campaigns
- **broadcast_recipients** - Campaign delivery tracking
- **contact_lists** - Contact list management
- **contact_list_members** - List membership
- **api_keys** - Public API authentication tokens
- **webhooks** - Webhook endpoint configurations
- **webhook_deliveries** - Webhook delivery logs
- **api_request_logs** - API usage analytics
- **plans** - Subscription plans
- **subscriptions** - User subscriptions
- **payments** - Payment records
- **usage_tracking** - Usage metrics
- **lead_profiles** - AI-generated lead intelligence
- **lead_activities** - Lead activity timeline
- **daily_stats** - Analytics data

---

## 🔐 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=2152

DB_HOST=localhost
DB_PORT=3306
DB_NAME=whatsflow
DB_USER=root
DB_PASSWORD=

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=CR6sS5ZHmLyOALBNbz56WvEBh8ZhMw1zsCufYc3BcG5X9qKDBWQe1quJcdLLOT9GQJg568zkq/uomDx9O0nToQ==
JWT_EXPIRES_IN=7d

WHATSAPP_SESSION_PATH=./whatsapp-sessions

CORS_ORIGIN=http://localhost:2153
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:2152
NEXT_PUBLIC_SOCKET_URL=http://localhost:2152
```

---

## 🔌 Public API & Integrations

WhatsFlow includes a full-featured Public API for integrating with external systems.

### Quick Start

1. **Create API Key:** Dashboard → Settings → API Keys
2. **View Documentation:** http://localhost:2153/docs
3. **Send Test Message:**
   ```bash
   curl -X POST http://localhost:2152/api/public/v1/messages/send \
     -H "Authorization: Bearer wf_live_your_key" \
     -H "Content-Type: application/json" \
     -d '{"phone_number": "+94771234567", "message": "Hello!"}'
   ```

### API Features

- ✅ **Messaging API** - Send/receive messages programmatically
- ✅ **Device Management** - Monitor connection status
- ✅ **Contact Access** - List and search contacts
- ✅ **Webhooks** - Real-time event notifications
- ✅ **Rate Limiting** - Plan-based quotas
- ✅ **Secure Authentication** - API key with scopes
- ✅ **SDKs** - Node.js and Python libraries included

### Resources

- **Quick Start:** `API_QUICKSTART.md`
- **Setup Guide:** `API_SETUP_GUIDE.md`
- **Full Reference:** `whatsflow/backend/API_PUBLIC_REFERENCE.md`
- **Implementation Details:** `API_IMPLEMENTATION_SUMMARY.md`
- **Examples:** `whatsflow/backend/examples/`
  - Node.js SDK
  - Python SDK
  - Webhook servers (Express.js & Flask)
  - Postman collection
  - Test scripts

### Common Use Cases

- 💼 Accounting software integration (invoice reminders)
- 🎫 Support ticket creation from WhatsApp
- 📊 CRM synchronization
- 🤖 Custom automation workflows
- 📱 Multi-platform messaging
- 🔔 Real-time notifications

---

## 🚢 Deployment (Coming Soon)

Instructions for deploying to:
- Vercel (Frontend)
- Railway/Render (Backend)
- PlanetScale (Database)
- Redis Cloud (Redis)

---

## 📝 License

MIT

---

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the logs:
   - Backend: `tail -f whatsflow/backend/logs/combined.log`
   - Frontend: Check browser console
3. Ensure all services are running:
   - MySQL: `mysql --version`
   - Redis: `redis-cli ping`
   - Backend: `curl http://localhost:2152/health`

---

## 🎯 Next Steps

Potential features to add:
- [ ] Bulk messaging / Campaigns
- [ ] AI Chatbot integration
- [ ] Analytics dashboard with charts
- [ ] File/media sending
- [ ] Message templates
- [ ] API key management
- [ ] Team collaboration
- [ ] Webhook support

---

**Built with ❤️ using Next.js, Node.js, TypeScript, MySQL, and Socket.IO**

Bismillah - الحمد لله
