/**
 * Usage Enforcement Middleware
 * Checks if user can perform action based on subscription limits
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import { usageEnforcementService } from '../services/billing/usage-enforcement.service.js';
import logger from '../utils/logger.js';

export type UsageAction =
  | 'send_message'
  | 'send_ai_message'
  | 'add_device'
  | 'add_contact'
  | 'send_broadcast';

/**
 * Middleware to enforce usage limits
 */
export function enforceUsageLimit(action: UsageAction) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const result = await usageEnforcementService.canPerformAction(req.user.userId, action);

      if (!result.allowed) {
        logger.warn(`Usage limit exceeded: User ${req.user.userId}, Action: ${action}`);
        
        return res.status(403).json({
          error: result.reason || 'Usage limit exceeded',
          needsUpgrade: result.needsUpgrade,
          action,
          upgradeUrl: '/billing/plans',
        });
      }

      next();
    } catch (error) {
      logger.error('Error enforcing usage limit:', error);
      next(); // Fail open to avoid blocking users on errors
    }
  };
}

/**
 * Middleware to track usage after successful action
 */
export function trackUsageAfterAction(action: UsageAction, getCount?: (req: AuthRequest) => number) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = function (data: any) {
      // Track usage after successful response
      if (req.user?.userId && res.statusCode < 400) {
        const count = getCount ? getCount(req) : 1;
        usageEnforcementService
          .trackUsage(req.user.userId, action, count)
          .catch((error) => logger.error('Failed to track usage:', error));
      }

      return originalJson(data);
    };

    next();
  };
}

