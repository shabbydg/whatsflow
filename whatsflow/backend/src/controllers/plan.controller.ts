/**
 * Plan Controller
 * Handles plan-related API requests
 */

import { Request, Response } from 'express';
import { planService } from '../services/billing/plan.service.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export class PlanController {
  /**
   * Get all active plans
   */
  async getPlans(req: Request, res: Response) {
    try {
      const plans = await planService.getActivePlans();

      res.json({
        success: true,
        data: plans,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get plan by ID
   */
  async getPlan(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const plan = await planService.getPlanById(id);

      if (!plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      res.json({
        success: true,
        data: plan,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create plan (admin only)
   */
  async createPlan(req: AuthRequest, res: Response) {
    try {
      const { name, slug, description, price_monthly, price_annual, features, limits, display_order } = req.body;

      if (!name || !slug || price_monthly === undefined || price_annual === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (!features || !limits) {
        return res.status(400).json({ error: 'Features and limits are required' });
      }

      const plan = await planService.createPlan({
        name,
        slug,
        description,
        price_monthly,
        price_annual,
        features,
        limits,
        display_order,
      });

      res.status(201).json({
        success: true,
        data: plan,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Update plan (admin only)
   */
  async updatePlan(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const plan = await planService.updatePlan(id, updates);

      res.json({
        success: true,
        data: plan,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const planController = new PlanController();

