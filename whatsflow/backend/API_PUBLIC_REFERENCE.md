# WhatsFlow Public API Reference

Complete API documentation for WhatsFlow Public API - for external integrations with accounting software, CRMs, and custom applications.

## Base URL

```
Production: https://your-domain.com/api/public/v1
Development: http://localhost:2152/api/public/v1
```

## Authentication

All API requests require an API key in the Authorization header:

```http
Authorization: Bearer wf_live_your_api_key_here
```

Get your API key from: **Dashboard → Settings → API Keys**

---

## 📬 Messaging

### Send Message

Send a WhatsApp message to a contact.

**Endpoint:** `POST /messages/send`

**Required Scope:** `messages:send`

**Request Body:**
```json
{
  "phone_number": "+94771234567",
  "message": "Hello! How can we help you today?"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message_id": "msg_abc123xyz",
    "phone_number": "+94771234567",
    "message": "Hello! How can we help you today?",
    "status": "sent",
    "timestamp": "2025-10-11T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `401` - Invalid or missing API key
- `403` - Usage limit exceeded or missing required scope
- `500` - Message sending failed

---

### Get Message Status

Retrieve the status of a previously sent message.

**Endpoint:** `GET /messages/:id`

**Required Scope:** `messages:read`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "msg_abc123xyz",
    "phone_number": "+94771234567",
    "contact_name": "John Doe",
    "direction": "outbound",
    "message_type": "text",
    "content": "Hello! How can we help you today?",
    "status": "delivered",
    "created_at": "2025-10-11T10:30:00.000Z"
  }
}
```

---

### List Messages

Get recent messages with pagination.

**Endpoint:** `GET /messages`

**Required Scope:** `messages:read`

**Query Parameters:**
- `page` (integer) - Page number (default: 1)
- `limit` (integer) - Items per page (default: 50, max: 100)
- `contact_id` (string) - Filter by specific contact

**Example:**
```
GET /messages?page=1&limit=20&contact_id=contact_abc123
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "msg_abc123",
      "phone_number": "+94771234567",
      "direction": "inbound",
      "content": "Hi, I need help",
      "created_at": "2025-10-11T10:25:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 145,
    "pages": 8
  }
}
```

---

## 📱 Devices

### List Devices

Get all WhatsApp devices connected to your account.

**Endpoint:** `GET /devices`

**Required Scope:** `devices:read`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "device_abc123",
      "device_name": "Sales Line",
      "phone_number": "+94771234567",
      "status": "connected",
      "is_primary": true,
      "last_connected_at": "2025-10-11T09:00:00.000Z",
      "created_at": "2025-10-01T10:00:00.000Z"
    }
  ]
}
```

**Device Statuses:**
- `connected` - Device is online and ready
- `qr_pending` - Waiting for QR code scan
- `disconnected` - Device is offline

---

### Get Device Status

Check the connection status of a specific device.

**Endpoint:** `GET /devices/:id/status`

**Required Scope:** `devices:read`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "device_abc123",
    "device_name": "Sales Line",
    "phone_number": "+94771234567",
    "status": "connected",
    "is_primary": true,
    "last_connected_at": "2025-10-11T09:00:00.000Z"
  }
}
```

---

## 👥 Contacts

### List Contacts

Get all contacts with pagination.

**Endpoint:** `GET /contacts`

**Required Scope:** `contacts:read`

**Query Parameters:**
- `page` (integer) - Page number (default: 1)
- `limit` (integer) - Items per page (default: 50, max: 100)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "id": "contact_abc123",
        "phone_number": "+94771234567",
        "name": "John Doe",
        "is_business": false,
        "last_message_at": "2025-10-11T10:30:00.000Z",
        "total_messages": 45
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 250,
      "pages": 5
    }
  }
}
```

---

### Get Contact

Get detailed information about a specific contact.

**Endpoint:** `GET /contacts/:id`

**Required Scope:** `contacts:read`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "contact_abc123",
    "phone_number": "+94771234567",
    "name": "John Doe",
    "profile_pic_url": "https://...",
    "is_business": false,
    "total_messages": 45,
    "last_message_at": "2025-10-11T10:30:00.000Z",
    "created_at": "2025-09-15T08:00:00.000Z"
  }
}
```

---

## 🔔 Webhooks

### List Webhooks

Get all configured webhooks.

**Endpoint:** `GET /webhooks`

**Required Scope:** `webhooks:manage`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "webhook_abc123",
      "url": "https://your-domain.com/webhooks/whatsflow",
      "events": ["message.received", "device.disconnected"],
      "is_active": true,
      "success_count": 1234,
      "failure_count": 5,
      "last_triggered_at": "2025-10-11T10:30:00.000Z"
    }
  ]
}
```

---

### Create Webhook

Register a new webhook endpoint.

**Endpoint:** `POST /webhooks`

**Required Scope:** `webhooks:manage`

**Request Body:**
```json
{
  "url": "https://your-domain.com/webhooks/whatsflow",
  "events": ["message.received", "message.sent", "device.disconnected"],
  "description": "Production webhook for CRM integration"
}
```

**Available Events:**
- `message.received` - Inbound message received
- `message.sent` - Outbound message sent
- `message.delivered` - Message delivered to recipient
- `message.failed` - Message failed to send
- `device.connected` - Device connected successfully
- `device.disconnected` - Device lost connection
- `device.qr_updated` - New QR code generated

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "webhook_abc123",
    "url": "https://your-domain.com/webhooks/whatsflow",
    "secret": "whsec_abc123xyz789...",
    "events": ["message.received", "message.sent"],
    "is_active": true,
    "created_at": "2025-10-11T10:00:00.000Z"
  },
  "message": "Webhook created successfully. Save the secret - it will not be shown again."
}
```

---

### Update Webhook

Update webhook configuration.

**Endpoint:** `PUT /webhooks/:id`

**Required Scope:** `webhooks:manage`

**Request Body:**
```json
{
  "url": "https://new-domain.com/webhooks",
  "events": ["message.received"],
  "is_active": true
}
```

---

### Delete Webhook

Remove a webhook configuration.

**Endpoint:** `DELETE /webhooks/:id`

**Required Scope:** `webhooks:manage`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Webhook deleted successfully"
}
```

---

### Test Webhook

Send a test event to verify webhook endpoint.

**Endpoint:** `POST /webhooks/:id/test`

**Required Scope:** `webhooks:manage`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Test webhook queued for delivery"
}
```

---

### Get Webhook Deliveries

View delivery logs for a webhook.

**Endpoint:** `GET /webhooks/:id/deliveries`

**Required Scope:** `webhooks:manage`

**Query Parameters:**
- `limit` (integer) - Number of deliveries to return (default: 50, max: 100)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "delivery_abc123",
      "webhook_id": "webhook_xyz789",
      "event_type": "message.received",
      "response_status": 200,
      "attempt_number": 1,
      "delivered_at": "2025-10-11T10:30:00.000Z",
      "success": true
    }
  ]
}
```

---

## Webhook Payload Format

All webhook events are sent as HTTP POST requests:

**Headers:**
```
Content-Type: application/json
X-Webhook-Event: message.received
X-Webhook-Signature: sha256=abc123...
X-Webhook-Delivery-Id: delivery_xyz789
User-Agent: WhatsFlow-Webhooks/1.0
```

**Payload Example:**
```json
{
  "event": "message.received",
  "timestamp": "2025-10-11T10:30:00.000Z",
  "data": {
    "message_id": "msg_abc123",
    "contact_id": "contact_xyz789",
    "phone_number": "+94771234567",
    "contact_name": "John Doe",
    "message": "Hi, I need help",
    "message_type": "text",
    "device_id": "device_123",
    "device_name": "Main Line",
    "created_at": "2025-10-11T10:30:00.000Z"
  }
}
```

### Verifying Webhook Signatures

**Node.js:**
```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === `sha256=${expected}`;
}
```

**Python:**
```python
import hmac
import hashlib
import json

def verify_signature(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        json.dumps(payload).encode(),
        hashlib.sha256
    ).hexdigest()
    
    return signature == f'sha256={expected}'
```

---

## Rate Limits

Rate limits are based on your subscription plan:

| Plan | Requests/Minute | Requests/Hour |
|------|-----------------|---------------|
| Trial | 10 | 600 |
| Starter | 30 | 1,800 |
| Professional | 100 | 6,000 |
| Business | 300 | 18,000 |
| Enterprise | 1,000 | 60,000 |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1696852860
```

**429 Rate Limit Response:**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "You have exceeded the rate limit of 100 requests per minute",
  "retryAfter": 45
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Resource created |
| 400 | Bad request (invalid parameters) |
| 401 | Unauthorized (invalid API key) |
| 403 | Forbidden (insufficient permissions or quota exceeded) |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

**Error Response Format:**
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error description"
}
```

---

## Integration Examples

### Node.js / JavaScript

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:2152/api/public/v1',
  headers: {
    'Authorization': 'Bearer wf_live_your_key',
    'Content-Type': 'application/json'
  }
});

// Send message
async function sendMessage(phoneNumber, message) {
  try {
    const response = await api.post('/messages/send', {
      phone_number: phoneNumber,
      message: message
    });
    
    console.log('Message sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to send:', error.response?.data);
  }
}

// List devices
async function listDevices() {
  const response = await api.get('/devices');
  return response.data.data;
}
```

### Python

```python
import requests

API_KEY = 'wf_live_your_key'
BASE_URL = 'http://localhost:2152/api/public/v1'

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

# Send message
def send_message(phone_number, message):
    url = f'{BASE_URL}/messages/send'
    payload = {
        'phone_number': phone_number,
        'message': message
    }
    
    response = requests.post(url, headers=headers, json=payload)
    return response.json()

# List devices
def list_devices():
    url = f'{BASE_URL}/devices'
    response = requests.get(url, headers=headers)
    return response.json()['data']
```

### PHP

```php
<?php
$apiKey = 'wf_live_your_key';
$baseUrl = 'http://localhost:2152/api/public/v1';

function sendMessage($phoneNumber, $message) {
    global $apiKey, $baseUrl;
    
    $url = "$baseUrl/messages/send";
    $data = [
        'phone_number' => $phoneNumber,
        'message' => $message
    ];
    
    $options = [
        'http' => [
            'header' => "Authorization: Bearer $apiKey\r\n" .
                       "Content-Type: application/json\r\n",
            'method' => 'POST',
            'content' => json_encode($data)
        ]
    ];
    
    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    
    return json_decode($result, true);
}

// Usage
$response = sendMessage('+94771234567', 'Hello from PHP!');
print_r($response);
?>
```

---

## Webhooks Integration

### Express.js (Node.js)

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const WEBHOOK_SECRET = 'whsec_your_secret_here';

function verifySignature(payload, signature) {
  const expected = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
    
  return signature === `sha256=${expected}`;
}

app.post('/webhooks/whatsflow', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  
  // Verify signature
  if (!verifySignature(req.body, signature)) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = req.body;
  
  // Handle different event types
  switch (event.event) {
    case 'message.received':
      console.log('New message:', event.data.message);
      // Process message...
      break;
      
    case 'device.disconnected':
      console.log('Device disconnected:', event.data.device_name);
      // Send alert...
      break;
  }
  
  // Always respond with 200
  res.status(200).send('OK');
});

app.listen(3000);
```

### Flask (Python)

```python
from flask import Flask, request, jsonify
import hmac
import hashlib
import json

app = Flask(__name__)
WEBHOOK_SECRET = 'whsec_your_secret_here'

def verify_signature(payload, signature):
    expected = hmac.new(
        WEBHOOK_SECRET.encode(),
        json.dumps(payload, separators=(',', ':')).encode(),
        hashlib.sha256
    ).hexdigest()
    
    return signature == f'sha256={expected}'

@app.route('/webhooks/whatsflow', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Webhook-Signature')
    
    # Verify signature
    if not verify_signature(request.json, signature):
        return 'Invalid signature', 401
    
    event = request.json
    
    # Handle events
    if event['event'] == 'message.received':
        print(f"New message: {event['data']['message']}")
        # Process message...
    
    elif event['event'] == 'device.disconnected':
        print(f"Device disconnected: {event['data']['device_name']}")
        # Send alert...
    
    return 'OK', 200

if __name__ == '__main__':
    app.run(port=3000)
```

---

## Best Practices

1. **Always verify webhook signatures** to ensure authenticity
2. **Respond to webhooks within 30 seconds** (process asynchronously)
3. **Implement exponential backoff** for API rate limits
4. **Use HTTPS** for webhook endpoints in production
5. **Store API keys securely** in environment variables
6. **Monitor rate limit headers** to avoid hitting limits
7. **Handle errors gracefully** with proper retry logic
8. **Use test keys** during development
9. **Include phone country codes** in all requests
10. **Make webhook endpoints idempotent** (handle duplicate events)

---

## Support

Need help? Contact us:
- 📧 Email: support@whatsflow.ai
- 📚 Documentation: Dashboard → API Docs
- 🔑 Manage API Keys: Dashboard → Settings → API Keys
- 🔔 Manage Webhooks: Dashboard → Settings → Webhooks

---

For complete interactive documentation, visit the API Docs section in your WhatsFlow dashboard.

