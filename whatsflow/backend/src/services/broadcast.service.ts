/**
 * Broadcast Service
 * Manages broadcast campaigns and message sending
 */

import pool from '../config/database.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';
import { contactListService } from './contact-list.service.js';

export type MessageType = 'text' | 'image' | 'file' | 'location';
export type BroadcastStatus = 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed' | 'cancelled';
export type SendSpeed = 'slow' | 'normal' | 'fast' | 'custom';
export type RecipientStatus = 'pending' | 'queued' | 'sending' | 'sent' | 'delivered' | 'failed' | 'skipped';

export interface Broadcast {
  id: string;
  business_profile_id: string;
  device_id: string;
  name: string;
  message_content: string;
  message_type: MessageType;
  media_url?: string;
  status: BroadcastStatus;
  send_speed: SendSpeed;
  custom_delay?: number;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BroadcastRecipient {
  id: string;
  broadcast_id: string;
  contact_id?: string;
  phone_number: string;
  full_name?: string;
  personalized_message?: string;
  status: RecipientStatus;
  message_id?: string;
  error_message?: string;
  sent_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBroadcastData {
  name: string;
  device_id: string;
  message_content: string;
  message_type?: MessageType;
  media_url?: string;
  send_speed?: SendSpeed;
  custom_delay?: number;
  scheduled_at?: Date;
  contact_list_ids: string[];
}

export interface UpdateBroadcastData {
  name?: string;
  message_content?: string;
  message_type?: MessageType;
  media_url?: string;
  send_speed?: SendSpeed;
  custom_delay?: number;
  scheduled_at?: Date;
}

export class BroadcastService {
  /**
   * Get speed delay in seconds
   */
  private getDelayForSpeed(speed: SendSpeed, customDelay?: number): number {
    switch (speed) {
      case 'slow':
        return 30; // 120 msg/hour
      case 'normal':
        return 20; // 180 msg/hour
      case 'fast':
        return 10; // 360 msg/hour
      case 'custom':
        return customDelay || 20;
      default:
        return 20;
    }
  }

  /**
   * Get all broadcasts for a business
   */
  async getAllBroadcasts(
    businessProfileId: string,
    options: {
      status?: BroadcastStatus;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ broadcasts: Broadcast[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE business_profile_id = ?';
    const params: any[] = [businessProfileId];

    if (options.status) {
      whereClause += ' AND status = ?';
      params.push(options.status);
    }

    // Get total count
    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM broadcasts ${whereClause}`,
      params
    );

    const total = countRows[0].total;

    // Get broadcasts
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM broadcasts
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return {
      broadcasts: rows as Broadcast[],
      total,
    };
  }

  /**
   * Get a single broadcast by ID
   */
  async getBroadcastById(broadcastId: string, businessProfileId: string): Promise<Broadcast> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM broadcasts WHERE id = ? AND business_profile_id = ?',
      [broadcastId, businessProfileId]
    );

    if (rows.length === 0) {
      throw new Error('Broadcast not found');
    }

    return rows[0] as Broadcast;
  }

  /**
   * Create a new broadcast
   */
  async createBroadcast(
    businessProfileId: string,
    data: CreateBroadcastData
  ): Promise<Broadcast> {
    const broadcastId = uuidv4();
    const messageType = data.message_type || 'text';
    const sendSpeed = data.send_speed || 'normal';

    // Validate device belongs to business
    const [deviceRows] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM whatsapp_connections
       WHERE id = ? AND business_profile_id = ? AND status = 'connected'`,
      [data.device_id, businessProfileId]
    );

    if (deviceRows.length === 0) {
      throw new Error('Device not found or not connected');
    }

    // Validate contact lists
    if (data.contact_list_ids.length === 0) {
      throw new Error('At least one contact list is required');
    }

    // Create broadcast
    await pool.query<ResultSetHeader>(
      `INSERT INTO broadcasts (
        id, business_profile_id, device_id, name, message_content,
        message_type, media_url, send_speed, custom_delay, scheduled_at, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [
        broadcastId,
        businessProfileId,
        data.device_id,
        data.name,
        data.message_content,
        messageType,
        data.media_url || null,
        sendSpeed,
        data.custom_delay || null,
        data.scheduled_at || null,
      ]
    );

    // Link contact lists to broadcast
    for (const listId of data.contact_list_ids) {
      // Verify list exists and belongs to business
      await contactListService.getListById(listId, businessProfileId);

      await pool.query<ResultSetHeader>(
        `INSERT INTO broadcast_contact_lists (id, broadcast_id, list_id)
         VALUES (?, ?, ?)`,
        [uuidv4(), broadcastId, listId]
      );
    }

    // Generate recipients from contact lists
    await this.generateRecipients(broadcastId, data.contact_list_ids, data.message_content, businessProfileId);

    logger.info(`Broadcast created: ${broadcastId}`);

    return this.getBroadcastById(broadcastId, businessProfileId);
  }

  /**
   * Update a broadcast (only if status is draft)
   */
  async updateBroadcast(
    broadcastId: string,
    businessProfileId: string,
    data: UpdateBroadcastData
  ): Promise<Broadcast> {
    const broadcast = await this.getBroadcastById(broadcastId, businessProfileId);

    if (broadcast.status !== 'draft') {
      throw new Error('Only draft broadcasts can be updated');
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }

    if (data.message_content !== undefined) {
      updates.push('message_content = ?');
      values.push(data.message_content);

      // Regenerate personalized messages if content changed
      await this.regeneratePersonalizedMessages(broadcastId, data.message_content);
    }

    if (data.message_type !== undefined) {
      updates.push('message_type = ?');
      values.push(data.message_type);
    }

    if (data.media_url !== undefined) {
      updates.push('media_url = ?');
      values.push(data.media_url);
    }

    if (data.send_speed !== undefined) {
      updates.push('send_speed = ?');
      values.push(data.send_speed);
    }

    if (data.custom_delay !== undefined) {
      updates.push('custom_delay = ?');
      values.push(data.custom_delay);
    }

    if (data.scheduled_at !== undefined) {
      updates.push('scheduled_at = ?');
      values.push(data.scheduled_at);
    }

    if (updates.length === 0) {
      return this.getBroadcastById(broadcastId, businessProfileId);
    }

    values.push(broadcastId, businessProfileId);

    await pool.query<ResultSetHeader>(
      `UPDATE broadcasts SET ${updates.join(', ')}
       WHERE id = ? AND business_profile_id = ?`,
      values
    );

    logger.info(`Broadcast updated: ${broadcastId}`);

    return this.getBroadcastById(broadcastId, businessProfileId);
  }

  /**
   * Delete a broadcast
   */
  async deleteBroadcast(broadcastId: string, businessProfileId: string): Promise<void> {
    const broadcast = await this.getBroadcastById(broadcastId, businessProfileId);

    if (broadcast.status === 'sending') {
      throw new Error('Cannot delete a broadcast that is currently sending');
    }

    await pool.query<ResultSetHeader>(
      'DELETE FROM broadcasts WHERE id = ? AND business_profile_id = ?',
      [broadcastId, businessProfileId]
    );

    logger.info(`Broadcast deleted: ${broadcastId}`);
  }

  /**
   * Get recipients for a broadcast
   */
  async getRecipients(
    broadcastId: string,
    businessProfileId: string,
    options: {
      status?: RecipientStatus;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ recipients: BroadcastRecipient[]; total: number }> {
    await this.getBroadcastById(broadcastId, businessProfileId);

    const page = options.page || 1;
    const limit = options.limit || 50;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE broadcast_id = ?';
    const params: any[] = [broadcastId];

    if (options.status) {
      whereClause += ' AND status = ?';
      params.push(options.status);
    }

    // Get total count
    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM broadcast_recipients ${whereClause}`,
      params
    );

    const total = countRows[0].total;

    // Get recipients
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM broadcast_recipients
       ${whereClause}
       ORDER BY created_at ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return {
      recipients: rows as BroadcastRecipient[],
      total,
    };
  }

  /**
   * Get broadcast statistics
   */
  async getBroadcastStats(
    broadcastId: string,
    businessProfileId: string
  ): Promise<{
    total: number;
    pending: number;
    queued: number;
    sending: number;
    sent: number;
    delivered: number;
    failed: number;
    skipped: number;
  }> {
    await this.getBroadcastById(broadcastId, businessProfileId);

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'queued' THEN 1 ELSE 0 END) as queued,
        SUM(CASE WHEN status = 'sending' THEN 1 ELSE 0 END) as sending,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'skipped' THEN 1 ELSE 0 END) as skipped
       FROM broadcast_recipients
       WHERE broadcast_id = ?`,
      [broadcastId]
    );

    return rows[0] as any;
  }

  /**
   * Start sending a broadcast
   */
  async startBroadcast(broadcastId: string, businessProfileId: string): Promise<void> {
    const broadcast = await this.getBroadcastById(broadcastId, businessProfileId);

    if (broadcast.status !== 'draft' && broadcast.status !== 'scheduled') {
      throw new Error('Only draft or scheduled broadcasts can be started');
    }

    if (broadcast.total_recipients === 0) {
      throw new Error('No recipients to send to');
    }

    // Check if scheduled for future
    if (broadcast.scheduled_at) {
      const scheduledTime = new Date(broadcast.scheduled_at);
      if (scheduledTime > new Date()) {
        await pool.query<ResultSetHeader>(
          `UPDATE broadcasts SET status = 'scheduled' WHERE id = ?`,
          [broadcastId]
        );
        logger.info(`Broadcast scheduled: ${broadcastId}`);
        return;
      }
    }

    // Update broadcast status to sending
    await pool.query<ResultSetHeader>(
      `UPDATE broadcasts SET status = 'sending', started_at = NOW() WHERE id = ?`,
      [broadcastId]
    );

    // Mark all pending recipients as queued
    await pool.query<ResultSetHeader>(
      `UPDATE broadcast_recipients SET status = 'queued' WHERE broadcast_id = ? AND status = 'pending'`,
      [broadcastId]
    );

    logger.info(`Broadcast started: ${broadcastId}`);

    // Note: Queue worker will pick up queued recipients and process them
  }

  /**
   * Cancel a broadcast
   */
  async cancelBroadcast(broadcastId: string, businessProfileId: string): Promise<void> {
    const broadcast = await this.getBroadcastById(broadcastId, businessProfileId);

    if (broadcast.status === 'completed' || broadcast.status === 'cancelled') {
      throw new Error('Cannot cancel a completed or already cancelled broadcast');
    }

    await pool.query<ResultSetHeader>(
      `UPDATE broadcasts SET status = 'cancelled', completed_at = NOW() WHERE id = ?`,
      [broadcastId]
    );

    // Mark pending/queued recipients as skipped
    await pool.query<ResultSetHeader>(
      `UPDATE broadcast_recipients SET status = 'skipped'
       WHERE broadcast_id = ? AND status IN ('pending', 'queued')`,
      [broadcastId]
    );

    logger.info(`Broadcast cancelled: ${broadcastId}`);
  }

  /**
   * Update recipient status
   */
  async updateRecipientStatus(
    recipientId: string,
    status: RecipientStatus,
    options: {
      message_id?: string;
      error_message?: string;
    } = {}
  ): Promise<void> {
    const updates: string[] = ['status = ?'];
    const values: any[] = [status];

    if (status === 'sent') {
      updates.push('sent_at = NOW()');
    }

    if (status === 'delivered') {
      updates.push('delivered_at = NOW()');
    }

    if (options.message_id) {
      updates.push('message_id = ?');
      values.push(options.message_id);
    }

    if (options.error_message) {
      updates.push('error_message = ?');
      values.push(options.error_message);
    }

    values.push(recipientId);

    await pool.query<ResultSetHeader>(
      `UPDATE broadcast_recipients SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Update broadcast counters
    await this.updateBroadcastCounters(recipientId);
  }

  /**
   * Personalize message for a recipient
   */
  private personalizeMessage(
    template: string,
    recipient: {
      full_name?: string;
      phone_number: string;
      custom_fields?: Record<string, any>;
    }
  ): string {
    let message = template;

    // Replace [full_name]
    if (recipient.full_name) {
      message = message.replace(/\[full_name\]/g, recipient.full_name);
    }

    // Replace [phone] or [phone_number]
    message = message.replace(/\[phone\]/g, recipient.phone_number);
    message = message.replace(/\[phone_number\]/g, recipient.phone_number);

    // Replace custom fields
    if (recipient.custom_fields) {
      Object.keys(recipient.custom_fields).forEach((key) => {
        const regex = new RegExp(`\\[${key}\\]`, 'g');
        message = message.replace(regex, recipient.custom_fields![key]);
      });
    }

    return message;
  }

  /**
   * Generate recipients from contact lists
   */
  private async generateRecipients(
    broadcastId: string,
    contactListIds: string[],
    messageTemplate: string,
    businessProfileId: string
  ): Promise<void> {
    const uniqueContacts = new Map<string, any>();

    // Collect all contacts from all lists (deduplicate by phone number)
    for (const listId of contactListIds) {
      const { members } = await contactListService.getListMembers(
        listId,
        businessProfileId,
        { limit: 10000, excludeOptedOut: true }
      );

      for (const member of members) {
        if (!uniqueContacts.has(member.phone_number)) {
          uniqueContacts.set(member.phone_number, member);
        }
      }
    }

    // Check max limit (1000 recipients per broadcast)
    if (uniqueContacts.size > 1000) {
      throw new Error('Maximum 1000 recipients per broadcast');
    }

    // Insert recipients
    for (const [phoneNumber, member] of uniqueContacts) {
      const recipientId = uuidv4();
      const personalizedMessage = this.personalizeMessage(messageTemplate, {
        full_name: member.full_name,
        phone_number: member.phone_number,
        custom_fields: member.custom_fields,
      });

      await pool.query<ResultSetHeader>(
        `INSERT INTO broadcast_recipients (
          id, broadcast_id, contact_id, phone_number, full_name, personalized_message, status
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [
          recipientId,
          broadcastId,
          member.contact_id || null,
          member.phone_number,
          member.full_name || null,
          personalizedMessage,
        ]
      );
    }

    // Update total count
    await pool.query<ResultSetHeader>(
      'UPDATE broadcasts SET total_recipients = ? WHERE id = ?',
      [uniqueContacts.size, broadcastId]
    );

    logger.info(`Generated ${uniqueContacts.size} recipients for broadcast ${broadcastId}`);
  }

  /**
   * Regenerate personalized messages for all recipients
   */
  private async regeneratePersonalizedMessages(
    broadcastId: string,
    newTemplate: string
  ): Promise<void> {
    const { recipients } = await this.getRecipients(broadcastId, '', { limit: 10000 });

    for (const recipient of recipients) {
      const personalizedMessage = this.personalizeMessage(newTemplate, {
        full_name: recipient.full_name,
        phone_number: recipient.phone_number,
      });

      await pool.query<ResultSetHeader>(
        'UPDATE broadcast_recipients SET personalized_message = ? WHERE id = ?',
        [personalizedMessage, recipient.id]
      );
    }
  }

  /**
   * Update broadcast counters based on recipient status
   */
  private async updateBroadcastCounters(recipientId: string): Promise<void> {
    // Get broadcast_id from recipient
    const [recipientRows] = await pool.query<RowDataPacket[]>(
      'SELECT broadcast_id FROM broadcast_recipients WHERE id = ?',
      [recipientId]
    );

    if (recipientRows.length === 0) return;

    const broadcastId = recipientRows[0].broadcast_id;

    // Count statuses
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        SUM(CASE WHEN status IN ('sent', 'delivered') THEN 1 ELSE 0 END) as sent_count,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_count,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count,
        COUNT(*) as total
       FROM broadcast_recipients
       WHERE broadcast_id = ?`,
      [broadcastId]
    );

    const counts = rows[0];

    await pool.query<ResultSetHeader>(
      `UPDATE broadcasts SET
        sent_count = ?,
        delivered_count = ?,
        failed_count = ?
       WHERE id = ?`,
      [counts.sent_count, counts.delivered_count, counts.failed_count, broadcastId]
    );

    // Check if broadcast is complete
    const [broadcastRows] = await pool.query<RowDataPacket[]>(
      'SELECT total_recipients, sent_count, failed_count FROM broadcasts WHERE id = ?',
      [broadcastId]
    );

    const broadcast = broadcastRows[0];
    const completedCount = broadcast.sent_count + broadcast.failed_count;

    if (completedCount >= broadcast.total_recipients) {
      await pool.query<ResultSetHeader>(
        `UPDATE broadcasts SET status = 'completed', completed_at = NOW() WHERE id = ?`,
        [broadcastId]
      );
      logger.info(`Broadcast completed: ${broadcastId}`);
    }
  }

  /**
   * Get pending recipients for queue processing
   */
  async getPendingRecipients(
    broadcastId: string,
    limit: number = 100
  ): Promise<BroadcastRecipient[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM broadcast_recipients
       WHERE broadcast_id = ? AND status = 'queued'
       ORDER BY created_at ASC
       LIMIT ?`,
      [broadcastId, limit]
    );

    return rows as BroadcastRecipient[];
  }

  /**
   * Get scheduled broadcasts that should start now
   */
  async getScheduledBroadcastsToStart(): Promise<Broadcast[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM broadcasts
       WHERE status = 'scheduled'
       AND scheduled_at <= NOW()
       ORDER BY scheduled_at ASC`
    );

    return rows as Broadcast[];
  }
}

export const broadcastService = new BroadcastService();
