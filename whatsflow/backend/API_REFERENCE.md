# WhatsFlow API Reference

Complete API documentation for WhatsFlow Backend.

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer {your-jwt-token}
```

---

## Authentication Endpoints

### Register User

Create a new user account and business profile.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "businessName": "My Business",
  "industry": "Retail",
  "description": "A retail business",
  "website": "https://mybusiness.com"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "businessProfileId": "business-uuid"
  }
}
```

### Login

Authenticate and receive a JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "businessProfileId": "business-uuid"
  }
}
```

---

## WhatsApp Endpoints

### Connect Device

Initiate WhatsApp connection and receive QR code.

**Endpoint:** `POST /whatsapp/connect`
**Auth:** Required

**Request Body:**
```json
{
  "phoneNumber": "+94771234567",
  "deviceName": "Main Device"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "connectionId": "connection-uuid",
  "qrCode": "data:image/png;base64,...",
  "message": "Scan QR code within 60 seconds"
}
```

**WebSocket Events:**
- `qr-code` - New QR code generated
- `connection-status` - Connection status updates

### Disconnect Device

Disconnect and logout from WhatsApp.

**Endpoint:** `POST /whatsapp/disconnect`
**Auth:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Device disconnected successfully"
}
```

### Send Message

Send a message to a contact.

**Endpoint:** `POST /whatsapp/send`
**Auth:** Required

**Request Body:**
```json
{
  "phoneNumber": "+94771234567",
  "message": "Hello! How can I help you today?"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "messageId": "message-uuid",
  "status": "sent"
}
```

### Get Devices

List all connected WhatsApp devices.

**Endpoint:** `GET /devices`
**Auth:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "device-uuid",
      "phone_number": "+94771234567",
      "device_name": "Main Device",
      "status": "connected",
      "ai_enabled": true,
      "persona_id": "persona-uuid",
      "created_at": "2025-10-09T10:00:00Z"
    }
  ]
}
```

### Update Device Settings

Update AI settings for a device.

**Endpoint:** `PUT /devices/:id`
**Auth:** Required

**Request Body:**
```json
{
  "device_name": "Updated Name",
  "ai_enabled": true,
  "persona_id": "persona-uuid",
  "ai_schedule": [
    { "from": "09:00", "to": "18:00" }
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "device-uuid",
    "device_name": "Updated Name",
    "ai_enabled": true,
    "persona_id": "persona-uuid"
  }
}
```

---

## Persona Endpoints

### List Personas

Get all personas for your business.

**Endpoint:** `GET /personas`
**Auth:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "persona-uuid",
      "name": "Friendly Support",
      "description": "A friendly customer support agent",
      "ai_instructions": "Be helpful and empathetic...",
      "ai_model": "gemini-2.5-flash",
      "tone": "friendly",
      "response_style": "concise",
      "preferred_language": null,
      "is_active": true,
      "created_at": "2025-10-09T10:00:00Z"
    }
  ]
}
```

### Get Persona

Get a specific persona by ID.

**Endpoint:** `GET /personas/:id`
**Auth:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "persona-uuid",
    "name": "Friendly Support",
    "ai_model": "gemini-2.5-flash",
    "preferred_language": "si"
  }
}
```

### Create Persona

Create a new custom persona.

**Endpoint:** `POST /personas`
**Auth:** Required

**Request Body:**
```json
{
  "name": "Sinhala Support Agent",
  "description": "Customer support in Sinhala",
  "ai_instructions": "You are a helpful customer support agent. Answer questions about products and services.",
  "ai_model": "gemini-2.5-flash",
  "tone": "friendly",
  "response_style": "concise",
  "preferred_language": "si"
}
```

**Available Languages:**
- `null` or `"auto"` - Auto-detect (default)
- `"en"` - English
- `"si"` - Sinhala
- `"ta"` - Tamil
- `"hi"` - Hindi
- `"es"` - Spanish
- `"fr"` - French
- `"de"` - German
- `"ar"` - Arabic
- `"zh"` - Chinese
- `"ja"` - Japanese

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "persona-uuid",
    "name": "Sinhala Support Agent",
    "preferred_language": "si"
  }
}
```

### Update Persona

Update an existing persona.

**Endpoint:** `PUT /personas/:id`
**Auth:** Required

**Request Body:**
```json
{
  "name": "Updated Name",
  "preferred_language": "ta",
  "tone": "professional"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "persona-uuid",
    "name": "Updated Name",
    "preferred_language": "ta"
  }
}
```

### Delete Persona

Delete a custom persona.

**Endpoint:** `DELETE /personas/:id`
**Auth:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Persona deleted successfully"
}
```

---

## Product Endpoints

### List Products

Get all products with pagination and filters.

**Endpoint:** `GET /products`
**Auth:** Required

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 50, max: 100) - Items per page
- `category` (string) - Filter by category
- `search` (string) - Search in name, description, SKU

**Example:**
```
GET /products?page=1&limit=20&category=Kitchen%20Appliances&search=cooker
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "product-uuid",
      "name": "Gas Cooker 2-Burner",
      "description": "High-quality gas cooker",
      "category": "Kitchen Appliances",
      "price": 15000,
      "currency": "LKR",
      "sku": "GC-2B-001",
      "image_url": "https://example.com/image.jpg",
      "product_url": "https://example.com/product",
      "specifications": {
        "brand": "Rinnai",
        "burners": 2
      },
      "is_available": true,
      "created_at": "2025-10-09T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### Get Product

Get a single product by ID.

**Endpoint:** `GET /products/:id`
**Auth:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "product-uuid",
    "name": "Gas Cooker 2-Burner",
    "price": 15000,
    "image_url": "https://example.com/image.jpg"
  }
}
```

### Create Product

Add a new product to the catalog.

**Endpoint:** `POST /products`
**Auth:** Required

**Request Body:**
```json
{
  "name": "Gas Cooker 2-Burner",
  "description": "High-quality 2-burner gas cooker from Rinnai",
  "category": "Kitchen Appliances",
  "price": 15000,
  "currency": "LKR",
  "sku": "GC-2B-001",
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

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "product-uuid",
    "name": "Gas Cooker 2-Burner",
    "price": 15000
  }
}
```

### Update Product

Update an existing product.

**Endpoint:** `PUT /products/:id`
**Auth:** Required

**Request Body:**
```json
{
  "price": 14500,
  "is_available": true,
  "image_url": "https://example.com/new-image.jpg"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "product-uuid",
    "price": 14500,
    "updated_at": "2025-10-09T11:00:00Z"
  }
}
```

### Delete Product

Remove a product from the catalog.

**Endpoint:** `DELETE /products/:id`
**Auth:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### Get Categories

List all product categories.

**Endpoint:** `GET /products/categories/list`
**Auth:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "category": "Kitchen Appliances",
      "count": 45
    },
    {
      "category": "Water Heaters",
      "count": 23
    }
  ]
}
```

---

## Contact Endpoints

### List Contacts

Get all contacts with pagination.

**Endpoint:** `GET /contacts`
**Auth:** Required

**Query Parameters:**
- `page` (number) - Page number
- `limit` (number) - Items per page

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "contact-uuid",
      "phone_number": "+94771234567",
      "name": "John Doe",
      "first_message_at": "2025-10-01T10:00:00Z",
      "last_message_at": "2025-10-09T11:00:00Z",
      "total_messages": 156,
      "tags": ["vip", "lead"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 250,
    "pages": 5
  }
}
```

### Get Contact

Get a specific contact by ID.

**Endpoint:** `GET /contacts/:id`
**Auth:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "contact-uuid",
    "phone_number": "+94771234567",
    "name": "John Doe",
    "tags": ["vip"]
  }
}
```

---

## Message Endpoints

### Get Conversation

Get message history for a contact.

**Endpoint:** `GET /messages/conversation/:contactId`
**Auth:** Required

**Query Parameters:**
- `limit` (number, default: 100) - Number of messages

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "message-uuid",
      "contact_id": "contact-uuid",
      "direction": "inbound",
      "message_type": "text",
      "content": "Hi, I need a gas cooker",
      "status": "received",
      "created_at": "2025-10-09T10:00:00Z"
    },
    {
      "id": "message-uuid-2",
      "direction": "outbound",
      "content": "Sure! We have 2-burner and 4-burner models. Which one would you prefer?",
      "status": "sent",
      "created_at": "2025-10-09T10:00:05Z"
    }
  ]
}
```

---

## WebSocket Events

Connect to Socket.io for real-time updates:

```javascript
const socket = io('http://localhost:5000');

// Authenticate
socket.emit('authenticate', { token: 'your-jwt-token' });

// Join business room
socket.emit('join-business', {
  businessProfileId: 'business-uuid'
});
```

### Events to Listen

#### new-message
Emitted when a new message is received or sent.

```javascript
socket.on('new-message', (data) => {
  console.log(data);
  /*
  {
    id: "message-uuid",
    contact_id: "contact-uuid",
    direction: "inbound",
    content: "Hello",
    created_at: "2025-10-09T10:00:00Z"
  }
  */
});
```

#### qr-code
Emitted when a new QR code is generated for WhatsApp connection.

```javascript
socket.on('qr-code', (data) => {
  console.log(data);
  /*
  {
    connectionId: "connection-uuid",
    qr: "data:image/png;base64,..."
  }
  */
});
```

#### connection-status
Emitted when WhatsApp connection status changes.

```javascript
socket.on('connection-status', (data) => {
  console.log(data);
  /*
  {
    connectionId: "connection-uuid",
    status: "connected",
    deviceName: "Main Device"
  }
  */
});
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication:** 5 requests per minute
- **Message sending:** 30 requests per minute
- **General API:** 100 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1696852800
```

---

## Pagination

List endpoints support pagination:

**Request:**
```
GET /contacts?page=2&limit=25
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 25,
    "total": 250,
    "pages": 10
  }
}
```

---

## Filtering & Search

Many endpoints support filtering:

**Products:**
```
GET /products?category=Kitchen&search=cooker&is_available=true
```

**Contacts:**
```
GET /contacts?tags=vip,lead
```

---

## Best Practices

1. **Always handle errors gracefully**
2. **Use pagination for large datasets**
3. **Cache responses when appropriate**
4. **Use WebSocket for real-time updates**
5. **Implement retry logic for failed requests**
6. **Monitor rate limits**
7. **Keep tokens secure**
8. **Use HTTPS in production**

---

## Examples

### Complete Flow: Send AI Response

```javascript
// 1. Login
const loginRes = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const { token } = await loginRes.json();

// 2. Create multilingual persona
const personaRes = await fetch('/api/v1/personas', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Auto-Detect Support',
    ai_model: 'gemini-2.5-flash',
    preferred_language: null, // Auto-detect
    tone: 'friendly'
  })
});
const { data: persona } = await personaRes.json();

// 3. Connect WhatsApp device
const connectRes = await fetch('/api/v1/whatsapp/connect', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    phoneNumber: '+94771234567',
    deviceName: 'Support Line'
  })
});
const { qrCode } = await connectRes.json();

// 4. Update device to use persona
const updateRes = await fetch(`/api/v1/devices/${deviceId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ai_enabled: true,
    persona_id: persona.id
  })
});

// AI will now respond automatically in the user's language!
```

---

For more information, see [README.md](./README.md)
