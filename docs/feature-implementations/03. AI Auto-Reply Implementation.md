# WhatsFlow AI Implementation Guide

## ✅ What's Been Implemented

### 1. Frontend UI Pages

#### Personas Management (`/settings/personas`)
- **Location**: `frontend/src/app/(dashboard)/settings/personas/page.tsx`
- **Features**:
  - List all personas (system + custom)
  - Create new custom personas
  - Edit personas (AI instructions, model, tone, style)
  - Delete custom personas (with safety checks)
  - Beautiful card-based UI
  - Real-time device count per persona

#### Devices Management (`/settings/devices`)
- **Location**: `frontend/src/app/(dashboard)/settings/devices/page.tsx`
- **Features**:
  - List all WhatsApp devices
  - Add new devices with QR code generation
  - Edit device settings (name, persona, auto-reply, hours)
  - Set primary device
  - View device statistics
  - QR code display for connection
  - Working hours configuration

#### Business Profile Scraping (`/settings/profile`)
- **Location**: `frontend/src/app/(dashboard)/settings/profile/page.tsx`
- **Features**:
  - Import business info from website
  - AI-powered extraction
  - Display scraping status
  - Show imported data
  - Update AI knowledge base

### 2. Backend AI Services

#### AI Provider Services
All located in: `backend/src/services/ai/`

##### **Gemini Service** (`gemini.service.ts`)
- Google Gemini 2.0 Flash (FREE tier)
- Gemini 1.5 Flash & Pro
- Chat responses and structured data extraction

##### **Claude Service** (`claude.service.ts`)
- Claude 3.5 Haiku (cheapest)
- Claude 3.5 Sonnet (best for extraction)
- Excellent for business profile scraping

##### **OpenAI Service** (`openai.service.ts`)
- GPT-4o Mini (fast chat)
- GPT-4o (best capability)
- Structured JSON responses

##### **AI Manager** (`ai-manager.service.ts`)
- Coordinates all AI providers
- Smart fallbacks
- Automatic model routing
- Cost optimization

##### **Chat Service** (`chat.service.ts`)
- Generate AI responses with context
- Conversation history tracking
- Business knowledge base integration
- Token usage monitoring

##### **Profile Scraper** (`profile-scraper.service.ts`)
- Puppeteer-based web scraping
- AI-powered data extraction
- Structured business data
- Knowledge base generation

### 3. API Endpoints

#### Profile Scraping
- `POST /api/v1/profile/scrape` - Scrape business website
- `GET /api/v1/profile/status` - Get scraping status

#### Personas (Existing)
- `GET /api/v1/personas` - List all personas
- `POST /api/v1/personas` - Create persona
- `PUT /api/v1/personas/:id` - Update persona
- `DELETE /api/v1/personas/:id` - Delete persona
- `GET /api/v1/personas/models/available` - Get AI models

#### Devices (Existing)
- `GET /api/v1/devices` - List all devices
- `POST /api/v1/devices` - Create device
- `PUT /api/v1/devices/:id` - Update device
- `DELETE /api/v1/devices/:id` - Delete device

---

## 🔧 Setup Instructions

### 1. Install Dependencies

Backend packages are already installed:
- `@google/generative-ai` - Gemini
- `@anthropic-ai/sdk` - Claude
- `openai` - OpenAI
- `puppeteer` - Web scraping

### 2. Configure API Keys

Edit `whatsflow/backend/.env` and add at least ONE API key:

```env
# Google Gemini (RECOMMENDED - FREE TIER)
# Get key: https://aistudio.google.com/app/apikey
GOOGLE_API_KEY=your_key_here

# Anthropic Claude (Best for extraction)
# Get key: https://console.anthropic.com/
ANTHROPIC_API_KEY=your_key_here

# OpenAI (Optional)
# Get key: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_key_here
```

### 3. Start the Servers

**Terminal 1 - Backend:**
```bash
cd /Users/digitalarc/Development/Webroot/whatsflow/whatsflow/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd /Users/digitalarc/Development/Webroot/whatsflow/frontend
npm run dev
```

### 4. Access the Application

1. Open: `http://localhost:2153`
2. Login to your account
3. Navigate to:
   - **Settings → Personas** - Manage AI personalities
   - **Settings → Devices** - Manage WhatsApp devices
   - **Settings → Profile** - Import business info

---

## 📊 AI Models Available

### Google Gemini (FREE)
- **gemini-2.0-flash-exp** - FREE up to 1500 RPM
- **gemini-1.5-flash** - Fast and cheap
- **gemini-1.5-pro** - Large context (2M tokens)

**Use for**: Chat responses (default)

### Anthropic Claude
- **claude-3-5-haiku-20241022** - $0.25/1M tokens (cheapest)
- **claude-3-5-sonnet-20241022** - $3/1M tokens (best extraction)

**Use for**: Business profile scraping, complex analysis

### OpenAI
- **gpt-4o-mini** - $0.15/1M tokens
- **gpt-4o** - $2.50/1M tokens

**Use for**: Structured JSON outputs, function calling

---

## 💡 Usage Examples

### Create a Custom Persona

1. Go to **Settings → Personas**
2. Click **New Persona**
3. Fill in:
   - **Name**: "Product Specialist"
   - **Description**: "Expert on our product catalog"
   - **AI Instructions**:
     ```
     You are a knowledgeable product specialist. Help customers:
     - Find the right products for their needs
     - Answer technical questions
     - Provide pricing and availability
     - Guide through features and benefits

     Always be helpful, professional, and accurate.
     ```
   - **AI Model**: Gemini 2.0 Flash (FREE)
   - **Tone**: Professional
   - **Style**: Detailed
4. Click **Create Persona**

### Add a Device

1. Go to **Settings → Devices**
2. Click **Add Device**
3. Fill in:
   - **Device Name**: "Sales Line"
   - **Phone Number**: +1234567890
   - **AI Persona**: Product Specialist
   - **Enable Auto-Reply**: Yes
   - **Working Hours**: 9:00 AM - 6:00 PM
   - **Working Days**: Mon,Tue,Wed,Thu,Fri
4. Click **Create Device**
5. Scan QR code with WhatsApp

### Import Business Profile

1. Go to **Settings → Profile**
2. Enter your website URL: `https://yourbusiness.com`
3. Click **Import with AI**
4. Wait 20-30 seconds
5. Review imported data
6. Your AI knowledge base is now updated!

---

## 🎯 AI Cost Estimates

### Recommended Setup (Hybrid)
- **Chat responses**: Gemini Flash (FREE)
- **Profile scraping**: Claude Sonnet ($30 one-time for 1000 businesses)
- **Monthly cost**: $0-$10 for 50,000 messages

### Cost Breakdown
```
Small Business (100 customers, 5000 messages/month):
- Chat: FREE (Gemini)
- Profile scraping: $3 one-time
- Total: ~$3 setup, $0/month

Medium Business (1000 customers, 50,000 messages/month):
- Chat: FREE (Gemini under limit)
- Profile scraping: $30 one-time
- Total: ~$30 setup, $0-$10/month

Enterprise (10,000+ customers):
- Chat: $10-50/month (mixed models)
- Profile scraping: $100 one-time
- Total: ~$100 setup, $10-50/month
```

**vs Hiring Human Agents**: 99%+ cost savings!

---

## 🚀 Next Steps (Future Features)

### Auto-Reply Implementation
- [ ] Webhook for incoming messages
- [ ] AI response generation trigger
- [ ] Working hours check
- [ ] Response rate limiting
- [ ] Human handoff logic

### Enhanced Features
- [ ] Multi-language support
- [ ] Sentiment analysis
- [ ] Lead scoring
- [ ] Campaign automation
- [ ] Analytics dashboard
- [ ] A/B testing for personas
- [ ] Voice note transcription
- [ ] Image recognition

### Integration Ideas
- [ ] CRM integration (Salesforce, HubSpot)
- [ ] E-commerce platforms (Shopify, WooCommerce)
- [ ] Payment processing (Stripe)
- [ ] Calendar booking (Calendly)
- [ ] Email marketing (Mailchimp)

---

## 🔒 Security & Privacy

### API Keys
- Store API keys in `.env` (never commit to git)
- Each team member needs their own keys
- Monitor usage in provider dashboards

### Data Protection
- Business profiles stored in MySQL
- Conversation history encrypted
- GDPR compliant (user can delete data)
- Rate limiting on AI calls

### Rate Limits
- Gemini: 1500 requests/min (free tier)
- Claude: 50 requests/min (tier 1)
- OpenAI: 500 requests/min (tier 1)

---

## 📝 File Structure

```
whatsflow/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   │   ├── base.service.ts         # Base interface
│   │   │   │   ├── gemini.service.ts       # Google Gemini
│   │   │   │   ├── claude.service.ts       # Anthropic Claude
│   │   │   │   ├── openai.service.ts       # OpenAI
│   │   │   │   ├── ai-manager.service.ts   # AI coordinator
│   │   │   │   ├── chat.service.ts         # Chat responses
│   │   │   │   └── profile-scraper.service.ts # Web scraping
│   │   ├── controllers/
│   │   │   └── profile.controller.ts       # Profile API
│   │   └── routes/
│   │       └── profile.routes.ts           # Profile routes
│   └── .env                                # API keys here
│
└── frontend/
    └── src/
        ├── app/(dashboard)/settings/
        │   ├── personas/page.tsx           # Personas UI
        │   ├── devices/page.tsx            # Devices UI (existing)
        │   └── profile/page.tsx            # Profile scraping UI
        └── lib/
            └── api.ts                      # API client
```

---

## 🐛 Troubleshooting

### "No AI services available"
**Solution**: Add at least one API key to `.env` and restart backend

### Profile scraping timeout
**Solution**:
- Check website URL is accessible
- Increase timeout in `profile-scraper.service.ts`
- Try a simpler homepage URL

### High token usage
**Solution**:
- Use Gemini Flash for chat (FREE)
- Limit conversation history to 10 messages
- Use Claude Sonnet only for scraping

### Puppeteer errors
**Solution**:
```bash
# macOS
brew install chromium

# Update puppeteer
cd whatsflow/backend
npm install puppeteer@latest
```

---

## 📚 Resources

### API Documentation
- [Google Gemini API](https://ai.google.dev/docs)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [OpenAI API](https://platform.openai.com/docs)

### Get API Keys
- [Gemini API Key (FREE)](https://aistudio.google.com/app/apikey)
- [Claude API Key](https://console.anthropic.com/)
- [OpenAI API Key](https://platform.openai.com/api-keys)

### Pricing
- [Gemini Pricing](https://ai.google.dev/pricing)
- [Claude Pricing](https://www.anthropic.com/pricing)
- [OpenAI Pricing](https://openai.com/pricing)

---

## ✅ Implementation Checklist

- [x] Gemini AI service
- [x] Claude AI service
- [x] OpenAI AI service
- [x] AI Manager coordinator
- [x] Chat service with context
- [x] Profile scraper with Puppeteer
- [x] Personas management UI
- [x] Devices management UI
- [x] Profile scraping UI
- [x] API endpoints for all features
- [x] Frontend API integration
- [ ] Auto-reply webhook (future)
- [ ] Message handling with AI (future)
- [ ] Analytics dashboard (future)

---

**Built with ❤️ using Next.js, Node.js, TypeScript, Gemini, Claude, and OpenAI**

Bismillah - الحمد لله
