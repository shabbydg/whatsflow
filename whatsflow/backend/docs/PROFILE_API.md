# Business Profile API

Complete API documentation for managing business profiles, knowledge bases, and AI scraping.

## Base URL
```
/api/v1/profile
```

All endpoints require authentication via JWT token in the `Authorization` header:
```
Authorization: Bearer {your-jwt-token}
```

---

## Profile Management

### Get Profile
Get the current business profile information.

**Endpoint:** `GET /api/v1/profile`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "business_name": "My Business",
    "industry": "Retail",
    "website": "https://mybusiness.com",
    "description": "A description of the business",
    "logo_url": "https://example.com/logo.png",
    "address": "123 Main St, City, Country",
    "phone": "+94771234567",
    "email": "contact@mybusiness.com",
    "social_media": {
      "facebook": "https://facebook.com/mybusiness",
      "instagram": "https://instagram.com/mybusiness"
    },
    "business_hours": {
      "monday": "9:00 AM - 5:00 PM",
      "tuesday": "9:00 AM - 5:00 PM"
    },
    "products_services": ["Product 1", "Service 1"],
    "faq": [
      {"question": "Q1?", "answer": "A1"}
    ],
    "business_type": "retail",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-10T00:00:00Z",
    "last_scraped_at": "2025-01-09T00:00:00Z",
    "scraping_status": "completed"
  }
}
```

---

### Update Profile
Update business profile fields.

**Endpoint:** `PUT /api/v1/profile`

**Request Body:**
```json
{
  "business_name": "Updated Business Name",
  "industry": "Technology",
  "website": "https://newwebsite.com",
  "description": "Updated description",
  "logo_url": "https://example.com/new-logo.png",
  "address": "456 New St, City, Country",
  "phone": "+94779876543",
  "email": "new@mybusiness.com",
  "social_media": {
    "facebook": "https://facebook.com/newpage",
    "instagram": "https://instagram.com/newpage",
    "twitter": "https://twitter.com/newpage"
  },
  "business_hours": {
    "monday": "8:00 AM - 6:00 PM",
    "tuesday": "8:00 AM - 6:00 PM",
    "wednesday": "8:00 AM - 6:00 PM",
    "thursday": "8:00 AM - 6:00 PM",
    "friday": "8:00 AM - 6:00 PM",
    "saturday": "9:00 AM - 2:00 PM",
    "sunday": "Closed"
  },
  "products_services": ["Product A", "Product B", "Service X"],
  "faq": [
    {"question": "What are your hours?", "answer": "Mon-Fri 8-6, Sat 9-2"},
    {"question": "Do you deliver?", "answer": "Yes, we deliver nationwide"}
  ],
  "business_type": "ecommerce"
}
```

**Notes:**
- All fields are optional - only send fields you want to update
- JSON fields (`social_media`, `business_hours`, `products_services`, `faq`) can be sent as objects or strings

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "business_name": "Updated Business Name",
    // ... all updated fields
  },
  "message": "Profile updated successfully"
}
```

---

## AI Website Scraping

### Scrape Website
Scrape business information from a website using AI.

**Endpoint:** `POST /api/v1/profile/scrape`

**Request Body:**
```json
{
  "website_url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "business_name": "Extracted Business Name",
    "industry": "Retail",
    "description": "AI-extracted business description",
    "products": [
      {
        "name": "Product 1",
        "description": "Product description",
        "price": "LKR 5,000",
        "category": "Electronics"
      }
    ],
    "services": [
      {
        "name": "Service 1",
        "description": "Service description",
        "pricing": "Starting at LKR 10,000"
      }
    ],
    "contact_info": {
      "email": "info@example.com",
      "phone": "+94771234567"
    }
  },
  "message": "Business profile scraped successfully"
}
```

**Notes:**
- This operation may take 10-60 seconds depending on website size
- AI will scrape up to 10 pages from the website
- Extracted data is automatically saved to the business profile
- AI knowledge base is generated from scraped data

---

### Get Scraping Status
Get the database scraping status (last scrape time, status).

**Endpoint:** `GET /api/v1/profile/scraping/status`

**Response:**
```json
{
  "success": true,
  "data": {
    "hasKnowledgeBase": true,
    "lastUpdated": "2025-01-09T10:30:00Z",
    "businessName": "My Business"
  }
}
```

---

### Get Scraping Progress
Get real-time progress of an ongoing scraping operation.

**Endpoint:** `GET /api/v1/profile/scraping/progress`

**Response (During Scraping):**
```json
{
  "success": true,
  "data": {
    "status": "scraping",
    "currentPage": 3,
    "totalPages": 10,
    "message": "Scraping page 3/10..."
  }
}
```

**Response (Analyzing):**
```json
{
  "success": true,
  "data": {
    "status": "analyzing",
    "currentPage": 5,
    "totalPages": 5,
    "message": "Analyzing 5 pages with AI..."
  }
}
```

**Response (Completed):**
```json
{
  "success": true,
  "data": {
    "status": "completed",
    "currentPage": 5,
    "totalPages": 5,
    "message": "Successfully scraped 5 pages"
  }
}
```

**Response (Failed):**
```json
{
  "success": true,
  "data": {
    "status": "failed",
    "currentPage": 0,
    "totalPages": 0,
    "message": "Scraping failed",
    "error": "Error message here"
  }
}
```

**Response (No Scraping in Progress):**
```json
{
  "success": true,
  "data": {
    "status": "pending",
    "currentPage": 0,
    "totalPages": 0,
    "message": "No scraping in progress"
  }
}
```

**Status Types:**
- `pending`: No scraping has started
- `scraping`: Currently scraping website pages
- `analyzing`: Scraping complete, AI is analyzing content
- `completed`: Successfully completed
- `failed`: Scraping failed with error

**Usage:**
Poll this endpoint every 1-2 seconds while scraping is in progress to show real-time progress to users.

---

## Knowledge Base Management

### Get Knowledge Base
Get the combined AI knowledge base (scraped + manual + uploaded files).

**Endpoint:** `GET /api/v1/profile/knowledge`

**Response:**
```json
{
  "success": true,
  "data": {
    "combined_knowledge": "# AI Scraped Knowledge Base\n\nBusiness info...\n\n---\n\n# Additional Knowledge\n\nManual knowledge...",
    "sources": {
      "scraped": true,
      "manual": true,
      "files_count": 2
    },
    "uploaded_files": [
      {
        "filename": "product-catalog.pdf",
        "path": "uploads/knowledge/123-product-catalog.pdf",
        "size": 1048576,
        "type": ".pdf",
        "uploadedAt": "2025-01-09T10:00:00Z"
      }
    ]
  }
}
```

---

### Update Knowledge Base
Edit or replace AI knowledge base and manual knowledge.

**Endpoint:** `PUT /api/v1/profile/knowledge`

**Request Body:**
```json
{
  "ai_knowledge_base": "# Updated AI Knowledge\n\nNew scraped content...",
  "manual_knowledge": "# Manual Knowledge\n\nAdditional info..."
}
```

**Notes:**
- Both fields are optional
- This replaces the entire content (does not append)
- Use this for editing existing knowledge

**Response:**
```json
{
  "success": true,
  "message": "Knowledge base updated successfully"
}
```

---

### Add Manual Knowledge (Append)
Append new text to the manual knowledge base.

**Endpoint:** `POST /api/v1/profile/knowledge/manual`

**Request Body:**
```json
{
  "title": "Warranty Information",
  "knowledge": "All products come with a 2-year manufacturer warranty. Extended warranties available for purchase."
}
```

**Notes:**
- `title` is optional but recommended for organization
- Content is appended to existing manual knowledge
- Use this for adding new knowledge without replacing existing content

**Response:**
```json
{
  "success": true,
  "message": "Knowledge added successfully"
}
```

---

### Upload Knowledge File
Upload a document (PDF, DOCX, TXT, MD) to extract and add to knowledge base.

**Endpoint:** `POST /api/v1/profile/knowledge/upload`

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Field name: `file`
- Allowed types: `.pdf`, `.docx`, `.doc`, `.txt`, `.md`
- Max size: 10MB

**Example (using FormData):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/api/v1/profile/knowledge/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded and processed successfully",
  "data": {
    "filename": "product-catalog.pdf",
    "extractedLength": 12543
  }
}
```

**Notes:**
- Text is automatically extracted from the file
- Extracted content is appended to manual knowledge
- File metadata is saved in database

---

## Frontend Implementation Guide

### Profile Update Form

**Basic Form Example:**
```javascript
async function updateProfile(formData) {
  const response = await fetch('/api/v1/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      business_name: formData.businessName,
      industry: formData.industry,
      website: formData.website,
      description: formData.description,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      business_type: formData.businessType,
      social_media: {
        facebook: formData.facebook,
        instagram: formData.instagram,
        twitter: formData.twitter
      },
      business_hours: formData.hours, // object
      faq: formData.faqItems // array
    })
  });

  const result = await response.json();
  return result;
}
```

---

### AI Scraping with Progress

**Example Implementation:**
```javascript
async function scrapeWebsite(websiteUrl) {
  // Start scraping
  const scrapeResponse = await fetch('/api/v1/profile/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ website_url: websiteUrl })
  });

  // Poll for progress
  const progressInterval = setInterval(async () => {
    const progressResponse = await fetch('/api/v1/profile/scraping/progress', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const { data } = await progressResponse.json();

    // Update UI
    updateProgressBar(data.currentPage, data.totalPages);
    showStatus(data.message);

    // Stop polling when complete or failed
    if (data.status === 'completed' || data.status === 'failed') {
      clearInterval(progressInterval);

      if (data.status === 'completed') {
        showSuccess('Scraping completed!');
        refreshProfile();
      } else {
        showError(data.error);
      }
    }
  }, 2000); // Poll every 2 seconds
}
```

---

### Knowledge Base Editor

**Example Implementation:**
```javascript
async function saveKnowledgeBase(aiKnowledge, manualKnowledge) {
  const response = await fetch('/api/v1/profile/knowledge', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ai_knowledge_base: aiKnowledge,
      manual_knowledge: manualKnowledge
    })
  });

  return await response.json();
}

async function loadKnowledgeBase() {
  const response = await fetch('/api/v1/profile/knowledge', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const { data } = await response.json();
  return data;
}
```

---

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad request (invalid data)
- `401` - Unauthorized (missing or invalid token)
- `404` - Profile not found
- `500` - Server error

---

## Database Schema Reference

**business_profiles table:**
```sql
- id (varchar 36) - UUID
- user_id (varchar 36) - Foreign key to users
- business_name (varchar 255) - Business name
- industry (varchar 100) - Industry/sector
- website (varchar 500) - Website URL
- description (text) - Business description
- logo_url (varchar 500) - Logo image URL
- address (text) - Physical address
- phone (varchar 50) - Contact phone
- email (varchar 255) - Contact email
- social_media (longtext) - JSON: social media links
- business_hours (longtext) - JSON: operating hours
- products_services (longtext) - JSON: products/services list
- faq (longtext) - JSON: FAQ items
- ai_knowledge_base (text) - AI-scraped knowledge
- manual_knowledge (text) - Manually added knowledge
- uploaded_files (longtext) - JSON: uploaded file metadata
- last_scraped_at (timestamp) - Last scrape time
- business_type (varchar 50) - Business type/category
- scraping_status (enum) - pending, in_progress, completed, failed
- created_at (timestamp)
- updated_at (timestamp)
```

---

## Best Practices

### 1. Profile Updates
- Only send fields that changed (partial updates)
- Validate URLs before sending
- Keep descriptions concise (2-3 sentences)

### 2. AI Scraping
- Scrape during off-peak hours if possible
- Wait for completion before starting another scrape
- Review AI-scraped data before using it
- Re-scrape when website content changes significantly

### 3. Knowledge Base
- Organize manual knowledge with markdown headers
- Use bullet points for lists
- Keep information up-to-date
- Review and edit AI-scraped content if needed

### 4. Performance
- Cache profile data in frontend (refresh on updates)
- Use debouncing for form auto-save
- Show loading states during scraping
- Implement retry logic for failed requests

---

For more information, see:
- [README.md](../README.md) - Main documentation
- [AI_CONVERSATIONS_TRACKING.md](./AI_CONVERSATIONS_TRACKING.md) - AI tracking
