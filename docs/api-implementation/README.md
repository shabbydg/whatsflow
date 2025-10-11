# WhatsFlow Public API Documentation

Complete documentation for the WhatsFlow Public API system - allowing external integrations with accounting software, CRMs, support systems, and custom applications.

---

## 🎯 Quick Start

**New to the API?** Start here: [01. Start Here - API Overview](./01.%20Start%20Here%20-%20API%20Overview.md)

**Want to test quickly?** Go to: [03. Quick Start Guide (5 min)](./03.%20Quick%20Start%20Guide%20(5%20min).md)

**Need full setup?** See: [04. Complete Setup Guide](./04.%20Complete%20Setup%20Guide.md)

---

## 📚 Documentation Structure

### Getting Started (01-04)
Introduction and setup guides for all skill levels.

- **01. Start Here - API Overview** - Main entry point, choose your path
- **02. API System Overview** - What the API can do, quick links
- **03. Quick Start Guide (5 min)** - Create API key, send first message
- **04. Complete Setup Guide** - Database migration, testing, webhooks

### Technical Details (05-07)
Architecture, implementation, and system status.

- **05. Implementation Technical Summary** - Architecture, security, design
- **06. Implementation Complete Report** - What was built, features list
- **07. System Completion Status** - Current status, testing, deployment

### Reference & Deployment (08-11)
Code organization and production deployment.

- **08. Files & Structure Reference** - File locations, code organization
- **09. Deployment Checklist** - Production deployment steps
- **10. Final Completion Summary** - Complete feature summary
- **11. Integration Examples** - Code samples and patterns

### API Reference
See [Backend Documentation: Public API Reference](../backend/10.%20Public%20API%20Reference.md)

---

## 🔌 What Can You Do?

### Send WhatsApp Messages Programmatically
```bash
curl -X POST http://localhost:2152/api/public/v1/messages/send \
  -H "Authorization: Bearer wf_live_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+94771234567",
    "message": "Hello from my app!"
  }'
```

### Receive Real-Time Events via Webhooks
```javascript
// Your webhook endpoint receives events
{
  "event": "message.received",
  "data": {
    "from": "+94771234567",
    "message": "Customer inquiry",
    "timestamp": "2025-10-11T10:30:00Z"
  }
}
```

### Manage Devices & Contacts
```python
# Python example
api = WhatsFlowAPI('wf_live_xxx')

# List devices
devices = api.list_devices()

# Get contacts
contacts = api.list_contacts()

# Verify WhatsApp number
is_valid = api.verify_number('+94771234567')
```

---

## 🎯 Use Cases

### Accounting Software Integration
- Send invoice reminders automatically
- Payment confirmation messages
- Statement delivery via WhatsApp

### CRM Integration
- Sync WhatsApp conversations
- Auto-create leads from messages
- Update customer records

### Support Ticket Systems
- Create tickets from WhatsApp messages
- Send updates to customers
- Auto-close resolved tickets

### E-commerce Automation
- Order confirmations
- Shipping updates
- Cart abandonment reminders

### Custom Workflows
- Integrate with any system
- Build custom automations
- Connect multiple platforms

---

## ⚡ API Features

### 🔑 Authentication
- API key-based (Bearer token)
- Scope-based permissions
- Test & Live environments
- Automatic key rotation

### 📊 19 API Endpoints

**Messages (3)**
- Send messages
- Get message status
- List message history

**Devices (2)**
- List devices
- Check device status

**Contacts (3)**
- List contacts
- Get contact details
- Verify WhatsApp numbers

**Webhooks (6)**
- Create/update/delete webhooks
- Test webhook delivery
- View delivery logs
- Retry failed deliveries

**API Keys (5)**
- Create/update/delete keys
- List all keys
- View usage statistics
- Scope management
- Revoke keys

### 🪝 Webhook Events (7 types)

1. `message.received` - New message received
2. `message.sent` - Message sent successfully
3. `message.failed` - Message failed to send
4. `device.connected` - Device connected
5. `device.disconnected` - Device disconnected
6. `contact.updated` - Contact info updated
7. `webhook.test` - Test event

### 🔒 Security Features

- **HMAC-SHA256 Signatures** - Verify webhook authenticity
- **Rate Limiting** - Prevent abuse (100 req/min)
- **Scope-Based Permissions** - Granular access control
- **API Key Expiry** - Automatic rotation support
- **IP Whitelisting** - Optional IP restrictions
- **Request Validation** - Schema validation on all endpoints

### 📈 Rate Limiting

- **Default:** 100 requests per minute per API key
- **Burst:** Up to 120 requests in short bursts
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **429 Response:** When limit exceeded

---

## 🛠️ Technical Stack

- **Backend:** Node.js + TypeScript + Express
- **Database:** MySQL (api_keys, webhooks, webhook_deliveries)
- **Authentication:** JWT + API Keys
- **Webhooks:** Async delivery with retries
- **Security:** HMAC-SHA256, bcrypt
- **Validation:** Joi schemas
- **Rate Limiting:** express-rate-limit

---

## 📖 Reading Order

### For Non-Technical Users:
1. **01. Start Here** - Understand what's possible
2. **03. Quick Start** - Create your first API key
3. **02. System Overview** - Explore capabilities

### For Developers:
1. **01. Start Here** - Overview and path selection
2. **04. Complete Setup** - Full technical setup
3. **Public API Reference** - Endpoint documentation
4. **11. Integration Examples** - Code samples

### For DevOps:
1. **04. Complete Setup** - Database & configuration
2. **09. Deployment Checklist** - Production deployment
3. **08. Files Reference** - Code organization

### For Product/Leadership:
1. **02. System Overview** - Capabilities overview
2. **06. Implementation Complete** - What was built
3. **10. Final Summary** - Complete feature list

---

## 🚀 Quick Links

| Need | Document |
|------|----------|
| **Overview** | [02. API System Overview](./02.%20API%20System%20Overview.md) |
| **Quick Start** | [03. Quick Start (5 min)](./03.%20Quick%20Start%20Guide%20(5%20min).md) |
| **Setup** | [04. Complete Setup](./04.%20Complete%20Setup%20Guide.md) |
| **API Docs** | [Public API Reference](../backend/10.%20Public%20API%20Reference.md) |
| **Examples** | [11. Integration Examples](./11.%20Integration%20Examples.md) |
| **Deploy** | [09. Deployment Checklist](./09.%20Deployment%20Checklist.md) |

---

## 💡 Common Questions

**Q: Do I need to be technical to use the API?**  
A: Not for basic usage! Follow the [Quick Start Guide](./03.%20Quick%20Start%20Guide%20(5%20min).md) - it's designed for non-technical users.

**Q: What's the cost?**  
A: API access is included with your WhatsFlow subscription. No additional charges for API calls.

**Q: Can I test without affecting production?**  
A: Yes! Use test mode API keys for safe testing. See [04. Complete Setup](./04.%20Complete%20Setup%20Guide.md).

**Q: How do I integrate with my accounting software?**  
A: Check [11. Integration Examples](./11.%20Integration%20Examples.md) for code samples and patterns.

**Q: What if I hit rate limits?**  
A: Contact support to increase your limits based on your subscription tier.

**Q: Are webhooks required?**  
A: No, but recommended for real-time notifications. You can also poll the API.

---

## 📞 Support

- **Documentation:** You're reading it!
- **API Reference:** [Public API Reference](../backend/10.%20Public%20API%20Reference.md)
- **Examples:** [Integration Examples](./11.%20Integration%20Examples.md)
- **Issues:** Check backend logs or contact support

---

## ✅ Implementation Status

- [x] Complete REST API (19 endpoints)
- [x] API Key Management
- [x] Webhook System
- [x] Rate Limiting
- [x] HMAC Security
- [x] Usage Tracking
- [x] Database Schema
- [x] Frontend UI
- [x] Documentation
- [x] Testing
- [x] Production Ready

**Status:** ✅ Complete and Production Ready

---

**Last Updated:** October 11, 2025  
**Version:** 1.0  
**Maintained by:** WhatsFlow Team

