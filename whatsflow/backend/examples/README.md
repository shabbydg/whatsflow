# WhatsFlow API Examples

Complete examples and SDKs for integrating with WhatsFlow API.

## 📚 Available Examples

### SDK Libraries

1. **`nodejs-sdk.js`** - Complete Node.js/JavaScript SDK
   - All API endpoints wrapped in simple methods
   - Automatic rate limit handling
   - Error handling and retries
   - Webhook signature verification

2. **`python-sdk.py`** - Complete Python SDK
   - All API endpoints wrapped in simple methods
   - Type hints for better IDE support
   - Automatic error handling
   - Webhook signature verification

### Webhook Servers

3. **`webhook-server-express.js`** - Express.js webhook server
   - Signature verification
   - Event handlers for all webhook types
   - Auto-response examples
   - Production-ready structure

4. **`webhook-server-flask.py`** - Flask webhook server
   - Signature verification
   - Event handlers for all webhook types
   - Integration examples
   - Production-ready structure

### Testing

5. **`test-api.sh`** - Shell script to test all API endpoints
   - Quick verification of API setup
   - Rate limit header inspection
   - Error handling tests

---

## 🚀 Quick Start

### Using Node.js SDK

```javascript
const WhatsFlowAPI = require('./nodejs-sdk');

const api = new WhatsFlowAPI('wf_live_your_api_key');

// Send message
const result = await api.sendMessage('+94771234567', 'Hello!');
console.log('Message sent:', result.message_id);

// List devices
const devices = await api.listDevices();
console.log('Connected devices:', devices.filter(d => d.status === 'connected'));

// Create webhook
const webhook = await api.createWebhook(
  'https://your-domain.com/webhooks',
  ['message.received', 'device.disconnected']
);
console.log('Webhook created. Secret:', webhook.secret);
```

### Using Python SDK

```python
from whatsflow_sdk import WhatsFlowAPI

api = WhatsFlowAPI('wf_live_your_api_key')

# Send message
result = api.send_message('+94771234567', 'Hello!')
print(f"Message sent: {result['message_id']}")

# List devices
devices = api.list_devices()
connected = [d for d in devices if d['status'] == 'connected']
print(f"Connected devices: {len(connected)}")

# Create webhook
webhook = api.create_webhook(
    url='https://your-domain.com/webhooks',
    events=['message.received', 'device.disconnected']
)
print(f"Webhook created. Secret: {webhook['secret']}")
```

---

## 🔔 Running Webhook Server

### Express.js (Node.js)

```bash
# Install dependencies
npm install express

# Set webhook secret
export WEBHOOK_SECRET='whsec_your_secret_from_whatsflow'

# Run server
node webhook-server-express.js

# In another terminal, expose with ngrok
ngrok http 3000
```

### Flask (Python)

```bash
# Install dependencies
pip install flask

# Set webhook secret
export WEBHOOK_SECRET='whsec_your_secret_from_whatsflow'

# Run server
python webhook-server-flask.py

# In another terminal, expose with ngrok
ngrok http 3000
```

---

## 🧪 Testing

### Quick API Test

```bash
# Set your API key
export WHATSFLOW_API_KEY='wf_live_your_key_here'

# Run tests
chmod +x test-api.sh
./test-api.sh
```

### Manual cURL Tests

```bash
# List devices
curl -H "Authorization: Bearer wf_live_your_key" \
     http://localhost:2152/api/public/v1/devices

# Send message
curl -X POST http://localhost:2152/api/public/v1/messages/send \
  -H "Authorization: Bearer wf_live_your_key" \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+94771234567", "message": "Test"}'

# List contacts
curl -H "Authorization: Bearer wf_live_your_key" \
     http://localhost:2152/api/public/v1/contacts?limit=10
```

---

## 📖 Integration Patterns

### Pattern 1: CRM Integration

```javascript
// Sync WhatsApp messages to CRM
const api = new WhatsFlowAPI('wf_live_xxx');

// Webhook handler
app.post('/webhooks/whatsflow', verifySignature, async (req, res) => {
  const event = req.body;
  
  if (event.event === 'message.received') {
    // Update contact in CRM
    await CRM.updateContact({
      phone: event.data.phone_number,
      name: event.data.contact_name,
      lastContact: new Date(),
    });
    
    // Log interaction
    await CRM.createActivity({
      contactPhone: event.data.phone_number,
      type: 'whatsapp_message',
      content: event.data.message,
    });
  }
  
  res.status(200).send('OK');
});
```

### Pattern 2: Accounting Software Integration

```python
# Send payment reminders
api = WhatsFlowAPI('wf_live_xxx')

def send_payment_reminders():
    # Get overdue invoices from accounting system
    invoices = accounting_system.get_overdue_invoices()
    
    for invoice in invoices:
        if invoice.customer_phone:
            message = f"""
Hi {invoice.customer_name},

Your invoice #{invoice.number} for ${invoice.amount} is overdue.
Due date: {invoice.due_date}

Please make payment at your earliest convenience.

Thank you!
            """.strip()
            
            api.send_message(invoice.customer_phone, message)
            accounting_system.log_reminder(invoice.id)
```

### Pattern 3: Support Ticket System

```javascript
// Auto-create support tickets from WhatsApp
app.post('/webhooks/whatsflow', verifySignature, async (req, res) => {
  const event = req.body;
  
  if (event.event === 'message.received') {
    const message = event.data.message.toLowerCase();
    
    // Detect support requests
    if (message.includes('help') || message.includes('support') || message.includes('issue')) {
      // Create ticket
      const ticket = await SupportSystem.createTicket({
        customer: {
          name: event.data.contact_name,
          phone: event.data.phone_number,
        },
        message: event.data.message,
        source: 'whatsapp',
        priority: message.includes('urgent') ? 'high' : 'normal',
      });
      
      // Send confirmation
      await api.sendMessage(
        event.data.phone_number,
        `Support ticket #${ticket.id} created. We'll respond within 2 hours.`
      );
    }
  }
  
  res.status(200).send('OK');
});
```

---

## 🔒 Security Best Practices

1. **Always verify webhook signatures**
   ```javascript
   if (!verifySignature(payload, signature, secret)) {
     return res.status(401).send('Invalid signature');
   }
   ```

2. **Use environment variables for secrets**
   ```bash
   export WHATSFLOW_API_KEY='wf_live_xxx'
   export WEBHOOK_SECRET='whsec_yyy'
   ```

3. **Use HTTPS in production**
   - Webhook URLs must use HTTPS
   - Use services like ngrok for local testing
   - Configure SSL certificates for production

4. **Implement idempotency**
   ```javascript
   // Use delivery ID to detect duplicates
   const deliveryId = req.headers['x-webhook-delivery-id'];
   
   if (await isProcessed(deliveryId)) {
     return res.status(200).send('Already processed');
   }
   
   await markAsProcessed(deliveryId);
   // Process event...
   ```

5. **Respond quickly to webhooks**
   ```javascript
   // Process asynchronously
   app.post('/webhooks/whatsflow', async (req, res) => {
     // Verify signature...
     
     // Queue for background processing
     await queue.add('process-webhook', req.body);
     
     // Respond immediately
     res.status(200).send('OK');
   });
   ```

---

## 📊 Rate Limit Handling

### Automatic Retry with Backoff

```javascript
async function sendWithRetry(phoneNumber, message, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await api.sendMessage(phoneNumber, message);
    } catch (error) {
      if (error.message.includes('Rate limit')) {
        const retryAfter = extractRetryAfter(error.message);
        console.log(`Rate limited. Waiting ${retryAfter}s...`);
        await sleep(retryAfter * 1000);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries reached');
}
```

### Monitor Rate Limit Headers

```python
def monitor_rate_limits(response):
    """Monitor and log rate limit usage"""
    remaining = int(response.headers.get('X-RateLimit-Remaining', 0))
    limit = int(response.headers.get('X-RateLimit-Limit', 0))
    reset = int(response.headers.get('X-RateLimit-Reset', 0))
    
    percentage_used = ((limit - remaining) / limit) * 100
    
    if percentage_used > 80:
        print(f'⚠️  High API usage: {percentage_used:.1f}% used')
    
    if remaining < 10:
        print(f'🚨 Low rate limit: Only {remaining} requests remaining')
        print(f'   Resets at: {datetime.fromtimestamp(reset)}')
```

---

## 🛠️ Customization

### Add Custom Event Handlers

```javascript
// In webhook-server-express.js, add new handler:
eventHandlers['custom.event'] = async (data) => {
  console.log('Custom event received:', data);
  // Your custom logic here
};
```

### Extend SDK with Custom Methods

```javascript
// In nodejs-sdk.js, add new method:
class WhatsFlowAPI {
  // ... existing methods ...
  
  async customBulkSend(phoneNumbers, message) {
    const results = [];
    for (const phone of phoneNumbers) {
      try {
        const result = await this.sendMessage(phone, message);
        results.push({ phone, success: true, messageId: result.message_id });
      } catch (error) {
        results.push({ phone, success: false, error: error.message });
      }
    }
    return results;
  }
}
```

---

## 📝 Additional Resources

- **API Documentation:** http://localhost:2153/docs
- **Setup Guide:** `/API_SETUP_GUIDE.md`
- **API Reference:** `/whatsflow/backend/API_PUBLIC_REFERENCE.md`
- **Implementation Summary:** `/API_IMPLEMENTATION_SUMMARY.md`

---

## 💡 Tips

1. **Start with test keys** during development
2. **Use webhooks** instead of polling for better performance
3. **Monitor rate limits** to avoid 429 errors
4. **Implement proper error handling** for production use
5. **Keep API keys secure** - never commit to version control
6. **Use minimal scopes** - only grant necessary permissions
7. **Test webhook signatures** before going live
8. **Log all webhook events** for debugging
9. **Implement idempotency** in webhook handlers
10. **Use async processing** for webhook events

---

## 🆘 Need Help?

- Check the interactive documentation: Dashboard → API Docs
- Review delivery logs: Settings → Webhooks
- Monitor API usage: Settings → API Keys
- Email support: support@whatsflow.ai

---

**Happy integrating! 🚀**

