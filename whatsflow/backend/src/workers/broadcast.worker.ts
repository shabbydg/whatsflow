/**
 * Broadcast Queue Worker
 * Processes broadcast messages with rate limiting
 */

import { broadcastService } from '../services/broadcast.service.js';
import { WhatsAppService } from '../services/whatsapp.service.js';
import logger from '../utils/logger.js';
import pool from '../config/database.js';
import { RowDataPacket } from 'mysql2';

// Create WhatsApp service instance
const whatsappService = new WhatsAppService();

export class BroadcastWorker {
  private isProcessing: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;

  /**
   * Start the worker
   */
  start() {
    if (this.processingInterval) {
      logger.warn('Broadcast worker already running');
      return;
    }

    logger.info('Starting broadcast worker...');

    // Check for scheduled broadcasts every minute
    this.processingInterval = setInterval(() => {
      this.processScheduledBroadcasts();
      this.processSendingBroadcasts();
    }, 60000); // Check every minute

    // Initial check
    this.processScheduledBroadcasts();
    this.processSendingBroadcasts();
  }

  /**
   * Stop the worker
   */
  stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      logger.info('Broadcast worker stopped');
    }
  }

  /**
   * Process scheduled broadcasts that should start now
   */
  private async processScheduledBroadcasts() {
    try {
      const broadcasts = await broadcastService.getScheduledBroadcastsToStart();

      for (const broadcast of broadcasts) {
        logger.info(`Starting scheduled broadcast: ${broadcast.id}`);
        await broadcastService.startBroadcast(broadcast.id, broadcast.business_profile_id);
      }
    } catch (error: any) {
      logger.error('Error processing scheduled broadcasts:', error);
    }
  }

  /**
   * Process broadcasts that are currently sending
   */
  private async processSendingBroadcasts() {
    if (this.isProcessing) {
      return; // Already processing
    }

    try {
      this.isProcessing = true;

      // Get all broadcasts with status 'sending'
      const [broadcastRows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM broadcasts WHERE status = 'sending' ORDER BY started_at ASC`
      );

      for (const broadcast of broadcastRows) {
        await this.processBroadcast(broadcast as any);
      }
    } catch (error: any) {
      logger.error('Error processing sending broadcasts:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single broadcast
   */
  private async processBroadcast(broadcast: any) {
    try {
      // Get delay for this broadcast's speed
      const delay = this.getDelayForSpeed(broadcast.send_speed, broadcast.custom_delay);

      // Get next batch of pending recipients
      const recipients = await broadcastService.getPendingRecipients(broadcast.id, 10);

      if (recipients.length === 0) {
        // No more recipients, broadcast might be complete
        return;
      }

      logger.info(
        `Processing ${recipients.length} recipients for broadcast ${broadcast.id} (delay: ${delay}s)`
      );

      // Get business_profile_id for the broadcast
      const [deviceRows] = await pool.query<RowDataPacket[]>(
        'SELECT business_profile_id FROM whatsapp_connections WHERE id = ?',
        [broadcast.device_id]
      );

      if (deviceRows.length === 0) {
        logger.error(`Device not found for broadcast ${broadcast.id}`);
        return;
      }

      const businessProfileId = deviceRows[0].business_profile_id;

      // Process each recipient
      for (const recipient of recipients) {
        try {
          // Update status to sending
          await broadcastService.updateRecipientStatus(recipient.id, 'sending');

          // Get message to send (personalized or template)
          const messageToSend = recipient.personalized_message || broadcast.message_content;

          // Send message using WhatsApp service
          // Note: The service currently only supports text messages
          // For image/file support, we'd need to extend the service
          const result = await whatsappService.sendMessage(
            businessProfileId,
            recipient.phone_number,
            messageToSend
          );

          // Update status to sent
          await broadcastService.updateRecipientStatus(recipient.id, 'sent', {
            message_id: result.messageId,
          });

          logger.info(`Message sent to ${recipient.phone_number} (broadcast: ${broadcast.id})`);

          // Wait for delay before next message
          await this.sleep(delay * 1000);
        } catch (error: any) {
          // Mark as failed
          await broadcastService.updateRecipientStatus(recipient.id, 'failed', {
            error_message: error.message,
          });

          logger.error(
            `Failed to send message to ${recipient.phone_number}: ${error.message}`
          );

          // Continue to next recipient after a short delay
          await this.sleep(2000);
        }
      }
    } catch (error: any) {
      logger.error(`Error processing broadcast ${broadcast.id}:`, error);
    }
  }

  /**
   * Get delay in seconds for send speed
   */
  private getDelayForSpeed(speed: string, customDelay?: number): number {
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
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Manual trigger to process all broadcasts immediately (for testing)
   */
  async triggerProcessing() {
    logger.info('Manual broadcast processing triggered');
    await this.processScheduledBroadcasts();
    await this.processSendingBroadcasts();
  }
}

// Export singleton instance
export const broadcastWorker = new BroadcastWorker();
