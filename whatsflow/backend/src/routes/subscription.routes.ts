/**
 * Subscription Routes
 * Routes for managing user subscriptions
 */

import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.get('/', authenticate, (req, res) => subscriptionController.getSubscription(req, res));
router.post('/trial', authenticate, (req, res) => subscriptionController.startTrial(req, res));
router.post('/subscribe', authenticate, (req, res) => subscriptionController.subscribe(req, res));
router.post('/cancel', authenticate, (req, res) => subscriptionController.cancel(req, res));
router.post('/reactivate', authenticate, (req, res) => subscriptionController.reactivate(req, res));
router.get('/usage', authenticate, (req, res) => subscriptionController.getUsage(req, res));

export default router;

