/**
 * Webhook Service
 * Manages webhook registration, event delivery, and retry logic
 */

import crypto from 'crypto';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import logger from '../utils/logger.js';

export interface Webhook {
  id: string;
  business_profile_id: string;
  url: string;
  secret: string;
  events: string[];
  is_active: boolean;
  description?: string;
  last_triggered_at?: Date;
  success_count: number;
  failure_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: any;
  response_status?: number;
  response_body?: string;
  attempt_number: number;
  delivered_at: Date;
  success: boolean;
  error_message?: string;
  next_retry_at?: Date;
}

export class WebhookService {
  /**
   * Available webhook events
   */
  static readonly AVAILABLE_EVENTS = [
    'message.received',
    'message.sent',
    'message.delivered',
    'message.failed',
    'device.connected',
    'device.disconnected',
    'device.qr_updated',
  ];

  /**
   * Generate webhook secret
   */
  private generateSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  generateSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Create a new webhook
   */
  async createWebhook(
    businessProfileId: string,
    data: {
      url: string;
      events: string[];
      description?: string;
    }
  ): Promise<Webhook> {
    // Validate URL
    try {
      new URL(data.url);
    } catch (error) {
      throw new Error('Invalid webhook URL');
    }

    // Validate events
    for (const event of data.events) {
      if (!WebhookService.AVAILABLE_EVENTS.includes(event)) {
        throw new Error(`Invalid event: ${event}`);
      }
    }

    if (data.events.length === 0) {
      throw new Error('At least one event must be selected');
    }

    const id = uuidv4();
    const secret = this.generateSecret();

    await query(
      `INSERT INTO webhooks (
        id, business_profile_id, url, secret, events, description,
        is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())`,
      [
        id,
        businessProfileId,
        data.url,
        secret,
        JSON.stringify(data.events),
        data.description || null,
      ]
    );

    logger.info(`Webhook created: ${id} for business ${businessProfileId}`);

    const webhook = await this.getWebhookById(id);
    if (!webhook) {
      throw new Error('Failed to create webhook');
    }

    return webhook;
  }

  /**
   * Get all webhooks for a business
   */
  async getWebhooks(businessProfileId: string): Promise<Webhook[]> {
    const rows: any = await query(
      `SELECT 
        id, business_profile_id, url, secret, events, is_active,
        description, last_triggered_at, success_count, failure_count,
        created_at, updated_at
      FROM webhooks 
      WHERE business_profile_id = ?
      ORDER BY created_at DESC`,
      [businessProfileId]
    );

    if (!Array.isArray(rows)) return [];

    return rows.map(this.parseWebhookRow);
  }

  /**
   * Get webhook by ID
   */
  async getWebhookById(id: string): Promise<Webhook | null> {
    const rows: any = await query(
      `SELECT 
        id, business_profile_id, url, secret, events, is_active,
        description, last_triggered_at, success_count, failure_count,
        created_at, updated_at
      FROM webhooks 
      WHERE id = ?`,
      [id]
    );

    if (!Array.isArray(rows) || rows.length === 0) return null;

    return this.parseWebhookRow(rows[0]);
  }

  /**
   * Update webhook
   */
  async updateWebhook(
    id: string,
    businessProfileId: string,
    data: {
      url?: string;
      events?: string[];
      description?: string;
      is_active?: boolean;
    }
  ): Promise<Webhook> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.url !== undefined) {
      // Validate URL
      try {
        new URL(data.url);
      } catch (error) {
        throw new Error('Invalid webhook URL');
      }
      updates.push('url = ?');
      values.push(data.url);
    }

    if (data.events !== undefined) {
      // Validate events
      for (const event of data.events) {
        if (!WebhookService.AVAILABLE_EVENTS.includes(event)) {
          throw new Error(`Invalid event: ${event}`);
        }
      }
      if (data.events.length === 0) {
        throw new Error('At least one event must be selected');
      }
      updates.push('events = ?');
      values.push(JSON.stringify(data.events));
    }

    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }

    if (data.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(data.is_active);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    updates.push('updated_at = NOW()');
    values.push(id, businessProfileId);

    await query(
      `UPDATE webhooks 
      SET ${updates.join(', ')}
      WHERE id = ? AND business_profile_id = ?`,
      values
    );

    const updated = await this.getWebhookById(id);
    if (!updated) {
      throw new Error('Webhook not found after update');
    }

    return updated;
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(id: string, businessProfileId: string): Promise<void> {
    await query(
      'DELETE FROM webhooks WHERE id = ? AND business_profile_id = ?',
      [id, businessProfileId]
    );

    logger.info(`Webhook deleted: ${id}`);
  }

  /**
   * Trigger webhook event
   */
  async triggerEvent(
    businessProfileId: string,
    eventType: string,
    payload: any
  ): Promise<void> {
    // Get all active webhooks subscribed to this event
    const rows: any = await query(
      `SELECT id, url, secret, events 
      FROM webhooks 
      WHERE business_profile_id = ? 
        AND is_active = TRUE
        AND JSON_CONTAINS(events, ?)`,
      [businessProfileId, JSON.stringify(eventType)]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return; // No webhooks to trigger
    }

    // Queue deliveries for each webhook
    for (const webhook of rows) {
      await this.queueDelivery(webhook.id, eventType, payload, webhook.url, webhook.secret);
    }
  }

  /**
   * Queue webhook delivery
   */
  private async queueDelivery(
    webhookId: string,
    eventType: string,
    payload: any,
    url: string,
    secret: string
  ): Promise<void> {
    const deliveryId = uuidv4();

    await query(
      `INSERT INTO webhook_deliveries (
        id, webhook_id, event_type, payload, attempt_number,
        delivered_at, success
      ) VALUES (?, ?, ?, ?, 1, NOW(), FALSE)`,
      [deliveryId, webhookId, eventType, JSON.stringify(payload)]
    );

    // Deliver asynchronously (don't await)
    this.deliverWebhook(deliveryId, webhookId, url, secret, eventType, payload, 1).catch(
      (error) => {
        logger.error(`Failed to deliver webhook ${deliveryId}:`, error);
      }
    );
  }

  /**
   * Deliver webhook with retry logic
   */
  private async deliverWebhook(
    deliveryId: string,
    webhookId: string,
    url: string,
    secret: string,
    eventType: string,
    payload: any,
    attemptNumber: number
  ): Promise<void> {
    const maxAttempts = 5;
    const payloadString = JSON.stringify(payload);
    const signature = this.generateSignature(payloadString, secret);

    try {
      const startTime = Date.now();
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': eventType,
          'X-Webhook-Signature': signature,
          'X-Webhook-Delivery-Id': deliveryId,
          'User-Agent': 'WhatsFlow-Webhooks/1.0',
        },
        timeout: 30000, // 30 seconds
        validateStatus: (status) => status >= 200 && status < 300,
      });

      const responseTime = Date.now() - startTime;

      // Success
      await query(
        `UPDATE webhook_deliveries 
        SET success = TRUE, 
            response_status = ?, 
            response_body = ?,
            delivered_at = NOW()
        WHERE id = ?`,
        [response.status, JSON.stringify(response.data).substring(0, 1000), deliveryId]
      );

      await query(
        `UPDATE webhooks 
        SET last_triggered_at = NOW(),
            success_count = success_count + 1
        WHERE id = ?`,
        [webhookId]
      );

      logger.info(
        `Webhook delivered successfully: ${deliveryId} (${responseTime}ms, attempt ${attemptNumber})`
      );
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message;
      const statusCode = error.response?.status;

      logger.error(
        `Webhook delivery failed: ${deliveryId} (attempt ${attemptNumber}/${maxAttempts})`,
        errorMessage
      );

      // Update delivery record
      await query(
        `UPDATE webhook_deliveries 
        SET response_status = ?, 
            error_message = ?
        WHERE id = ?`,
        [statusCode || 0, String(errorMessage).substring(0, 500), deliveryId]
      );

      await query(
        `UPDATE webhooks 
        SET failure_count = failure_count + 1
        WHERE id = ?`,
        [webhookId]
      );

      // Retry with exponential backoff
      if (attemptNumber < maxAttempts) {
        const retryDelay = Math.pow(2, attemptNumber) * 1000; // 2s, 4s, 8s, 16s, 32s
        const nextRetryAt = new Date(Date.now() + retryDelay);

        await query(
          `UPDATE webhook_deliveries 
          SET attempt_number = ?,
              next_retry_at = ?
          WHERE id = ?`,
          [attemptNumber + 1, nextRetryAt, deliveryId]
        );

        setTimeout(() => {
          this.deliverWebhook(
            deliveryId,
            webhookId,
            url,
            secret,
            eventType,
            payload,
            attemptNumber + 1
          ).catch((err) => logger.error('Retry failed:', err));
        }, retryDelay);
      }
    }
  }

  /**
   * Get webhook deliveries (logs)
   */
  async getDeliveries(
    webhookId: string,
    businessProfileId: string,
    limit: number = 50
  ): Promise<WebhookDelivery[]> {
    // Verify webhook belongs to business
    const webhook = await this.getWebhookById(webhookId);
    if (!webhook || webhook.business_profile_id !== businessProfileId) {
      throw new Error('Webhook not found');
    }

    const rows: any = await query(
      `SELECT 
        id, webhook_id, event_type, payload, response_status,
        response_body, attempt_number, delivered_at, success,
        error_message, next_retry_at
      FROM webhook_deliveries
      WHERE webhook_id = ?
      ORDER BY delivered_at DESC
      LIMIT ?`,
      [webhookId, limit]
    );

    if (!Array.isArray(rows)) return [];

    return rows.map(this.parseDeliveryRow);
  }

  /**
   * Test webhook by sending a test event
   */
  async testWebhook(webhookId: string, businessProfileId: string): Promise<void> {
    const webhook = await this.getWebhookById(webhookId);
    
    if (!webhook || webhook.business_profile_id !== businessProfileId) {
      throw new Error('Webhook not found');
    }

    const testPayload = {
      event: 'webhook.test',
      data: {
        message: 'This is a test webhook delivery from WhatsFlow',
        timestamp: new Date().toISOString(),
        webhook_id: webhookId,
      },
    };

    await this.queueDelivery(
      webhookId,
      'webhook.test',
      testPayload,
      webhook.url,
      webhook.secret
    );
  }

  /**
   * Queue webhook delivery (private helper used by triggerEvent)
   */
  private async queueDelivery(
    webhookId: string,
    eventType: string,
    payload: any,
    url: string,
    secret: string
  ): Promise<void> {
    const deliveryId = uuidv4();

    await query(
      `INSERT INTO webhook_deliveries (
        id, webhook_id, event_type, payload, attempt_number,
        delivered_at, success
      ) VALUES (?, ?, ?, ?, 1, NOW(), FALSE)`,
      [deliveryId, webhookId, eventType, JSON.stringify(payload)]
    );

    // Deliver asynchronously
    this.deliverWebhook(deliveryId, webhookId, url, secret, eventType, payload, 1).catch(
      (error) => {
        logger.error(`Failed to deliver webhook ${deliveryId}:`, error);
      }
    );
  }

  /**
   * Deliver webhook (private, used internally)
   */
  private async deliverWebhook(
    deliveryId: string,
    webhookId: string,
    url: string,
    secret: string,
    eventType: string,
    payload: any,
    attemptNumber: number
  ): Promise<void> {
    const maxAttempts = 5;
    const payloadString = JSON.stringify(payload);
    const signature = this.generateSignature(payloadString, secret);

    try {
      const startTime = Date.now();
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': eventType,
          'X-Webhook-Signature': signature,
          'X-Webhook-Delivery-Id': deliveryId,
          'User-Agent': 'WhatsFlow-Webhooks/1.0',
        },
        timeout: 30000,
        validateStatus: (status) => status >= 200 && status < 300,
      });

      const responseTime = Date.now() - startTime;

      // Success
      await query(
        `UPDATE webhook_deliveries 
        SET success = TRUE, 
            response_status = ?, 
            response_body = ?,
            delivered_at = NOW()
        WHERE id = ?`,
        [response.status, JSON.stringify(response.data).substring(0, 1000), deliveryId]
      );

      await query(
        `UPDATE webhooks 
        SET last_triggered_at = NOW(),
            success_count = success_count + 1
        WHERE id = ?`,
        [webhookId]
      );

      logger.info(
        `Webhook delivered: ${deliveryId} (${responseTime}ms, attempt ${attemptNumber})`
      );
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message;
      const statusCode = error.response?.status;

      logger.error(
        `Webhook delivery failed: ${deliveryId} (attempt ${attemptNumber}/${maxAttempts})`,
        errorMessage
      );

      await query(
        `UPDATE webhook_deliveries 
        SET response_status = ?, 
            error_message = ?
        WHERE id = ?`,
        [statusCode || 0, String(errorMessage).substring(0, 500), deliveryId]
      );

      await query(
        `UPDATE webhooks 
        SET failure_count = failure_count + 1
        WHERE id = ?`,
        [webhookId]
      );

      // Retry with exponential backoff
      if (attemptNumber < maxAttempts) {
        const retryDelay = Math.pow(2, attemptNumber) * 1000;
        const nextRetryAt = new Date(Date.now() + retryDelay);

        await query(
          `UPDATE webhook_deliveries 
          SET attempt_number = ?,
              next_retry_at = ?
          WHERE id = ?`,
          [attemptNumber + 1, nextRetryAt, deliveryId]
        );

        setTimeout(() => {
          this.deliverWebhook(
            deliveryId,
            webhookId,
            url,
            secret,
            eventType,
            payload,
            attemptNumber + 1
          ).catch((err) => logger.error('Retry failed:', err));
        }, retryDelay);
      }
    }
  }

  /**
   * Parse webhook row from database
   */
  private parseWebhookRow(row: any): Webhook {
    return {
      id: row.id,
      business_profile_id: row.business_profile_id,
      url: row.url,
      secret: row.secret,
      events: typeof row.events === 'string' ? JSON.parse(row.events) : row.events || [],
      is_active: row.is_active,
      description: row.description,
      last_triggered_at: row.last_triggered_at,
      success_count: row.success_count || 0,
      failure_count: row.failure_count || 0,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  /**
   * Parse delivery row from database
   */
  private parseDeliveryRow(row: any): WebhookDelivery {
    return {
      id: row.id,
      webhook_id: row.webhook_id,
      event_type: row.event_type,
      payload: typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload,
      response_status: row.response_status,
      response_body: row.response_body,
      attempt_number: row.attempt_number,
      delivered_at: row.delivered_at,
      success: row.success,
      error_message: row.error_message,
      next_retry_at: row.next_retry_at,
    };
  }
}

export const webhookService = new WebhookService();

