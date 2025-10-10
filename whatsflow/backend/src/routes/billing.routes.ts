/**
 * Billing Routes
 * Routes for payment processing and webhooks
 */

import { Router } from 'express';
import { billingController } from '../controllers/billing.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Webhook endpoint (no auth - verified via PayHere signature)
router.post('/webhook', (req, res) => billingController.handleWebhook(req, res));

// Protected routes
router.get('/payments', authenticate, (req, res) => billingController.getPaymentHistory(req, res));
router.get('/payments/:id', authenticate, (req, res) => billingController.getPayment(req, res));

export default router;

