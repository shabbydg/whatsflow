import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';
import { WhatsAppService } from './whatsapp.service.js';

export interface Device {
  id: string;
  business_profile_id: string;
  device_name: string;
  persona_id?: string;
  persona_name?: string;
  phone_number: string;
  connection_mode: string;
  status: string;
  is_primary: boolean;
  auto_reply_enabled: boolean;
  ai_enabled: boolean;
  ai_schedule?: { from: string; to: string }[];
  working_hours_start?: string;
  working_hours_end?: string;
  working_days?: string;
  qr_code?: string;
  last_connected_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export class DeviceService {
  private whatsappService: WhatsAppService;

  constructor() {
    this.whatsappService = new WhatsAppService();
  }

  /**
   * Get all devices for a business profile
   */
  async getAllDevices(businessProfileId: string): Promise<Device[]> {
    try {
      const devices: any = await query(
        `SELECT
          wc.*,
          p.name as persona_name
        FROM whatsapp_connections wc
        LEFT JOIN personas p ON wc.persona_id = p.id
        WHERE wc.business_profile_id = ?
        ORDER BY wc.is_primary DESC, wc.created_at DESC`,
        [businessProfileId]
      );

      return Array.isArray(devices) ? devices : [];
    } catch (error: any) {
      logger.error('Error fetching devices:', error);
      throw new Error('Failed to fetch devices');
    }
  }

  /**
   * Get a single device by ID
   */
  async getDeviceById(deviceId: string, businessProfileId: string): Promise<Device> {
    try {
      const devices: any = await query(
        `SELECT
          wc.*,
          p.name as persona_name
        FROM whatsapp_connections wc
        LEFT JOIN personas p ON wc.persona_id = p.id
        WHERE wc.id = ? AND wc.business_profile_id = ?`,
        [deviceId, businessProfileId]
      );

      if (!Array.isArray(devices) || devices.length === 0) {
        throw new Error('Device not found');
      }

      return devices[0];
    } catch (error: any) {
      logger.error('Error fetching device:', error);
      throw error;
    }
  }

  /**
   * Create a new device (initiate connection)
   */
  async createDevice(
    businessProfileId: string,
    data: {
      device_name: string;
      phone_number: string;
      persona_id?: string;
      auto_reply_enabled?: boolean;
      ai_enabled?: boolean;
      ai_schedule?: { from: string; to: string }[];
      working_hours_start?: string;
      working_hours_end?: string;
      working_days?: string;
    }
  ): Promise<Device> {
    try {
      // Check if phone number is already in use
      const existing: any = await query(
        'SELECT id FROM whatsapp_connections WHERE phone_number = ?',
        [data.phone_number]
      );

      if (Array.isArray(existing) && existing.length > 0) {
        throw new Error('Phone number already connected to another device');
      }

      // Check if this is the first device (make it primary)
      const deviceCount: any = await query(
        'SELECT COUNT(*) as count FROM whatsapp_connections WHERE business_profile_id = ?',
        [businessProfileId]
      );

      const isPrimary = Array.isArray(deviceCount) && deviceCount[0]?.count === 0;

      const deviceId = uuidv4();

      await query(
        `INSERT INTO whatsapp_connections (
          id, business_profile_id, device_name, persona_id, phone_number,
          status, is_primary, auto_reply_enabled, ai_enabled, ai_schedule,
          working_hours_start, working_hours_end, working_days
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          deviceId,
          businessProfileId,
          data.device_name,
          data.persona_id || null,
          data.phone_number,
          'qr_pending',
          isPrimary ? 1 : 0,
          data.auto_reply_enabled ? 1 : 0,
          data.ai_enabled !== undefined ? (data.ai_enabled ? 1 : 0) : 1,
          data.ai_schedule ? JSON.stringify(data.ai_schedule) : null,
          data.working_hours_start || '09:00:00',
          data.working_hours_end || '17:00:00',
          data.working_days || 'Mon,Tue,Wed,Thu,Fri',
        ]
      );

      logger.info(`Device created: ${deviceId} - ${data.device_name}`);

      // Initiate WhatsApp connection to generate QR code
      try {
        await this.whatsappService.initializeConnection(businessProfileId, data.phone_number);
        logger.info(`WhatsApp connection initiated for device ${deviceId}`);
      } catch (error) {
        logger.error(`Failed to initiate WhatsApp connection for device ${deviceId}:`, error);
        // Don't throw - device is created, user can retry connection later
      }

      return this.getDeviceById(deviceId, businessProfileId);
    } catch (error: any) {
      logger.error('Error creating device:', error);
      throw error;
    }
  }

  /**
   * Update device settings
   */
  async updateDevice(
    deviceId: string,
    businessProfileId: string,
    data: {
      device_name?: string;
      persona_id?: string;
      auto_reply_enabled?: boolean;
      ai_enabled?: boolean;
      ai_schedule?: { from: string; to: string }[];
      working_hours_start?: string;
      working_hours_end?: string;
      working_days?: string;
      is_primary?: boolean;
      email_on_disconnect?: boolean;
    }
  ): Promise<Device> {
    try {
      // Check if device exists
      await this.getDeviceById(deviceId, businessProfileId);

      const updates: string[] = [];
      const values: any[] = [];

      if (data.device_name !== undefined) {
        updates.push('device_name = ?');
        values.push(data.device_name);
      }
      if (data.persona_id !== undefined) {
        updates.push('persona_id = ?');
        values.push(data.persona_id);
      }
      if (data.auto_reply_enabled !== undefined) {
        updates.push('auto_reply_enabled = ?');
        values.push(data.auto_reply_enabled ? 1 : 0);
      }
      if (data.ai_enabled !== undefined) {
        updates.push('ai_enabled = ?');
        values.push(data.ai_enabled ? 1 : 0);
      }
      if (data.ai_schedule !== undefined) {
        updates.push('ai_schedule = ?');
        values.push(data.ai_schedule ? JSON.stringify(data.ai_schedule) : null);
      }
      if (data.working_hours_start !== undefined) {
        updates.push('working_hours_start = ?');
        values.push(data.working_hours_start);
      }
      if (data.working_hours_end !== undefined) {
        updates.push('working_hours_end = ?');
        values.push(data.working_hours_end);
      }
      if (data.working_days !== undefined) {
        updates.push('working_days = ?');
        values.push(data.working_days);
      }
      if (data.email_on_disconnect !== undefined) {
        updates.push('email_on_disconnect = ?');
        values.push(data.email_on_disconnect ? 1 : 0);
      }

      // Handle primary device change
      if (data.is_primary === true) {
        // Remove primary from all other devices
        await query(
          'UPDATE whatsapp_connections SET is_primary = 0 WHERE business_profile_id = ?',
          [businessProfileId]
        );
        updates.push('is_primary = ?');
        values.push(1);
      }

      if (updates.length === 0) {
        return this.getDeviceById(deviceId, businessProfileId);
      }

      values.push(deviceId, businessProfileId);

      await query(
        `UPDATE whatsapp_connections SET ${updates.join(', ')} WHERE id = ? AND business_profile_id = ?`,
        values
      );

      logger.info(`Device updated: ${deviceId}`);

      return this.getDeviceById(deviceId, businessProfileId);
    } catch (error: any) {
      logger.error('Error updating device:', error);
      throw error;
    }
  }

  /**
   * Delete a device (disconnect and remove)
   */
  async deleteDevice(deviceId: string, businessProfileId: string): Promise<void> {
    try {
      // Check if device exists
      const device = await this.getDeviceById(deviceId, businessProfileId);

      // Don't allow deleting the last device
      const deviceCount: any = await query(
        'SELECT COUNT(*) as count FROM whatsapp_connections WHERE business_profile_id = ?',
        [businessProfileId]
      );

      if (Array.isArray(deviceCount) && deviceCount[0]?.count <= 1) {
        throw new Error('Cannot delete the last device. Business must have at least one device.');
      }

      // If this was primary, make another device primary
      if (device.is_primary) {
        const otherDevices: any = await query(
          'SELECT id FROM whatsapp_connections WHERE business_profile_id = ? AND id != ? LIMIT 1',
          [businessProfileId, deviceId]
        );

        if (Array.isArray(otherDevices) && otherDevices.length > 0) {
          await query(
            'UPDATE whatsapp_connections SET is_primary = 1 WHERE id = ?',
            [otherDevices[0].id]
          );
        }
      }

      // Delete the device
      await query(
        'DELETE FROM whatsapp_connections WHERE id = ? AND business_profile_id = ?',
        [deviceId, businessProfileId]
      );

      logger.info(`Device deleted: ${deviceId}`);
    } catch (error: any) {
      logger.error('Error deleting device:', error);
      throw error;
    }
  }

  /**
   * Reconnect a device (regenerate QR code)
   */
  async reconnectDevice(deviceId: string, businessProfileId: string): Promise<void> {
    try {
      // Get device info
      const device = await this.getDeviceById(deviceId, businessProfileId);

      // Delete the existing WhatsApp connection and session to force new QR code
      await this.whatsappService.deleteConnection(businessProfileId, device.phone_number);

      // Initiate fresh WhatsApp connection
      await this.whatsappService.initializeConnection(businessProfileId, device.phone_number);

      logger.info(`Device reconnection initiated: ${deviceId}`);
    } catch (error: any) {
      logger.error('Error reconnecting device:', error);
      throw error;
    }
  }

  /**
   * Get device statistics
   */
  async getDeviceStats(deviceId: string, businessProfileId: string) {
    try {
      // Verify device belongs to business
      await this.getDeviceById(deviceId, businessProfileId);

      // Get message count
      const messageStats: any = await query(
        `SELECT
          COUNT(*) as total_messages,
          SUM(CASE WHEN direction = 'inbound' THEN 1 ELSE 0 END) as inbound_messages,
          SUM(CASE WHEN direction = 'outbound' THEN 1 ELSE 0 END) as outbound_messages
        FROM messages
        WHERE business_profile_id = ?`,
        [businessProfileId]
      );

      // Get AI conversation stats
      const aiStats: any = await query(
        `SELECT
          COUNT(*) as ai_conversations,
          SUM(tokens_used) as total_tokens_used
        FROM ai_conversations
        WHERE device_id = ?`,
        [deviceId]
      );

      return {
        messages: Array.isArray(messageStats) && messageStats[0] ? messageStats[0] : {},
        ai: Array.isArray(aiStats) && aiStats[0] ? aiStats[0] : {},
      };
    } catch (error: any) {
      logger.error('Error fetching device stats:', error);
      throw error;
    }
  }
}
