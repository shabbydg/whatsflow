/**
 * Subscription Controller
 * Handles subscription-related API requests
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { subscriptionService } from '../services/billing/subscription.service.js';
import { planService } from '../services/billing/plan.service.js';
import { payhereService } from '../services/billing/payhere.service.js';
import { paymentService } from '../services/billing/payment.service.js';
import { usageService } from '../services/billing/usage.service.js';
import { query } from '../config/database.js';

export class SubscriptionController {
  /**
   * Get current user's subscription
   */
  async getSubscription(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const subData = await subscriptionService.getSubscriptionWithPlan(req.user.id);
      
      if (!subData) {
        return res.status(404).json({ error: 'No subscription found' });
      }

      // Get current usage
      const usage = await usageService.getCurrentUsage(req.user.id);

      res.json({
        success: true,
        data: {
          subscription: subData.subscription,
          plan: subData.plan,
          usage,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Start trial subscription
   */
  async startTrial(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const subscription = await subscriptionService.startTrial(req.user.id);

      res.status(201).json({
        success: true,
        data: subscription,
        message: 'Trial subscription started successfully',
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Subscribe to a plan (generate PayHere checkout data)
   */
  async subscribe(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { plan_id, billing_cycle } = req.body;

      if (!plan_id || !billing_cycle) {
        return res.status(400).json({ error: 'Missing plan_id or billing_cycle' });
      }

      if (!['monthly', 'annual'].includes(billing_cycle)) {
        return res.status(400).json({ error: 'Invalid billing cycle' });
      }

      // Get plan
      const plan = await planService.getPlanById(plan_id);
      if (!plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      // Get user details
      const userRows: any = await query(
        'SELECT id, email, full_name FROM users WHERE id = ?',
        [req.user.id]
      );

      if (!Array.isArray(userRows) || userRows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userRows[0];

      // Generate PayHere checkout data
      const checkoutData = await payhereService.createSubscriptionCheckout(
        user,
        plan,
        billing_cycle
      );

      // Create pending payment record
      const price = billing_cycle === 'annual' ? plan.price_annual : plan.price_monthly;
      
      // Get or create subscription
      let subscription = await subscriptionService.getUserSubscription(req.user.id);
      if (!subscription) {
        // Create initial subscription record (will be activated on successful payment)
        subscription = await subscriptionService.createSubscription(
          req.user.id,
          plan_id,
          billing_cycle,
          { order_id: checkoutData.order_id }
        );
      }

      await paymentService.createPayment({
        subscription_id: subscription.id,
        user_id: req.user.id,
        amount: price,
        currency: plan.currency,
        payment_type: 'subscription',
        description: `${plan.name} - ${billing_cycle} subscription`,
        payhere_order_id: checkoutData.order_id,
      });

      res.json({
        success: true,
        data: {
          checkout: checkoutData,
          subscription,
        },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Cancel subscription
   */
  async cancel(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { immediately } = req.body;

      const subscription = await subscriptionService.cancelSubscription(
        req.user.id,
        immediately === true
      );

      res.json({
        success: true,
        data: subscription,
        message: immediately 
          ? 'Subscription canceled immediately' 
          : 'Subscription will be canceled at end of period',
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Reactivate subscription
   */
  async reactivate(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const subscription = await subscriptionService.reactivateSubscription(req.user.id);

      res.json({
        success: true,
        data: subscription,
        message: 'Subscription reactivated successfully',
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get usage stats
   */
  async getUsage(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const usage = await usageService.getCurrentUsage(req.user.id);

      if (!usage) {
        return res.status(404).json({ error: 'Usage data not found' });
      }

      // Get usage percentages
      const messagePercentage = await usageService.getUsagePercentage(req.user.id, 'messages_per_month');
      const aiMessagePercentage = await usageService.getUsagePercentage(req.user.id, 'ai_messages_per_month');

      res.json({
        success: true,
        data: {
          usage,
          percentages: {
            messages: messagePercentage,
            ai_messages: aiMessagePercentage,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const subscriptionController = new SubscriptionController();

