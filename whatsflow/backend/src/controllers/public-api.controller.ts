/**
 * Public API Controller
 * Handles external API requests for integrations
 */

import { Response } from 'express';
import { APIRequest } from '../middleware/api-auth.middleware.js';
import { WhatsAppService } from '../services/whatsapp.service.js';
import { ContactService } from '../services/contact.service.js';
import { DeviceService } from '../services/device.service.js';
import { MessageService } from '../services/message.service.js';
import { apiKeyService } from '../services/api-key.service.js';
import { webhookService } from '../services/webhook.service.js';
import { usageEnforcementService } from '../services/billing/usage-enforcement.service.js';
import { query } from '../config/database.js';
import logger from '../utils/logger.js';

const whatsappService = new WhatsAppService();
const contactService = new ContactService();
const deviceService = new DeviceService();
const messageService = new MessageService();

export class PublicAPIController {
  // ==================== Messaging ====================

  /**
   * Send a message
   * POST /api/public/v1/messages/send
   */
  async sendMessage(req: APIRequest, res: Response) {
    try {
      const { phone_number, message, device_id } = req.body;

      if (!phone_number || !message) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'phone_number and message are required',
        });
      }

      const businessProfileId = req.apiContext!.businessProfileId;
      const userId = req.apiContext!.userId;

      // Check usage limits
      const canSend = await usageEnforcementService.canPerformAction(userId, 'send_message');
      if (!canSend.allowed) {
        return res.status(403).json({
          success: false,
          error: 'Usage limit exceeded',
          message: canSend.reason,
          needsUpgrade: canSend.needsUpgrade,
        });
      }

      // Send message
      const result = await whatsappService.sendMessage(businessProfileId, phone_number, message);

      // Track usage
      await usageEnforcementService.trackUsage(userId, 'send_message', 1);

      // Trigger message.sent webhook
      webhookService.triggerEvent(businessProfileId, 'message.sent', {
        event: 'message.sent',
        timestamp: new Date().toISOString(),
        data: {
          message_id: result.messageId,
          phone_number,
          message,
          status: 'sent',
          timestamp: new Date().toISOString(),
        },
      }).catch((error) => {
        logger.error('Failed to trigger message.sent webhook:', error);
      });

      return res.status(200).json({
        success: true,
        data: {
          message_id: result.messageId,
          phone_number,
          message,
          status: 'sent',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      logger.error('API sendMessage error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to send message',
        message: error.message,
      });
    }
  }

  /**
   * Get message status
   * GET /api/public/v1/messages/:id
   */
  async getMessageStatus(req: APIRequest, res: Response) {
    try {
      const messageId = req.params.id;
      const businessProfileId = req.apiContext!.businessProfileId;

      const messages: any = await query(
        `SELECT 
          m.id, m.contact_id, m.direction, m.message_type,
          m.content, m.media_url, m.status, m.created_at,
          c.phone_number, c.name as contact_name
        FROM messages m
        JOIN contacts c ON c.id = m.contact_id
        WHERE m.id = ? AND m.business_profile_id = ?`,
        [messageId, businessProfileId]
      );

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Message not found',
        });
      }

      const message = messages[0];

      return res.status(200).json({
        success: true,
        data: {
          id: message.id,
          phone_number: message.phone_number,
          contact_name: message.contact_name,
          direction: message.direction,
          message_type: message.message_type,
          content: message.content,
          media_url: message.media_url,
          status: message.status,
          created_at: message.created_at,
        },
      });
    } catch (error: any) {
      logger.error('API getMessageStatus error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get message status',
        message: error.message,
      });
    }
  }

  /**
   * List recent messages
   * GET /api/public/v1/messages
   */
  async listMessages(req: APIRequest, res: Response) {
    try {
      const businessProfileId = req.apiContext!.businessProfileId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const contactId = req.query.contact_id as string;

      const result = await messageService.getMessages(
        businessProfileId,
        contactId,
        page,
        limit
      );

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error: any) {
      logger.error('API listMessages error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to list messages',
        message: error.message,
      });
    }
  }

  // ==================== Devices ====================

  /**
   * List devices
   * GET /api/public/v1/devices
   */
  async listDevices(req: APIRequest, res: Response) {
    try {
      const businessProfileId = req.apiContext!.businessProfileId;

      const devices = await deviceService.getAllDevices(businessProfileId);

      // Remove sensitive data (qr_code)
      const sanitizedDevices = devices.map((device) => ({
        id: device.id,
        device_name: device.device_name,
        phone_number: device.phone_number,
        status: device.status,
        is_primary: device.is_primary,
        last_connected_at: device.last_connected_at,
        created_at: device.created_at,
      }));

      return res.status(200).json({
        success: true,
        data: sanitizedDevices,
      });
    } catch (error: any) {
      logger.error('API listDevices error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to list devices',
        message: error.message,
      });
    }
  }

  /**
   * Get device status
   * GET /api/public/v1/devices/:id/status
   */
  async getDeviceStatus(req: APIRequest, res: Response) {
    try {
      const deviceId = req.params.id;
      const businessProfileId = req.apiContext!.businessProfileId;

      const device = await deviceService.getDeviceById(deviceId, businessProfileId);

      return res.status(200).json({
        success: true,
        data: {
          id: device.id,
          device_name: device.device_name,
          phone_number: device.phone_number,
          status: device.status,
          is_primary: device.is_primary,
          last_connected_at: device.last_connected_at,
        },
      });
    } catch (error: any) {
      logger.error('API getDeviceStatus error:', error);
      return res.status(error.message.includes('not found') ? 404 : 500).json({
        success: false,
        error: 'Failed to get device status',
        message: error.message,
      });
    }
  }

  // ==================== Contacts ====================

  /**
   * List contacts
   * GET /api/public/v1/contacts
   */
  async listContacts(req: APIRequest, res: Response) {
    try {
      const businessProfileId = req.apiContext!.businessProfileId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

      const result = await contactService.getContacts(businessProfileId, page, limit);

      return res.status(200).json({
        success: true,
        data: result.contacts,
        pagination: result.pagination,
      });
    } catch (error: any) {
      logger.error('API listContacts error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to list contacts',
        message: error.message,
      });
    }
  }

  /**
   * Get contact by ID
   * GET /api/public/v1/contacts/:id
   */
  async getContact(req: APIRequest, res: Response) {
    try {
      const contactId = req.params.id;
      const businessProfileId = req.apiContext!.businessProfileId;

      const contact = await contactService.getContactById(contactId, businessProfileId);

      return res.status(200).json({
        success: true,
        data: contact,
      });
    } catch (error: any) {
      logger.error('API getContact error:', error);
      return res.status(error.message.includes('not found') ? 404 : 500).json({
        success: false,
        error: 'Failed to get contact',
        message: error.message,
      });
    }
  }

  /**
   * Verify if number exists on WhatsApp
   * POST /api/public/v1/contacts/verify
   */
  async verifyContact(req: APIRequest, res: Response) {
    try {
      const { phone_number } = req.body;

      if (!phone_number) {
        return res.status(400).json({
          success: false,
          error: 'Missing phone_number',
        });
      }

      // This is a placeholder - actual WhatsApp verification would need to be implemented
      // in the WhatsAppService using baileys' onWhatsApp() method
      return res.status(200).json({
        success: true,
        data: {
          phone_number,
          exists: true, // Would be actual result from WhatsApp
          message: 'Contact verification not yet implemented',
        },
      });
    } catch (error: any) {
      logger.error('API verifyContact error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to verify contact',
        message: error.message,
      });
    }
  }

  // ==================== Webhooks ====================

  /**
   * List webhooks
   * GET /api/public/v1/webhooks
   */
  async listWebhooks(req: APIRequest, res: Response) {
    try {
      const businessProfileId = req.apiContext!.businessProfileId;

      const webhooks = await webhookService.getWebhooks(businessProfileId);

      // Sanitize - don't expose full secret
      const sanitized = webhooks.map((w) => ({
        id: w.id,
        url: w.url,
        events: w.events,
        is_active: w.is_active,
        description: w.description,
        last_triggered_at: w.last_triggered_at,
        success_count: w.success_count,
        failure_count: w.failure_count,
        created_at: w.created_at,
        updated_at: w.updated_at,
      }));

      return res.status(200).json({
        success: true,
        data: sanitized,
      });
    } catch (error: any) {
      logger.error('API listWebhooks error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to list webhooks',
        message: error.message,
      });
    }
  }

  /**
   * Create webhook
   * POST /api/public/v1/webhooks
   */
  async createWebhook(req: APIRequest, res: Response) {
    try {
      const { url, events, description } = req.body;

      if (!url || !events || !Array.isArray(events)) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'url and events (array) are required',
        });
      }

      const businessProfileId = req.apiContext!.businessProfileId;

      const webhook = await webhookService.createWebhook(businessProfileId, {
        url,
        events,
        description,
      });

      return res.status(201).json({
        success: true,
        data: {
          id: webhook.id,
          url: webhook.url,
          secret: webhook.secret, // Show secret once on creation
          events: webhook.events,
          is_active: webhook.is_active,
          description: webhook.description,
          created_at: webhook.created_at,
        },
        message: 'Webhook created successfully. Save the secret - it will not be shown again.',
      });
    } catch (error: any) {
      logger.error('API createWebhook error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create webhook',
        message: error.message,
      });
    }
  }

  /**
   * Update webhook
   * PUT /api/public/v1/webhooks/:id
   */
  async updateWebhook(req: APIRequest, res: Response) {
    try {
      const webhookId = req.params.id;
      const businessProfileId = req.apiContext!.businessProfileId;
      const { url, events, description, is_active } = req.body;

      const webhook = await webhookService.updateWebhook(webhookId, businessProfileId, {
        url,
        events,
        description,
        is_active,
      });

      return res.status(200).json({
        success: true,
        data: {
          id: webhook.id,
          url: webhook.url,
          events: webhook.events,
          is_active: webhook.is_active,
          description: webhook.description,
          updated_at: webhook.updated_at,
        },
      });
    } catch (error: any) {
      logger.error('API updateWebhook error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update webhook',
        message: error.message,
      });
    }
  }

  /**
   * Delete webhook
   * DELETE /api/public/v1/webhooks/:id
   */
  async deleteWebhook(req: APIRequest, res: Response) {
    try {
      const webhookId = req.params.id;
      const businessProfileId = req.apiContext!.businessProfileId;

      await webhookService.deleteWebhook(webhookId, businessProfileId);

      return res.status(200).json({
        success: true,
        message: 'Webhook deleted successfully',
      });
    } catch (error: any) {
      logger.error('API deleteWebhook error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete webhook',
        message: error.message,
      });
    }
  }

  /**
   * Test webhook
   * POST /api/public/v1/webhooks/:id/test
   */
  async testWebhook(req: APIRequest, res: Response) {
    try {
      const webhookId = req.params.id;
      const businessProfileId = req.apiContext!.businessProfileId;

      await webhookService.testWebhook(webhookId, businessProfileId);

      return res.status(200).json({
        success: true,
        message: 'Test webhook queued for delivery',
      });
    } catch (error: any) {
      logger.error('API testWebhook error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to test webhook',
        message: error.message,
      });
    }
  }

  /**
   * Get webhook deliveries
   * GET /api/public/v1/webhooks/:id/deliveries
   */
  async getWebhookDeliveries(req: APIRequest, res: Response) {
    try {
      const webhookId = req.params.id;
      const businessProfileId = req.apiContext!.businessProfileId;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

      const deliveries = await webhookService.getDeliveries(
        webhookId,
        businessProfileId,
        limit
      );

      return res.status(200).json({
        success: true,
        data: deliveries,
      });
    } catch (error: any) {
      logger.error('API getWebhookDeliveries error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get webhook deliveries',
        message: error.message,
      });
    }
  }

  // ==================== API Keys Management ====================

  /**
   * List API keys (for management interface)
   * GET /api/v1/api-keys
   * Note: This uses AuthRequest with JWT, not APIRequest with API key
   */
  async listAPIKeys(req: any, res: Response) {
    try {
      const businessProfileId = req.user?.businessProfileId || req.apiContext?.businessProfileId;
      
      if (!businessProfileId) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const keys = await apiKeyService.getAPIKeys(businessProfileId);

      // Don't expose key_hash
      const sanitized = keys.map((k) => ({
        id: k.id,
        name: k.name,
        scopes: k.scopes,
        environment: k.environment,
        is_active: k.is_active,
        last_used_at: k.last_used_at,
        requests_count: k.requests_count,
        created_at: k.created_at,
      }));

      return res.status(200).json({
        success: true,
        data: sanitized,
      });
    } catch (error: any) {
      logger.error('API listAPIKeys error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to list API keys',
        message: error.message,
      });
    }
  }

  /**
   * Create API key
   * POST /api/v1/api-keys
   * Note: This uses AuthRequest with JWT, not APIRequest with API key
   */
  async createAPIKey(req: any, res: Response) {
    try {
      const { name, scopes, environment } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: name',
        });
      }

      const businessProfileId = req.user?.businessProfileId || req.apiContext?.businessProfileId;
      
      if (!businessProfileId) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const result = await apiKeyService.createAPIKey(businessProfileId, {
        name,
        scopes,
        environment,
      });

      return res.status(201).json({
        success: true,
        data: {
          id: result.apiKey.id,
          name: result.apiKey.name,
          key: result.key, // Only shown once!
          scopes: result.apiKey.scopes,
          environment: result.apiKey.environment,
          created_at: result.apiKey.created_at,
        },
        message: 'API key created successfully. Save the key - it will not be shown again!',
      });
    } catch (error: any) {
      logger.error('API createAPIKey error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create API key',
        message: error.message,
      });
    }
  }

  /**
   * Update API key
   * PUT /api/v1/api-keys/:id
   * Note: This uses AuthRequest with JWT, not APIRequest with API key
   */
  async updateAPIKey(req: any, res: Response) {
    try {
      const apiKeyId = req.params.id;
      const businessProfileId = req.user?.businessProfileId || req.apiContext?.businessProfileId;
      
      if (!businessProfileId) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }
      const { name, scopes, is_active } = req.body;

      const updated = await apiKeyService.updateAPIKey(apiKeyId, businessProfileId, {
        name,
        scopes,
        is_active,
      });

      return res.status(200).json({
        success: true,
        data: {
          id: updated.id,
          name: updated.name,
          scopes: updated.scopes,
          is_active: updated.is_active,
        },
      });
    } catch (error: any) {
      logger.error('API updateAPIKey error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update API key',
        message: error.message,
      });
    }
  }

  /**
   * Delete API key
   * DELETE /api/v1/api-keys/:id
   * Note: This uses AuthRequest with JWT, not APIRequest with API key
   */
  async deleteAPIKey(req: any, res: Response) {
    try {
      const apiKeyId = req.params.id;
      const businessProfileId = req.user?.businessProfileId || req.apiContext?.businessProfileId;
      
      if (!businessProfileId) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      await apiKeyService.deleteAPIKey(apiKeyId, businessProfileId);

      return res.status(200).json({
        success: true,
        message: 'API key deleted successfully',
      });
    } catch (error: any) {
      logger.error('API deleteAPIKey error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete API key',
        message: error.message,
      });
    }
  }

  /**
   * Get API key usage statistics
   * GET /api/v1/api-keys/:id/usage
   * Note: This uses AuthRequest with JWT, not APIRequest with API key
   */
  async getAPIKeyUsage(req: any, res: Response) {
    try {
      const apiKeyId = req.params.id;
      const days = Math.min(parseInt(req.query.days as string) || 7, 30);

      const stats = await apiKeyService.getUsageStats(apiKeyId, days);

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      logger.error('API getAPIKeyUsage error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get API key usage',
        message: error.message,
      });
    }
  }
}

export const publicAPIController = new PublicAPIController();

