/**
 * Public API Routes
 * External API for integrations
 */

import { Router } from 'express';
import { publicAPIController } from '../controllers/public-api.controller.js';
import { authenticateAPIKey, requireScope, logAPIRequest } from '../middleware/api-auth.middleware.js';
import { apiRateLimit } from '../middleware/api-rate-limit.middleware.js';

const router = Router();

// Apply API authentication and rate limiting to all routes
router.use(authenticateAPIKey);
router.use(apiRateLimit());
router.use(logAPIRequest());

// ==================== Messaging Endpoints ====================

// Send message
router.post(
  '/messages/send',
  requireScope('messages:send'),
  publicAPIController.sendMessage.bind(publicAPIController)
);

// Get message status
router.get(
  '/messages/:id',
  requireScope('messages:read'),
  publicAPIController.getMessageStatus.bind(publicAPIController)
);

// List messages
router.get(
  '/messages',
  requireScope('messages:read'),
  publicAPIController.listMessages.bind(publicAPIController)
);

// ==================== Device Endpoints ====================

// List devices
router.get(
  '/devices',
  requireScope('devices:read'),
  publicAPIController.listDevices.bind(publicAPIController)
);

// Get device status
router.get(
  '/devices/:id/status',
  requireScope('devices:read'),
  publicAPIController.getDeviceStatus.bind(publicAPIController)
);

// ==================== Contact Endpoints ====================

// List contacts
router.get(
  '/contacts',
  requireScope('contacts:read'),
  publicAPIController.listContacts.bind(publicAPIController)
);

// Get contact
router.get(
  '/contacts/:id',
  requireScope('contacts:read'),
  publicAPIController.getContact.bind(publicAPIController)
);

// Verify contact
router.post(
  '/contacts/verify',
  requireScope('contacts:read'),
  publicAPIController.verifyContact.bind(publicAPIController)
);

// ==================== Webhook Endpoints ====================

// List webhooks
router.get(
  '/webhooks',
  requireScope('webhooks:manage'),
  publicAPIController.listWebhooks.bind(publicAPIController)
);

// Create webhook
router.post(
  '/webhooks',
  requireScope('webhooks:manage'),
  publicAPIController.createWebhook.bind(publicAPIController)
);

// Update webhook
router.put(
  '/webhooks/:id',
  requireScope('webhooks:manage'),
  publicAPIController.updateWebhook.bind(publicAPIController)
);

// Delete webhook
router.delete(
  '/webhooks/:id',
  requireScope('webhooks:manage'),
  publicAPIController.deleteWebhook.bind(publicAPIController)
);

// Test webhook
router.post(
  '/webhooks/:id/test',
  requireScope('webhooks:manage'),
  publicAPIController.testWebhook.bind(publicAPIController)
);

// Get webhook deliveries
router.get(
  '/webhooks/:id/deliveries',
  requireScope('webhooks:manage'),
  publicAPIController.getWebhookDeliveries.bind(publicAPIController)
);

export default router;

