/**
 * Payment Service
 * Handles payment processing and tracking
 */

import { query } from '../../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { verifyPayHereNotification, parsePayHereStatus } from '../../utils/payhere-hash.js';
import { billingConfig } from '../../config/billing.js';
import { subscriptionService } from './subscription.service.js';
import logger from '../../utils/logger.js';

export interface Payment {
  id: string;
  subscription_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'processing';
  payment_type: 'subscription' | 'addon' | 'overage' | 'credit_purchase' | 'one_time';
  description?: string;
  payhere_order_id?: string;
  payhere_payment_id?: string;
  payhere_method?: string;
  payhere_status_code?: string;
  invoice_number?: string;
  invoice_url?: string;
  attempted_at?: Date;
  paid_at?: Date;
  created_at: Date;
}

export class PaymentService {
  /**
   * Create payment record
   */
  async createPayment(data: {
    subscription_id: string;
    user_id: string;
    amount: number;
    currency?: string;
    payment_type?: string;
    description?: string;
    payhere_order_id?: string;
  }): Promise<Payment> {
    const paymentId = uuidv4();

    await query(
      `INSERT INTO payments (
        id, subscription_id, user_id, amount, currency, payment_type,
        description, payhere_order_id, status, attempted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        paymentId,
        data.subscription_id,
        data.user_id,
        data.amount,
        data.currency || 'USD',
        data.payment_type || 'subscription',
        data.description || null,
        data.payhere_order_id || null,
        'pending',
        new Date(),
      ]
    );

    const payment = await this.getPaymentById(paymentId);
    if (!payment) {
      throw new Error('Failed to create payment');
    }

    return payment;
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string): Promise<Payment | null> {
    const rows: any = await query(
      'SELECT * FROM payments WHERE id = ?',
      [paymentId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    return rows[0];
  }

  /**
   * Get payment by PayHere order ID
   */
  async getPaymentByOrderId(orderId: string): Promise<Payment | null> {
    const rows: any = await query(
      'SELECT * FROM payments WHERE payhere_order_id = ?',
      [orderId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    return rows[0];
  }

  /**
   * Get user's payment history
   */
  async getUserPayments(userId: string, limit: number = 50): Promise<Payment[]> {
    const rows: any = await query(
      'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit]
    );

    if (!Array.isArray(rows)) {
      return [];
    }

    return rows;
  }

  /**
   * Process PayHere webhook notification
   */
  async processWebhookNotification(notification: any): Promise<void> {
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      status_message,
      method,
      card_holder_name,
      card_no,
    } = notification;

    // Verify notification authenticity
    const isValid = verifyPayHereNotification(
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      billingConfig.payhere.merchantSecret
    );

    if (!isValid) {
      logger.error(`Invalid PayHere notification signature for order ${order_id}`);
      throw new Error('Invalid notification signature');
    }

    // Find payment record
    const payment = await this.getPaymentByOrderId(order_id);
    if (!payment) {
      logger.error(`Payment not found for order ${order_id}`);
      throw new Error('Payment not found');
    }

    // Parse status
    const { status, message } = parsePayHereStatus(status_code);

    // Update payment record
    await query(
      `UPDATE payments SET 
        status = ?, 
        payhere_payment_id = ?,
        payhere_method = ?,
        payhere_status_code = ?,
        payhere_md5sig = ?,
        payhere_status_message = ?,
        payhere_card_holder = ?,
        payhere_card_no = ?,
        paid_at = ?
      WHERE id = ?`,
      [
        status,
        payment_id,
        method,
        status_code,
        md5sig,
        status_message,
        card_holder_name,
        card_no,
        status === 'succeeded' ? new Date() : null,
        payment.id,
      ]
    );

    logger.info(`Payment ${payment.id} updated - Status: ${status}, Order: ${order_id}`);

    // Handle based on status
    if (status === 'succeeded') {
      await this.handleSuccessfulPayment(payment);
    } else if (status === 'failed') {
      await this.handleFailedPayment(payment, message);
    }
  }

  /**
   * Handle successful payment
   */
  private async handleSuccessfulPayment(payment: Payment): Promise<void> {
    try {
      // Get subscription
      const subscription = await subscriptionService.getUserSubscription(payment.user_id);
      if (!subscription) {
        logger.error(`No subscription found for user ${payment.user_id}`);
        return;
      }

      // CRITICAL: Immediately reactivate subscription and restore access
      if (subscription.status === 'trial' || subscription.status === 'past_due' || subscription.status === 'expired') {
        await query(
          `UPDATE subscriptions SET status = ? WHERE id = ?`,
          ['active', subscription.id]
        );
        logger.info(`✅ Access RESTORED for user ${payment.user_id} - Payment successful`);
      }

      // Extend subscription period
      const now = new Date();
      const periodEnd = new Date(now);
      
      if (subscription.billing_cycle === 'annual') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      await query(
        `UPDATE subscriptions SET 
          current_period_start = ?,
          current_period_end = ?,
          next_billing_date = ?
        WHERE id = ?`,
        [now, periodEnd, periodEnd, subscription.id]
      );

      // Clear any pending retry attempts
      await query(
        `UPDATE payment_retry_log 
         SET status = 'succeeded', attempted_at = NOW() 
         WHERE subscription_id = ? AND status = 'pending'`,
        [subscription.id]
      );

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber();
      await query(
        'UPDATE payments SET invoice_number = ? WHERE id = ?',
        [invoiceNumber, payment.id]
      );

      logger.info(`✅ Successful payment processed for user ${payment.user_id} - Full access granted`);

      // TODO: Send payment success email with invoice
      // TODO: Generate PDF invoice
    } catch (error) {
      logger.error('Error handling successful payment:', error);
    }
  }

  /**
   * Handle failed payment
   */
  private async handleFailedPayment(payment: Payment, errorMessage: string): Promise<void> {
    try {
      // CRITICAL: Immediately suspend subscription and block all access
      await query(
        'UPDATE subscriptions SET status = ? WHERE id = ?',
        ['past_due', payment.subscription_id]
      );

      logger.error(`🚫 ACCESS SUSPENDED for user ${payment.user_id} - Payment failed: ${errorMessage}`);
      logger.error(`Payment ID: ${payment.id}, Subscription ID: ${payment.subscription_id}`);

      // Schedule retry
      await this.schedulePaymentRetry(payment.id, payment.subscription_id);

      // Log critical event for monitoring
      logger.warn(
        `PAYMENT FAILURE: User ${payment.user_id} has been moved to past_due status. ` +
        `All features blocked until payment succeeds. Error: ${errorMessage}`
      );

      // TODO: Send payment failed email with update payment method link
      // TODO: Create in-app notification
      // TODO: Send SMS/WhatsApp notification for critical payment failures
    } catch (error) {
      logger.error('Error handling failed payment:', error);
    }
  }

  /**
   * Schedule payment retry
   */
  private async schedulePaymentRetry(paymentId: string, subscriptionId: string): Promise<void> {
    // Check existing retry attempts
    const retryRows: any = await query(
      'SELECT attempt_number FROM payment_retry_log WHERE payment_id = ? ORDER BY attempt_number DESC LIMIT 1',
      [paymentId]
    );

    const lastAttempt = Array.isArray(retryRows) && retryRows.length > 0 
      ? retryRows[0].attempt_number 
      : 0;

    const nextAttempt = lastAttempt + 1;

    if (nextAttempt > billingConfig.paymentRetry.maxAttempts) {
      logger.info(`Max retry attempts reached for payment ${paymentId}`);
      return;
    }

    // Calculate next retry date
    const retryDelay = billingConfig.paymentRetry.retrySchedule[nextAttempt - 1] || 7;
    const nextRetryDate = new Date();
    nextRetryDate.setDate(nextRetryDate.getDate() + retryDelay);

    // Create retry log entry
    await query(
      `INSERT INTO payment_retry_log (
        id, payment_id, subscription_id, attempt_number, status, next_retry_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), paymentId, subscriptionId, nextAttempt, 'pending', nextRetryDate]
    );

    logger.info(`Retry scheduled for payment ${paymentId} - Attempt ${nextAttempt} on ${nextRetryDate}`);
  }

  /**
   * Generate unique invoice number
   */
  private async generateInvoiceNumber(): Promise<string> {
    const prefix = billingConfig.invoice.prefix;
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Get failed payments
   */
  async getFailedPayments(limit: number = 50): Promise<Payment[]> {
    const rows: any = await query(
      `SELECT * FROM payments 
       WHERE status = 'failed' 
       ORDER BY created_at DESC LIMIT ?`,
      [limit]
    );

    if (!Array.isArray(rows)) {
      return [];
    }

    return rows;
  }

  /**
   * Process refund
   */
  async processRefund(paymentId: string, reason?: string): Promise<void> {
    const payment = await this.getPaymentById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'succeeded') {
      throw new Error('Can only refund succeeded payments');
    }

    await query(
      'UPDATE payments SET status = ?, refunded_at = ? WHERE id = ?',
      ['refunded', new Date(), paymentId]
    );

    logger.info(`Payment ${paymentId} refunded - Reason: ${reason || 'Not specified'}`);

    // TODO: Process refund with PayHere if needed
    // TODO: Send refund confirmation email
  }
}

export const paymentService = new PaymentService();

