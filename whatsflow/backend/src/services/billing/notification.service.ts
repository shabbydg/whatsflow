/**
 * Billing Notification Service
 * Sends automated billing-related email notifications
 */

import { emailService } from '../email.service.js';
import { emailTemplates } from './email-templates.js';
import { query } from '../../config/database.js';
import logger from '../../utils/logger.js';

export class BillingNotificationService {
  /**
   * Send trial started email
   */
  async sendTrialStartedEmail(userId: string): Promise<void> {
    try {
      const users: any = await query('SELECT email, full_name FROM users WHERE id = ?', [userId]);
      if (!Array.isArray(users) || users.length === 0) return;

      const user = users[0];
      
      const subscriptions: any = await query(
        'SELECT trial_ends_at FROM subscriptions WHERE user_id = ?',
        [userId]
      );
      
      if (!Array.isArray(subscriptions) || subscriptions.length === 0) return;

      const trialEndsAt = new Date(subscriptions[0].trial_ends_at);
      const template = emailTemplates.trialStarted(user.full_name, trialEndsAt);

      await emailService.sendEmail(user.email, template.subject, template.html);
      logger.info(`Trial started email sent to ${user.email}`);
    } catch (error) {
      logger.error('Error sending trial started email:', error);
    }
  }

  /**
   * Send trial ending soon email
   */
  async sendTrialEndingSoonEmail(userId: string, daysRemaining: number): Promise<void> {
    try {
      const users: any = await query('SELECT email, full_name FROM users WHERE id = ?', [userId]);
      if (!Array.isArray(users) || users.length === 0) return;

      const user = users[0];
      
      const subscriptions: any = await query(
        'SELECT trial_ends_at FROM subscriptions WHERE user_id = ?',
        [userId]
      );
      
      if (!Array.isArray(subscriptions) || subscriptions.length === 0) return;

      const trialEndsAt = new Date(subscriptions[0].trial_ends_at);
      const template = emailTemplates.trialEndingSoon(user.full_name, trialEndsAt, daysRemaining);

      await emailService.sendEmail(user.email, template.subject, template.html);
      logger.info(`Trial ending email sent to ${user.email}`);
    } catch (error) {
      logger.error('Error sending trial ending email:', error);
    }
  }

  /**
   * Send subscription activated email
   */
  async sendSubscriptionActivatedEmail(userId: string): Promise<void> {
    try {
      const result: any = await query(
        `SELECT 
          u.email, u.full_name,
          p.name as plan_name,
          s.current_price, s.billing_cycle, s.next_billing_date
        FROM users u
        JOIN subscriptions s ON u.id = s.user_id
        JOIN plans p ON s.plan_id = p.id
        WHERE u.id = ?`,
        [userId]
      );

      if (!Array.isArray(result) || result.length === 0) return;

      const data = result[0];
      const template = emailTemplates.subscriptionActivated(
        data.full_name,
        data.plan_name,
        data.current_price,
        data.billing_cycle,
        new Date(data.next_billing_date)
      );

      await emailService.sendEmail(data.email, template.subject, template.html);
      logger.info(`Subscription activated email sent to ${data.email}`);
    } catch (error) {
      logger.error('Error sending subscription activated email:', error);
    }
  }

  /**
   * Send payment failed email
   */
  async sendPaymentFailedEmail(userId: string, amount: number, reason?: string): Promise<void> {
    try {
      const users: any = await query('SELECT email, full_name FROM users WHERE id = ?', [userId]);
      if (!Array.isArray(users) || users.length === 0) return;

      const user = users[0];
      const template = emailTemplates.paymentFailed(user.full_name, amount, reason);

      await emailService.sendEmail(user.email, template.subject, template.html);
      logger.info(`Payment failed email sent to ${user.email}`);
    } catch (error) {
      logger.error('Error sending payment failed email:', error);
    }
  }

  /**
   * Send usage warning email
   */
  async sendUsageWarningEmail(
    userId: string,
    resource: string,
    percentage: number,
    current: number,
    limit: number
  ): Promise<void> {
    try {
      const users: any = await query('SELECT email, full_name FROM users WHERE id = ?', [userId]);
      if (!Array.isArray(users) || users.length === 0) return;

      const user = users[0];
      const template = emailTemplates.usageWarning(user.full_name, resource, percentage, current, limit);

      await emailService.sendEmail(user.email, template.subject, template.html);
      logger.info(`Usage warning email sent to ${user.email} for ${resource}`);
    } catch (error) {
      logger.error('Error sending usage warning email:', error);
    }
  }

  /**
   * Send invoice email
   */
  async sendInvoiceEmail(userId: string, invoiceNumber: string, amount: number): Promise<void> {
    try {
      const users: any = await query('SELECT email, full_name FROM users WHERE id = ?', [userId]);
      if (!Array.isArray(users) || users.length === 0) return;

      const user = users[0];
      const downloadUrl = `${process.env.FRONTEND_URL}/api/v1/billing/invoices/${invoiceNumber}.pdf`;
      const template = emailTemplates.invoice(user.full_name, invoiceNumber, amount, new Date(), downloadUrl);

      await emailService.sendEmail(user.email, template.subject, template.html);
      logger.info(`Invoice email sent to ${user.email}`);
    } catch (error) {
      logger.error('Error sending invoice email:', error);
    }
  }

  /**
   * Send subscription canceled email
   */
  async sendSubscriptionCanceledEmail(userId: string, planName: string, accessUntil?: Date): Promise<void> {
    try {
      const users: any = await query('SELECT email, full_name FROM users WHERE id = ?', [userId]);
      if (!Array.isArray(users) || users.length === 0) return;

      const user = users[0];
      const template = emailTemplates.subscriptionCanceled(user.full_name, planName, accessUntil);

      await emailService.sendEmail(user.email, template.subject, template.html);
      logger.info(`Subscription canceled email sent to ${user.email}`);
    } catch (error) {
      logger.error('Error sending subscription canceled email:', error);
    }
  }

  /**
   * Check for trials ending soon and send notifications
   */
  async sendTrialExpirationReminders(): Promise<void> {
    try {
      // Find trials ending in 2 days
      const trials: any = await query(
        `SELECT user_id, trial_ends_at
         FROM subscriptions
         WHERE status = 'trial'
         AND trial_ends_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 3 DAY)
         AND trial_ends_at > DATE_ADD(NOW(), INTERVAL 1 DAY)`
      );

      if (!Array.isArray(trials)) return;

      for (const trial of trials) {
        const now = new Date();
        const trialEnd = new Date(trial.trial_ends_at);
        const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        await this.sendTrialEndingSoonEmail(trial.user_id, daysRemaining);
      }
    } catch (error) {
      logger.error('Error sending trial expiration reminders:', error);
    }
  }
}

export const billingNotificationService = new BillingNotificationService();

