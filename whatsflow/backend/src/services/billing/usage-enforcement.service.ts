/**
 * Usage Enforcement Service
 * Enforces subscription limits and manages usage tracking
 */

import { query } from '../../config/database.js';
import { usageService } from './usage.service.js';
import { planService } from './plan.service.js';
import logger from '../../utils/logger.js';

export class UsageEnforcementService {
  /**
   * Check if user can perform action based on subscription limits
   */
  async canPerformAction(
    userId: string,
    action: 'send_message' | 'send_ai_message' | 'add_device' | 'add_contact' | 'send_broadcast'
  ): Promise<{ allowed: boolean; reason?: string; needsUpgrade?: boolean; isPastDue?: boolean }> {
    try {
      // Check if user is a test account (bypass all restrictions)
      const users: any = await query('SELECT is_test_account FROM users WHERE id = ?', [userId]);
      if (users && users[0]?.is_test_account) {
        logger.info(`Test account action allowed: ${userId} - ${action}`);
        return { allowed: true };
      }

      // CRITICAL: Check subscription status FIRST
      const subscriptions: any = await query(
        'SELECT status, is_free FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        [userId]
      );

      if (!subscriptions || subscriptions.length === 0) {
        return { 
          allowed: false, 
          reason: 'No active subscription. Please subscribe to continue using WhatsFlow.',
          needsUpgrade: true 
        };
      }

      const subscription = subscriptions[0];

      // Check if account is free (unlimited, bypass all restrictions)
      if (subscription.is_free) {
        return { allowed: true };
      }

      // CRITICAL: Block ALL actions if subscription is past_due, canceled, expired, or paused
      const blockedStatuses = ['past_due', 'canceled', 'expired', 'paused'];
      if (blockedStatuses.includes(subscription.status)) {
        const statusMessages = {
          past_due: 'Your payment failed. Please update your payment method to continue using WhatsFlow.',
          canceled: 'Your subscription has been canceled. Please reactivate to continue.',
          expired: 'Your subscription has expired. Please renew to continue using WhatsFlow.',
          paused: 'Your account is currently paused. Please contact support to reactivate.',
        };

        logger.warn(`Action blocked for user ${userId} - Subscription status: ${subscription.status}`);
        
        return {
          allowed: false,
          reason: statusMessages[subscription.status as keyof typeof statusMessages],
          needsUpgrade: true,
          isPastDue: subscription.status === 'past_due',
        };
      }

      // Only proceed with usage limit checks if subscription is active or in trial
      const result = await usageService.getUserUsageWithLimits(userId);
      
      if (!result) {
        return { allowed: false, reason: 'Unable to verify subscription limits' };
      }

      const { usage, limits } = result;

      switch (action) {
        case 'send_message':
          if (limits.messages_per_month === -1) return { allowed: true };
          if (usage.messages_sent >= limits.messages_per_month) {
            return {
              allowed: false,
              reason: `You've reached your message limit of ${limits.messages_per_month} messages this month`,
              needsUpgrade: true,
            };
          }
          break;

        case 'send_ai_message':
          if (limits.ai_messages_per_month === -1) return { allowed: true };
          if (usage.ai_messages_count >= limits.ai_messages_per_month) {
            return {
              allowed: false,
              reason: `You've reached your AI message limit of ${limits.ai_messages_per_month} AI messages this month`,
              needsUpgrade: true,
            };
          }
          break;

        case 'add_device':
          if (limits.devices === -1) return { allowed: true };
          if (usage.devices_used >= limits.devices) {
            return {
              allowed: false,
              reason: `You've reached your device limit of ${limits.devices} devices`,
              needsUpgrade: true,
            };
          }
          break;

        case 'add_contact':
          if (limits.contacts === -1) return { allowed: true };
          if (usage.contacts_count >= limits.contacts) {
            return {
              allowed: false,
              reason: `You've reached your contact limit of ${limits.contacts} contacts`,
              needsUpgrade: true,
            };
          }
          break;

        case 'send_broadcast':
          const plans: any = await query(
            `SELECT p.features FROM subscriptions s
             JOIN plans p ON s.plan_id = p.id
             WHERE s.user_id = ?`,
            [userId]
          );
          
          if (!plans || plans.length === 0) {
            return { allowed: false, reason: 'No active subscription' };
          }

          const features = typeof plans[0].features === 'string'
            ? JSON.parse(plans[0].features)
            : plans[0].features;

          if (!features.broadcasts) {
            return {
              allowed: false,
              reason: 'Broadcast campaigns are not available in your plan',
              needsUpgrade: true,
            };
          }
          break;
      }

      return { allowed: true };
    } catch (error) {
      logger.error('Error checking usage limits:', error);
      return { allowed: true }; // Fail open to avoid blocking users on errors
    }
  }

  /**
   * Track usage after action
   */
  async trackUsage(
    userId: string,
    action: 'send_message' | 'send_ai_message' | 'add_device' | 'add_contact' | 'send_broadcast',
    count: number = 1
  ): Promise<void> {
    try {
      switch (action) {
        case 'send_message':
          await usageService.incrementUsage(userId, { messages_sent: count });
          break;
        case 'send_ai_message':
          await usageService.incrementUsage(userId, { ai_messages_count: count });
          break;
        case 'add_device':
          await usageService.incrementUsage(userId, { devices_used: count });
          break;
        case 'add_contact':
          await usageService.incrementUsage(userId, { contacts_count: count });
          break;
        case 'send_broadcast':
          await usageService.incrementUsage(userId, { broadcasts_sent: count });
          break;
      }

      // Check if user is approaching limits (80%)
      await this.checkUsageWarnings(userId);
    } catch (error) {
      logger.error('Error tracking usage:', error);
    }
  }

  /**
   * Check if user is approaching limits and send warnings
   */
  private async checkUsageWarnings(userId: string): Promise<void> {
    try {
      const result = await usageService.getUserUsageWithLimits(userId);
      if (!result) return;

      const { usage, limits } = result;

      // Check messages
      if (limits.messages_per_month > 0) {
        const percentage = (usage.messages_sent / limits.messages_per_month) * 100;
        if (percentage >= 80 && percentage < 90) {
          await this.sendUsageWarning(userId, 'messages', percentage);
        } else if (percentage >= 90 && percentage < 100) {
          await this.sendUsageWarning(userId, 'messages', percentage);
        }
      }

      // Check AI messages
      if (limits.ai_messages_per_month > 0) {
        const percentage = (usage.ai_messages_count / limits.ai_messages_per_month) * 100;
        if (percentage >= 80 && percentage < 90) {
          await this.sendUsageWarning(userId, 'ai_messages', percentage);
        } else if (percentage >= 90 && percentage < 100) {
          await this.sendUsageWarning(userId, 'ai_messages', percentage);
        }
      }
    } catch (error) {
      logger.error('Error checking usage warnings:', error);
    }
  }

  /**
   * Send usage warning notification
   */
  private async sendUsageWarning(
    userId: string,
    resource: string,
    percentage: number
  ): Promise<void> {
    logger.info(`Usage warning: User ${userId} at ${percentage.toFixed(0)}% of ${resource} limit`);
    
    // TODO: Send email notification
    // TODO: Create in-app notification
  }

  /**
   * Calculate overage charges
   */
  async calculateOverageCharges(userId: string): Promise<{
    messages_overage: number;
    ai_messages_overage: number;
    total_overage_cost: number;
  }> {
    const result = await usageService.getUserUsageWithLimits(userId);
    if (!result) {
      return { messages_overage: 0, ai_messages_overage: 0, total_overage_cost: 0 };
    }

    const { usage, limits } = result;

    // Overage rates (from config)
    const MESSAGE_OVERAGE_RATE = 0.01; // $0.01 per message
    const AI_MESSAGE_OVERAGE_RATE = 0.05; // $0.05 per AI message

    const messagesOverage =
      limits.messages_per_month > 0
        ? Math.max(0, usage.messages_sent - limits.messages_per_month)
        : 0;

    const aiMessagesOverage =
      limits.ai_messages_per_month > 0
        ? Math.max(0, usage.ai_messages_count - limits.ai_messages_per_month)
        : 0;

    const totalOverageCost =
      messagesOverage * MESSAGE_OVERAGE_RATE + aiMessagesOverage * AI_MESSAGE_OVERAGE_RATE;

    return {
      messages_overage: messagesOverage,
      ai_messages_overage: aiMessagesOverage,
      total_overage_cost: totalOverageCost,
    };
  }
}

export const usageEnforcementService = new UsageEnforcementService();

