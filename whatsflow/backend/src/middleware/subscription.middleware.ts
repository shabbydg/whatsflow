/**
 * Subscription Middleware
 * Verifies user has active subscription and required plan features
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import { subscriptionService } from '../services/billing/subscription.service.js';
import { usageService } from '../services/billing/usage.service.js';

/**
 * Verify user has active subscription
 */
export async function requireActiveSubscription(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const subscription = await subscriptionService.getUserSubscription(req.user.id);

    if (!subscription) {
      return res.status(403).json({
        error: 'No subscription found',
        requiresUpgrade: true,
      });
    }

    if (!subscriptionService.isActive(subscription)) {
      return res.status(403).json({
        error: 'Subscription is not active',
        status: subscription.status,
        requiresUpgrade: true,
      });
    }

    // Attach subscription to request
    (req as any).subscription = subscription;
    next();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Verify user has specific feature access
 */
export function requireFeature(featureName: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const subData = await subscriptionService.getSubscriptionWithPlan(req.user.id);

      if (!subData) {
        return res.status(403).json({
          error: 'No subscription found',
          requiresUpgrade: true,
        });
      }

      const { plan } = subData;

      if (!plan.features[featureName]) {
        return res.status(403).json({
          error: `Feature '${featureName}' not available in your plan`,
          currentPlan: plan.name,
          requiresUpgrade: true,
        });
      }

      next();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}

/**
 * Check usage limits before action
 */
export function checkUsageLimit(action: 'send_message' | 'send_ai_message' | 'add_device' | 'send_broadcast' | 'scrape_page') {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const check = await usageService.canPerformAction(req.user.id, action);

      if (!check.allowed) {
        return res.status(403).json({
          error: check.reason,
          requiresUpgrade: check.needsUpgrade,
        });
      }

      next();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}

