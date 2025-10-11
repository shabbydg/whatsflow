/**
 * WhatsFlow API SDK for Node.js
 * 
 * Simple JavaScript/TypeScript SDK for integrating with WhatsFlow API
 * 
 * Installation:
 *   npm install axios
 * 
 * Usage:
 *   const WhatsFlowAPI = require('./whatsflow-sdk');
 *   const api = new WhatsFlowAPI('wf_live_your_api_key');
 *   await api.sendMessage('+94771234567', 'Hello!');
 */

const axios = require('axios');

class WhatsFlowAPI {
  /**
   * Initialize WhatsFlow API client
   * @param {string} apiKey - Your WhatsFlow API key (wf_live_xxx or wf_test_xxx)
   * @param {string} baseUrl - API base URL (default: http://localhost:2152/api/public/v1)
   */
  constructor(apiKey, baseUrl = 'http://localhost:2152/api/public/v1') {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    if (!apiKey.startsWith('wf_live_') && !apiKey.startsWith('wf_test_')) {
      throw new Error('Invalid API key format. Must start with wf_live_ or wf_test_');
    }

    this.apiKey = apiKey;
    this.baseUrl = baseUrl;

    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for rate limiting
    this.client.interceptors.response.use(
      (response) => {
        // Log rate limit info
        const limit = response.headers['x-ratelimit-limit'];
        const remaining = response.headers['x-ratelimit-remaining'];
        const reset = response.headers['x-ratelimit-reset'];

        if (remaining && parseInt(remaining) < 10) {
          console.warn(`⚠️  Low rate limit: ${remaining}/${limit} remaining`);
        }

        return response;
      },
      async (error) => {
        // Handle rate limiting
        if (error.response?.status === 429) {
          const retryAfter = error.response.data.retryAfter || 60;
          console.warn(`⏱️  Rate limited. Retrying after ${retryAfter} seconds...`);
          
          // Optional: Auto-retry after delay
          // await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          // return this.client.request(error.config);
        }

        throw error;
      }
    );
  }

  // ==================== Messaging ====================

  /**
   * Send a WhatsApp message
   * @param {string} phoneNumber - Recipient phone number with country code
   * @param {string} message - Message text to send
   * @returns {Promise<Object>} Message details with message_id
   */
  async sendMessage(phoneNumber, message) {
    try {
      const response = await this.client.post('/messages/send', {
        phone_number: phoneNumber,
        message: message,
      });

      return response.data.data;
    } catch (error) {
      this.handleError('sendMessage', error);
    }
  }

  /**
   * Get message status
   * @param {string} messageId - Message ID returned from sendMessage
   * @returns {Promise<Object>} Message details and status
   */
  async getMessageStatus(messageId) {
    try {
      const response = await this.client.get(`/messages/${messageId}`);
      return response.data.data;
    } catch (error) {
      this.handleError('getMessageStatus', error);
    }
  }

  /**
   * List messages with pagination
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 50, max: 100)
   * @param {string} options.contactId - Filter by contact ID
   * @returns {Promise<Object>} Messages array and pagination info
   */
  async listMessages(options = {}) {
    try {
      const response = await this.client.get('/messages', { params: options });
      return response.data;
    } catch (error) {
      this.handleError('listMessages', error);
    }
  }

  // ==================== Devices ====================

  /**
   * List all connected devices
   * @returns {Promise<Array>} Array of device objects
   */
  async listDevices() {
    try {
      const response = await this.client.get('/devices');
      return response.data.data;
    } catch (error) {
      this.handleError('listDevices', error);
    }
  }

  /**
   * Get device status
   * @param {string} deviceId - Device ID
   * @returns {Promise<Object>} Device status information
   */
  async getDeviceStatus(deviceId) {
    try {
      const response = await this.client.get(`/devices/${deviceId}/status`);
      return response.data.data;
    } catch (error) {
      this.handleError('getDeviceStatus', error);
    }
  }

  // ==================== Contacts ====================

  /**
   * List contacts with pagination
   * @param {Object} options - Query options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @returns {Promise<Object>} Contacts array and pagination info
   */
  async listContacts(options = {}) {
    try {
      const response = await this.client.get('/contacts', { params: options });
      return response.data;
    } catch (error) {
      this.handleError('listContacts', error);
    }
  }

  /**
   * Get contact details
   * @param {string} contactId - Contact ID
   * @returns {Promise<Object>} Contact details
   */
  async getContact(contactId) {
    try {
      const response = await this.client.get(`/contacts/${contactId}`);
      return response.data.data;
    } catch (error) {
      this.handleError('getContact', error);
    }
  }

  /**
   * Verify if phone number exists on WhatsApp
   * @param {string} phoneNumber - Phone number to verify
   * @returns {Promise<Object>} Verification result
   */
  async verifyContact(phoneNumber) {
    try {
      const response = await this.client.post('/contacts/verify', {
        phone_number: phoneNumber,
      });
      return response.data.data;
    } catch (error) {
      this.handleError('verifyContact', error);
    }
  }

  // ==================== Webhooks ====================

  /**
   * List all webhooks
   * @returns {Promise<Array>} Array of webhook configurations
   */
  async listWebhooks() {
    try {
      const response = await this.client.get('/webhooks');
      return response.data.data;
    } catch (error) {
      this.handleError('listWebhooks', error);
    }
  }

  /**
   * Create a new webhook
   * @param {string} url - Webhook endpoint URL
   * @param {Array<string>} events - Events to subscribe to
   * @param {string} description - Optional description
   * @returns {Promise<Object>} Webhook details including secret (shown once)
   */
  async createWebhook(url, events, description = '') {
    try {
      const response = await this.client.post('/webhooks', {
        url,
        events,
        description,
      });

      console.log('⚠️  Save this webhook secret:', response.data.data.secret);
      return response.data.data;
    } catch (error) {
      this.handleError('createWebhook', error);
    }
  }

  /**
   * Update webhook configuration
   * @param {string} webhookId - Webhook ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated webhook details
   */
  async updateWebhook(webhookId, updates) {
    try {
      const response = await this.client.put(`/webhooks/${webhookId}`, updates);
      return response.data.data;
    } catch (error) {
      this.handleError('updateWebhook', error);
    }
  }

  /**
   * Delete a webhook
   * @param {string} webhookId - Webhook ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteWebhook(webhookId) {
    try {
      const response = await this.client.delete(`/webhooks/${webhookId}`);
      return response.data;
    } catch (error) {
      this.handleError('deleteWebhook', error);
    }
  }

  /**
   * Test webhook delivery
   * @param {string} webhookId - Webhook ID
   * @returns {Promise<Object>} Test confirmation
   */
  async testWebhook(webhookId) {
    try {
      const response = await this.client.post(`/webhooks/${webhookId}/test`);
      return response.data;
    } catch (error) {
      this.handleError('testWebhook', error);
    }
  }

  /**
   * Get webhook delivery logs
   * @param {string} webhookId - Webhook ID
   * @param {number} limit - Number of deliveries to retrieve
   * @returns {Promise<Array>} Delivery logs
   */
  async getWebhookDeliveries(webhookId, limit = 50) {
    try {
      const response = await this.client.get(`/webhooks/${webhookId}/deliveries`, {
        params: { limit },
      });
      return response.data.data;
    } catch (error) {
      this.handleError('getWebhookDeliveries', error);
    }
  }

  // ==================== Utilities ====================

  /**
   * Handle API errors
   * @private
   */
  handleError(method, error) {
    if (error.response) {
      // API returned error response
      const { status, data } = error.response;

      if (status === 401) {
        throw new Error(`Authentication failed: ${data.message || 'Invalid API key'}`);
      } else if (status === 403) {
        throw new Error(`Permission denied: ${data.message || 'Insufficient scope or quota exceeded'}`);
      } else if (status === 429) {
        throw new Error(`Rate limit exceeded: ${data.message}. Retry after ${data.retryAfter}s`);
      } else {
        throw new Error(`API error (${status}): ${data.message || data.error}`);
      }
    } else if (error.request) {
      // Request made but no response
      throw new Error(`Network error: No response from server`);
    } else {
      // Other error
      throw new Error(`Error in ${method}: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature (for webhook endpoints)
   * @param {Object} payload - Webhook payload
   * @param {string} signature - X-Webhook-Signature header value
   * @param {string} secret - Webhook secret
   * @returns {boolean} True if signature is valid
   */
  static verifyWebhookSignature(payload, signature, secret) {
    const crypto = require('crypto');
    
    const expected = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    const expectedSignature = `sha256=${expected}`;

    // Use timing-safe comparison
    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch {
      return false;
    }
  }
}

// Export for use in other files
module.exports = WhatsFlowAPI;

// Example usage (uncomment to test)
/*
async function example() {
  const api = new WhatsFlowAPI('wf_live_your_key');

  // Send message
  const result = await api.sendMessage('+94771234567', 'Hello from SDK!');
  console.log('Message sent:', result.message_id);

  // List devices
  const devices = await api.listDevices();
  console.log('Connected devices:', devices.filter(d => d.status === 'connected'));

  // List contacts
  const { contacts, pagination } = await api.listContacts({ page: 1, limit: 10 });
  console.log(`Found ${pagination.total} contacts`);
}

example().catch(console.error);
*/

