/**
 * Usage Tracking Service
 * Tracks and enforces usage limits for subscriptions
 */

import { query } from '../../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { planService } from './plan.service.js';
import { subscriptionService } from './subscription.service.js';
import logger from '../../utils/logger.js';

export interface Usage {
  id: string;
  user_id: string;
  subscription_id: string;
  period_start: Date;
  period_end: Date;
  devices_used: number;
  contacts_count: number;
  messages_sent: number;
  messages_received: number;
  ai_messages_count: number;
  broadcasts_sent: number;
  web_scraping_pages: number;
  messages_overage: number;
  ai_messages_overage: number;
  overage_credits_used: number;
  last_reset_at?: Date;
  updated_at: Date;
}

export class UsageService {
  /**
   * Get current usage for user
   */
  async getCurrentUsage(userId: string): Promise<Usage | null> {
    const rows: any = await query(
      `SELECT * FROM usage_tracking 
       WHERE user_id = ? AND period_end >= CURDATE()
       ORDER BY period_start DESC LIMIT 1`,
      [userId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    return rows[0];
  }

  /**
   * Check if user can perform action based on limits
   */
  async canPerformAction(
    userId: string,
    action: 'send_message' | 'send_ai_message' | 'add_device' | 'send_broadcast' | 'scrape_page'
  ): Promise<{ allowed: boolean; reason?: string; needsUpgrade?: boolean }> {
    const subData = await subscriptionService.getSubscriptionWithPlan(userId);
    if (!subData) {
      return { allowed: false, reason: 'No active subscription', needsUpgrade: true };
    }

    const { subscription, plan } = subData;

    // Free accounts have unlimited access
    if (subscription.is_free) {
      return { allowed: true };
    }

    const usage = await this.getCurrentUsage(userId);
    if (!usage) {
      return { allowed: false, reason: 'Usage tracking not initialized' };
    }

    const limits = plan.limits;

    switch (action) {
      case 'send_message':
        if (limits.messages_per_month === -1) return { allowed: true };
        if (usage.messages_sent >= limits.messages_per_month) {
          return {
            allowed: false,
            reason: `Monthly message limit reached (${limits.messages_per_month})`,
            needsUpgrade: true,
          };
        }
        return { allowed: true };

      case 'send_ai_message':
        if (!plan.features.ai_replies) {
          return { allowed: false, reason: 'AI replies not available in your plan', needsUpgrade: true };
        }
        if (limits.ai_messages_per_month === -1) return { allowed: true };
        if (usage.ai_messages_count >= limits.ai_messages_per_month) {
          return {
            allowed: false,
            reason: `Monthly AI message limit reached (${limits.ai_messages_per_month})`,
            needsUpgrade: true,
          };
        }
        return { allowed: true };

      case 'add_device':
        const currentDevices = await this.getActiveDeviceCount(userId);
        if (limits.devices === -1) return { allowed: true };
        if (currentDevices >= limits.devices) {
          return {
            allowed: false,
            reason: `Device limit reached (${limits.devices})`,
            needsUpgrade: true,
          };
        }
        return { allowed: true };

      case 'send_broadcast':
        if (!plan.features.broadcasts) {
          return { allowed: false, reason: 'Broadcasts not available in your plan', needsUpgrade: true };
        }
        if (limits.broadcasts_per_month === -1) return { allowed: true };
        if (usage.broadcasts_sent >= limits.broadcasts_per_month) {
          return {
            allowed: false,
            reason: `Monthly broadcast limit reached (${limits.broadcasts_per_month})`,
            needsUpgrade: true,
          };
        }
        return { allowed: true };

      case 'scrape_page':
        if (!plan.features.web_scraping) {
          return { allowed: false, reason: 'Web scraping not available in your plan', needsUpgrade: true };
        }
        const scrapingLimit = plan.features.web_scraping_pages || -1;
        if (scrapingLimit === -1) return { allowed: true };
        if (usage.web_scraping_pages >= scrapingLimit) {
          return {
            allowed: false,
            reason: `Web scraping page limit reached (${scrapingLimit})`,
            needsUpgrade: true,
          };
        }
        return { allowed: true };

      default:
        return { allowed: false, reason: 'Unknown action' };
    }
  }

  /**
   * Get active device count for user
   */
  private async getActiveDeviceCount(userId: string): Promise<number> {
    const rows: any = await query(
      `SELECT COUNT(*) as count FROM whatsapp_connections wc
       JOIN business_profiles bp ON wc.business_profile_id = bp.id
       WHERE bp.user_id = ? AND wc.status IN ('connected', 'qr_pending')`,
      [userId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return 0;
    }

    return rows[0].count || 0;
  }

  /**
   * Increment usage counter
   */
  async incrementUsage(
    userId: string,
    type: 'message' | 'ai_message' | 'broadcast' | 'scrape_page',
    count: number = 1
  ): Promise<void> {
    const usage = await this.getCurrentUsage(userId);
    if (!usage) {
      logger.warn(`No usage tracking found for user ${userId}`);
      return;
    }

    let field = '';
    switch (type) {
      case 'message':
        field = 'messages_sent';
        break;
      case 'ai_message':
        field = 'ai_messages_count';
        break;
      case 'broadcast':
        field = 'broadcasts_sent';
        break;
      case 'scrape_page':
        field = 'web_scraping_pages';
        break;
      default:
        return;
    }

    await query(
      `UPDATE usage_tracking SET ${field} = ${field} + ? WHERE id = ?`,
      [count, usage.id]
    );
  }

  /**
   * Update contact count
   */
  async updateContactCount(userId: string): Promise<void> {
    const usage = await this.getCurrentUsage(userId);
    if (!usage) return;

    // Get current contact count
    const contactRows: any = await query(
      `SELECT COUNT(*) as count FROM contacts c
       JOIN business_profiles bp ON c.business_profile_id = bp.id
       WHERE bp.user_id = ?`,
      [userId]
    );

    const contactCount = Array.isArray(contactRows) && contactRows.length > 0 
      ? contactRows[0].count 
      : 0;

    await query(
      'UPDATE usage_tracking SET contacts_count = ? WHERE id = ?',
      [contactCount, usage.id]
    );
  }

  /**
   * Reset monthly usage
   */
  async resetMonthlyUsage(userId: string): Promise<void> {
    const subscription = await subscriptionService.getUserSubscription(userId);
    if (!subscription) return;

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Create new usage tracking period
    await query(
      `INSERT INTO usage_tracking (
        id, user_id, subscription_id, period_start, period_end, last_reset_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), userId, subscription.id, now, periodEnd, now]
    );

    logger.info(`Usage reset for user ${userId}`);
  }

  /**
   * Get usage percentage for a specific limit
   */
  async getUsagePercentage(userId: string, limitType: string): Promise<number> {
    const subData = await subscriptionService.getSubscriptionWithPlan(userId);
    if (!subData) return 0;

    const { plan } = subData;
    const usage = await this.getCurrentUsage(userId);
    if (!usage) return 0;

    const limit = plan.limits[limitType];
    if (limit === -1) return 0; // Unlimited

    let current = 0;
    switch (limitType) {
      case 'messages_per_month':
        current = usage.messages_sent;
        break;
      case 'ai_messages_per_month':
        current = usage.ai_messages_count;
        break;
      case 'contacts':
        current = usage.contacts_count;
        break;
      default:
        return 0;
    }

    if (limit === 0) return 100;
    return Math.min(100, (current / limit) * 100);
  }
}

export const usageService = new UsageService();

