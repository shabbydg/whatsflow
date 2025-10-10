/**
 * Billing Controller
 * Handles PayHere webhooks and billing operations
 */

import { Request, Response } from 'express';
import { paymentService } from '../services/billing/payment.service.js';
import logger from '../utils/logger.js';

export class BillingController {
  /**
   * Handle PayHere webhook notifications
   * This endpoint receives payment status updates from PayHere
   */
  async handleWebhook(req: Request, res: Response) {
    try {
      const notification = req.body;

      logger.info('PayHere webhook received:', {
        order_id: notification.order_id,
        status_code: notification.status_code,
      });

      // Process the notification
      await paymentService.processWebhookNotification(notification);

      // Always return 200 OK to PayHere
      res.status(200).send('OK');
    } catch (error: any) {
      logger.error('Error processing PayHere webhook:', error);
      
      // Still return 200 to PayHere to prevent retries
      // Log the error for manual investigation
      res.status(200).send('OK');
    }
  }

  /**
   * Get payment history for current user
   */
  async getPaymentHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const payments = await paymentService.getUserPayments(userId, limit);

      res.json({
        success: true,
        data: payments,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get payment by ID
   */
  async getPayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const payment = await paymentService.getPaymentById(id);

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      res.json({
        success: true,
        data: payment,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const billingController = new BillingController();

