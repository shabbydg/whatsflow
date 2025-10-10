/**
 * Plan Routes
 * Public routes for viewing subscription plans
 */

import { Router } from 'express';
import { planController } from '../controllers/plan.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', (req, res) => planController.getPlans(req, res));
router.get('/:id', (req, res) => planController.getPlan(req, res));

// Admin routes (will add admin auth middleware later)
router.post('/', authenticate, (req, res) => planController.createPlan(req, res));
router.put('/:id', authenticate, (req, res) => planController.updatePlan(req, res));

export default router;

