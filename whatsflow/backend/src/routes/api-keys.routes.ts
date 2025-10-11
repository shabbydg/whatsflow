/**
 * API Keys Management Routes
 * Used by authenticated users to manage their API keys (uses JWT auth, not API key auth)
 */

import { Router } from 'express';
import { publicAPIController } from '../controllers/public-api.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require JWT authentication (not API key)
router.use(authenticate);

// List API keys
router.get('/', publicAPIController.listAPIKeys.bind(publicAPIController));

// Create API key
router.post('/', publicAPIController.createAPIKey.bind(publicAPIController));

// Update API key
router.put('/:id', publicAPIController.updateAPIKey.bind(publicAPIController));

// Delete API key
router.delete('/:id', publicAPIController.deleteAPIKey.bind(publicAPIController));

// Get usage statistics
router.get('/:id/usage', publicAPIController.getAPIKeyUsage.bind(publicAPIController));

export default router;

