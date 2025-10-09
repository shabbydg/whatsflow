# WhatsFlow Backend API

WhatsFlow is an intelligent WhatsApp Business automation platform with AI-powered chat capabilities, multilingual support, and comprehensive contact management.

## Features

### 🤖 AI-Powered Chat
- **Multi-AI Support**: Integrates with Gemini, Claude, and OpenAI
- **Intelligent Fallback**: Automatically switches between AI providers if one fails
- **Custom Personas**: Define unique AI personalities with custom instructions
- **Context-Aware**: Maintains conversation history and business context
- **Token Tracking**: Monitors AI usage and costs

### 🌍 Multilingual Support
- **Auto-Detection**: Automatically detects and responds in the user's language
- **60+ Languages**: Supports English, Sinhala, Tamil, Hindi, Spanish, French, Arabic, Chinese, Japanese, and more
- **Script Flexibility**: Handles both native scripts (සිංහල, தமிழ், العربية) and romanized text (Singlish, Tanglish)
- **Code-Switching**: Naturally handles mixed-language conversations
- **Language Override**: Force specific language responses via persona settings

### 📱 WhatsApp Integration
- **Multi-Device Support**: Connect multiple WhatsApp Business accounts
- **QR Code Authentication**: Easy device pairing
- **Message Types**: Text, images, voice notes, videos, documents
- **Voice Transcription**: Converts voice notes to text using OpenAI Whisper
- **Image Analysis**: AI can see and respond to images using Claude/Gemini vision
- **Typing Indicators**: Simulates human-like typing delays
- **Real-time Updates**: WebSocket support for instant notifications

### 📊 Contact & Campaign Management
- **Contact Organization**: Track all customer interactions
- **Tags & Segmentation**: Organize contacts with custom tags
- **Message History**: Complete conversation logs
- **Campaign Builder**: Send bulk messages to targeted segments
- **Analytics**: Track message delivery and engagement

### 🛍️ Product Knowledge Base
- **Product Catalog**: Store products with images, prices, and specifications
- **Image URLs**: Link to product images for visual responses
- **Product URLs**: Direct links to product pages
- **Categories**: Organize products by category
- **Search & Filter**: Find products quickly
- **AI Integration**: AI can reference product catalog in responses

### 🔐 Security & Authentication
- **JWT Authentication**: Secure API access
- **Role-based Access**: Business profile isolation
- **API Key Support**: Alternative authentication method
- **Rate Limiting**: Protection against abuse
- **CORS Configuration**: Secure cross-origin requests

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MySQL
- **Cache**: Redis
- **WhatsApp**: Baileys library
- **AI**: Gemini, Claude, OpenAI SDKs
- **Real-time**: Socket.io
- **Queue**: Bull (Redis-based)

## Prerequisites

- Node.js 20.x or higher
- MySQL 8.x or higher
- Redis 6.x or higher
- WhatsApp Business account(s)

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=whatsflow

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-secret-key-here

# CORS
CORS_ORIGIN=http://localhost:3000

# AI Services (at least one required)
GOOGLE_API_KEY=your-gemini-api-key
ANTHROPIC_API_KEY=your-claude-api-key
OPENAI_API_KEY=your-openai-api-key

# WhatsApp
WHATSAPP_SESSION_PATH=./whatsapp-sessions
```

## Installation

```bash
# Install dependencies
npm install

# Run database migrations
mysql -u root whatsflow < scripts/setup-database.sql
mysql -u root whatsflow < migrations/add_devices_and_personas_safe.sql
mysql -u root whatsflow < migrations/add_products_table.sql
mysql -u root whatsflow < migrations/add_persona_language.sql

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Documentation

### Authentication

#### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "businessName": "My Business"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### WhatsApp

#### Connect Device
```http
POST /api/v1/whatsapp/connect
Authorization: Bearer {token}
Content-Type: application/json

{
  "phoneNumber": "+94771234567",
  "deviceName": "Main Device"
}
```

#### Send Message
```http
POST /api/v1/whatsapp/send
Authorization: Bearer {token}
Content-Type: application/json

{
  "phoneNumber": "+94771234567",
  "message": "Hello from WhatsFlow!"
}
```

### Personas

#### Create Persona
```http
POST /api/v1/personas
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Friendly Support Agent",
  "description": "A helpful and friendly customer support agent",
  "ai_instructions": "You are a friendly customer support agent. Be helpful and empathetic.",
  "ai_model": "gemini-2.5-flash",
  "tone": "friendly",
  "response_style": "concise",
  "preferred_language": null
}
```

**Language Options:**
- `null` or `"auto"`: Auto-detect from user messages (default)
- `"en"`: English
- `"si"`: Sinhala (සිංහල)
- `"ta"`: Tamil (தமிழ்)
- `"hi"`: Hindi
- `"es"`: Spanish
- `"fr"`: French
- `"de"`: German
- `"ar"`: Arabic
- `"zh"`: Chinese
- `"ja"`: Japanese

#### Update Persona
```http
PUT /api/v1/personas/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "preferred_language": "si"
}
```

### Products

#### Create Product
```http
POST /api/v1/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Gas Cooker 2-Burner",
  "description": "High-quality 2-burner gas cooker from Rinnai",
  "category": "Kitchen Appliances",
  "price": 15000,
  "currency": "LKR",
  "sku": "RIN-GC-2B-001",
  "image_url": "https://example.com/images/gas-cooker.jpg",
  "product_url": "https://example.com/products/gas-cooker-2b",
  "specifications": {
    "brand": "Rinnai",
    "burners": 2,
    "material": "Stainless Steel",
    "warranty": "2 years"
  },
  "is_available": true
}
```

#### List Products
```http
GET /api/v1/products?page=1&limit=50&category=Kitchen%20Appliances&search=cooker
Authorization: Bearer {token}
```

#### Update Product
```http
PUT /api/v1/products/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "price": 14500,
  "is_available": true,
  "image_url": "https://example.com/images/new-gas-cooker.jpg"
}
```

#### Delete Product
```http
DELETE /api/v1/products/:id
Authorization: Bearer {token}
```

### Contacts

#### List Contacts
```http
GET /api/v1/contacts?page=1&limit=50
Authorization: Bearer {token}
```

#### Get Contact Messages
```http
GET /api/v1/messages/conversation/:contactId?limit=100
Authorization: Bearer {token}
```

### Campaigns

#### Create Campaign
```http
POST /api/v1/campaigns
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Product Launch",
  "message": "Check out our new product!",
  "contactIds": ["contact-id-1", "contact-id-2"],
  "scheduledAt": "2025-10-10T10:00:00Z"
}
```

## AI Features

### Multilingual Conversations

The AI automatically adapts to the user's language:

**Example 1: Sinhala**
```
User: කොහොමද?
AI: හොඳින් ඉන්නවා! ඔයාට මොනවද ඕන?

User: gas cooker ekak ganna oni
AI: අපේ ළඟ විවිධ gas cooker තියෙනවා. ඔයාට burner කීයක් ඕන?
```

**Example 2: Tamil**
```
User: எப்படி இருக்கீங்க?
AI: நல்லா இருக்கேன்! உங்களுக்கு என்ன வேணும்?

User: gas aduppu venum
AI: எங்கள் கடையில் பல வகையான gas aduppu இருக்கு. எத்தனை burner வேணும்?
```

**Example 3: Code-Switching (Singlish)**
```
User: Hi, man gas cooker ekak ganna oni. Ada stock thiyenawada?
AI: Hi! Ow, gas cooker tika stock thiyenawa. 2-burner and 4-burner models thiyenawa. Kohomada?
```

### Voice Notes & Images

**Voice Note Processing:**
1. User sends a voice note
2. System transcribes using OpenAI Whisper
3. AI responds to the transcribed text
4. Response includes typing delay for natural feel

**Image Processing:**
1. User sends an image (with or without caption)
2. System analyzes image using Claude/Gemini vision
3. AI describes what it sees and responds appropriately
4. Can identify products, answer questions about images

### Message Formatting & Smart Splitting

**WhatsApp Formatting:**
AI automatically uses WhatsApp markdown for better readability:
- `*bold text*` for important information
- `_italic text_` for emphasis
- Bullet points (• or -) for lists
- Short, conversational messages

**Smart Message Splitting:**
Long responses are automatically split into multiple messages:
- Maximum 2 sentences per message
- Bullet point lists kept together
- Natural delays between messages (1 second)
- Each message gets its own typing indicator

**Example:**
```
Instead of:
"We have several gas cooker options available including 2-burner
models at LKR 15,000 and 4-burner models at LKR 28,000 and they
come with 2 year warranty and free installation."

AI sends:
Message 1: "We have *2-burner* and *4-burner* gas cookers available.
Which size works for you?"
[1 second delay + typing indicator]
Message 2: "Prices:
• 2-burner - LKR 15,000
• 4-burner - LKR 28,000"
[1 second delay + typing indicator]
Message 3: "Both include *2-year warranty* and free installation! 😊"
```

### Typing Simulation

All AI responses include human-like typing delays:
- Base delay: ~200ms per word
- Random variation: 0-1 second
- Maximum delay: 5 seconds
- Shows "typing..." indicator on WhatsApp
- Multiple messages sent with natural pauses

## Database Schema

### Key Tables

**users**: User accounts
**business_profiles**: Business information and settings
**whatsapp_connections**: WhatsApp device connections
**contacts**: Customer contacts
**messages**: All messages (inbound/outbound)
**personas**: AI personality configurations
**products**: Product catalog
**campaigns**: Bulk message campaigns
**ai_conversations**: AI conversation logs with token tracking

## WebSocket Events

Connect to Socket.io for real-time updates:

```javascript
const socket = io('http://localhost:5000');

// Join business room
socket.emit('join-business', { businessProfileId: 'xxx' });

// Listen for new messages
socket.on('new-message', (message) => {
  console.log('New message:', message);
});

// Listen for QR codes
socket.on('qr-code', (data) => {
  console.log('QR Code:', data.qr);
});

// Listen for connection status
socket.on('connection-status', (status) => {
  console.log('Status:', status);
});
```

## Best Practices

### AI Configuration

1. **Choose the Right Model:**
   - `gemini-2.5-flash`: Fast, free tier available, good for general use
   - `claude-3-5-haiku`: Fast, cost-effective, great for customer support
   - `claude-3-5-sonnet`: Best for complex tasks, vision, structured data
   - `gpt-4o-mini`: Fast, affordable, good balance
   - `gpt-4o`: Most capable, best for complex reasoning

2. **Persona Design:**
   - Keep instructions clear and specific
   - Use examples in instructions
   - Set appropriate tone (friendly, professional, casual)
   - Define response style (concise, detailed, bullet-points)
   - Use language override only when necessary

3. **Multilingual Setup:**
   - Leave `preferred_language` as `null` for auto-detection (recommended)
   - Only set specific language if business requires it
   - AI will maintain language consistency within conversations
   - Mix of languages in conversation is handled naturally

### Performance

1. **Message Handling:**
   - Use Redis for caching
   - Implement rate limiting for bulk operations
   - Archive old messages periodically

2. **AI Costs:**
   - Monitor token usage via `ai_conversations` table
   - Use cheaper models for simple queries
   - Set `maxTokens` limits in persona settings
   - Implement fallback to free tier (Gemini) when possible

3. **WhatsApp Stability:**
   - Use stable internet connection
   - Keep sessions backed up
   - Monitor connection status
   - Implement reconnection logic

## Troubleshooting

### WhatsApp Not Connecting
- Check session files exist in `whatsapp-sessions/`
- Verify QR code is scanned within 60 seconds
- Ensure only one device per phone number
- Check internet connectivity

### AI Not Responding
- Verify API keys are set in `.env`
- Check token limits haven't been exceeded
- Review persona configuration
- Check AI service status

### Language Not Detecting
- Ensure conversation history is available
- Verify persona `preferred_language` is `null` or `"auto"`
- Check AI model supports multilingual (all current models do)
- Review system prompt in logs

### Images/Voice Not Processing
- Verify `OPENAI_API_KEY` is set for voice transcription
- Check `ANTHROPIC_API_KEY` or `GOOGLE_API_KEY` for image analysis
- Ensure `form-data` package is installed
- Review media download logs

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please create an issue on GitHub.

## Changelog

### Version 1.6.0 (Latest)
- ✨ **Smart Message Splitting**: Long responses automatically split into multiple short messages
- ✨ **WhatsApp Formatting**: AI uses *bold*, _italic_, and bullet points for better readability
- ✨ **Ultra-Brief Responses**: Maximum 2 sentences per message unless using lists
- ✨ **Conversational Flow**: Multiple messages sent with natural delays
- 📊 **Enhanced Tracking**: AI conversations now track device_id, message_id, and model
- 📊 **Cost Monitoring**: Complete token usage tracking for billing
- 📚 **Documentation**: Added AI conversations tracking guide

### Version 1.5.0
- ✨ Added multilingual support with auto-detection
- ✨ Voice note transcription (OpenAI Whisper)
- ✨ Image analysis (Claude/Gemini vision)
- ✨ Typing indicators with human-like delays
- ✨ Product knowledge base with images and URLs
- ✨ Language preference in personas
- 🐛 Fixed Gemini model compatibility (gemini-2.5-flash)
- 🐛 Fixed AI conversations database schema
- 🐛 Fixed nodemon restart loop

### Version 1.0.0
- Initial release
- WhatsApp integration
- AI chat support
- Contact management
- Campaign builder
