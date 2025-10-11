/**
 * Subscription Service
 * Manages user subscriptions and billing cycles
 */

import { query } from '../../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { planService, Plan } from './plan.service.js';
import logger from '../../utils/logger.js';

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'trial' | 'active' | 'past_due' | 'canceled' | 'paused' | 'expired';
  billing_cycle: 'monthly' | 'annual';
  payhere_subscription_id?: string;
  payhere_order_id?: string;
  payhere_payment_id?: string;
  current_price: number;
  currency: string;
  trial_ends_at?: Date;
  current_period_start?: Date;
  current_period_end?: Date;
  next_billing_date?: Date;
  cancel_at_period_end: boolean;
  canceled_at?: Date;
  is_free: boolean;
  free_reason?: string;
  created_at: Date;
  updated_at: Date;
}

export class SubscriptionService {
  /**
   * Parse subscription row to ensure numeric fields are numbers
   */
  private parseSubscriptionRow(row: any): Subscription {
    return {
      ...row,
      current_price: (() => {
        const price = parseFloat(row.current_price);
        return isNaN(price) ? 0 : price;
      })(),
      cancel_at_period_end: row.cancel_at_period_end ?? false,
      is_free: row.is_free ?? false,
    };
  }

  /**
   * Get user's current subscription
   */
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    const rows: any = await query(
      'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    return this.parseSubscriptionRow(rows[0]);
  }

  /**
   * Get subscription with plan details
   */
  async getSubscriptionWithPlan(userId: string): Promise<{
    subscription: Subscription;
    plan: Plan;
  } | null> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      return null;
    }

    const plan = await planService.getPlanById(subscription.plan_id);
    if (!plan) {
      throw new Error('Plan not found for subscription');
    }

    return { subscription, plan };
  }

  /**
   * Start trial subscription for new user
   */
  async startTrial(userId: string): Promise<Subscription> {
    // Check if user already used trial
    const userRows: any = await query(
      'SELECT trial_used FROM users WHERE id = ?',
      [userId]
    );

    if (Array.isArray(userRows) && userRows.length > 0 && userRows[0].trial_used) {
      throw new Error('Trial already used');
    }

    // Get trial plan
    const trialPlan = await planService.getTrialPlan();

    // Calculate trial end date
    const now = new Date();
    const trialEndDate = new Date(now);
    trialEndDate.setDate(trialEndDate.getDate() + (trialPlan.limits.trial_days || 7));

    const subscriptionId = uuidv4();

    // Create trial subscription
    await query(
      `INSERT INTO subscriptions (
        id, user_id, plan_id, status, billing_cycle, current_price, currency,
        trial_ends_at, current_period_start, current_period_end
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        subscriptionId,
        userId,
        trialPlan.id,
        'trial',
        'monthly',
        0,
        trialPlan.currency,
        trialEndDate,
        now,
        trialEndDate,
      ]
    );

    // Mark trial as used
    await query(
      'UPDATE users SET trial_used = true, trial_started_at = ? WHERE id = ?',
      [now, userId]
    );

    // Initialize usage tracking
    await this.initializeUsageTracking(userId, subscriptionId);

    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      throw new Error('Failed to create subscription');
    }

    logger.info(`Trial subscription created for user ${userId}`);
    return subscription;
  }

  /**
   * Initialize usage tracking for a subscription
   */
  private async initializeUsageTracking(userId: string, subscriptionId: string): Promise<void> {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await query(
      `INSERT INTO usage_tracking (
        id, user_id, subscription_id, period_start, period_end, last_reset_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), userId, subscriptionId, now, periodEnd, now]
    );
  }

  /**
   * Create paid subscription
   */
  async createSubscription(
    userId: string,
    planId: string,
    billingCycle: 'monthly' | 'annual',
    payhereData?: {
      subscription_id?: string;
      order_id?: string;
      payment_id?: string;
    }
  ): Promise<Subscription> {
    const plan = await planService.getPlanById(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const price = billingCycle === 'annual' ? plan.price_annual : plan.price_monthly;
    const now = new Date();
    const periodEnd = new Date(now);
    
    if (billingCycle === 'annual') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    const subscriptionId = uuidv4();

    await query(
      `INSERT INTO subscriptions (
        id, user_id, plan_id, status, billing_cycle, current_price, currency,
        payhere_subscription_id, payhere_order_id, payhere_payment_id,
        current_period_start, current_period_end, next_billing_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        subscriptionId,
        userId,
        planId,
        'active',
        billingCycle,
        price,
        plan.currency,
        payhereData?.subscription_id || null,
        payhereData?.order_id || null,
        payhereData?.payment_id || null,
        now,
        periodEnd,
        periodEnd,
      ]
    );

    // Initialize usage tracking
    await this.initializeUsageTracking(userId, subscriptionId);

    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      throw new Error('Failed to create subscription');
    }

    logger.info(`Subscription created for user ${userId} - Plan: ${plan.name}, Cycle: ${billingCycle}`);
    return subscription;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string, cancelImmediately: boolean = false): Promise<Subscription> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      throw new Error('No active subscription found');
    }

    if (cancelImmediately) {
      await query(
        `UPDATE subscriptions SET status = ?, cancel_at_period_end = ?, canceled_at = ? WHERE id = ?`,
        ['canceled', false, new Date(), subscription.id]
      );
    } else {
      await query(
        `UPDATE subscriptions SET cancel_at_period_end = ? WHERE id = ?`,
        [true, subscription.id]
      );
    }

    const updated = await this.getUserSubscription(userId);
    if (!updated) {
      throw new Error('Failed to update subscription');
    }

    logger.info(`Subscription canceled for user ${userId} - Immediate: ${cancelImmediately}`);
    return updated;
  }

  /**
   * Reactivate canceled subscription
   */
  async reactivateSubscription(userId: string): Promise<Subscription> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      throw new Error('No subscription found');
    }

    if (subscription.status !== 'canceled' && !subscription.cancel_at_period_end) {
      throw new Error('Subscription is not canceled');
    }

    await query(
      `UPDATE subscriptions SET status = ?, cancel_at_period_end = ?, canceled_at = NULL WHERE id = ?`,
      ['active', false, subscription.id]
    );

    const updated = await this.getUserSubscription(userId);
    if (!updated) {
      throw new Error('Failed to update subscription');
    }

    logger.info(`Subscription reactivated for user ${userId}`);
    return updated;
  }

  /**
   * Admin: Make account free
   */
  async makeAccountFree(userId: string, reason: string): Promise<Subscription> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      throw new Error('No subscription found');
    }

    await query(
      `UPDATE subscriptions SET is_free = ?, free_reason = ? WHERE id = ?`,
      [true, reason, subscription.id]
    );

    const updated = await this.getUserSubscription(userId);
    if (!updated) {
      throw new Error('Failed to update subscription');
    }

    logger.info(`Account made free for user ${userId} - Reason: ${reason}`);
    return updated;
  }

  /**
   * Admin: Remove free account status
   */
  async removeFreeStatus(userId: string): Promise<Subscription> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      throw new Error('No subscription found');
    }

    await query(
      `UPDATE subscriptions SET is_free = ?, free_reason = NULL WHERE id = ?`,
      [false, subscription.id]
    );

    const updated = await this.getUserSubscription(userId);
    if (!updated) {
      throw new Error('Failed to update subscription');
    }

    logger.info(`Free status removed for user ${userId}`);
    return updated;
  }

  /**
   * Check if subscription is active
   */
  isActive(subscription: Subscription | null): boolean {
    if (!subscription) return false;
    if (subscription.is_free) return true;
    return ['trial', 'active'].includes(subscription.status);
  }

  /**
   * Check if subscription is in trial
   */
  isTrial(subscription: Subscription | null): boolean {
    return subscription?.status === 'trial';
  }

  /**
   * Get days remaining in trial
   */
  getTrialDaysRemaining(subscription: Subscription): number {
    if (!subscription.trial_ends_at) return 0;
    
    const now = new Date();
    const trialEnd = new Date(subscription.trial_ends_at);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }
}

export const subscriptionService = new SubscriptionService();

