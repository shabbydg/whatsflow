/**
 * Email Service
 * Handles sending email notifications
 *
 * TODO: Implement actual email sending once domain is configured
 * Currently logs emails to console for development
 */

import logger from '../utils/logger.js';
import pool from '../config/database.js';
import { RowDataPacket } from 'mysql2';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface DeviceDisconnectOptions {
  deviceName: string;
  phoneNumber: string;
  disconnectedAt: Date;
}

export class EmailService {
  private enabled: boolean;

  constructor() {
    // Check if email service is configured
    this.enabled = !!process.env.EMAIL_ENABLED;

    if (!this.enabled) {
      logger.info('Email service is in placeholder mode. Set EMAIL_ENABLED=true to enable actual sending.');
    }
  }

  /**
   * Send email (placeholder implementation)
   */
  private async sendEmail(options: EmailOptions): Promise<void> {
    if (this.enabled) {
      // TODO: Implement actual email sending here
      // Options: SendGrid, AWS SES, Mailgun, Nodemailer with SMTP, etc.

      logger.info('Actual email sending not yet implemented');
      logger.info('Email would be sent:', {
        to: options.to,
        subject: options.subject,
      });
    } else {
      // Placeholder: Log email to console
      logger.info('========================================');
      logger.info('📧 EMAIL NOTIFICATION (PLACEHOLDER)');
      logger.info('========================================');
      logger.info(`To: ${options.to}`);
      logger.info(`Subject: ${options.subject}`);
      logger.info('----------------------------------------');
      logger.info(options.text);
      logger.info('========================================');
    }
  }

  /**
   * Send device disconnection alert email
   */
  async sendDeviceDisconnectAlert(
    userId: string,
    deviceId: string,
    options: DeviceDisconnectOptions
  ): Promise<void> {
    try {
      // Get user email
      const [users] = await pool.query<RowDataPacket[]>(
        'SELECT email, full_name FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        logger.error(`User not found: ${userId}`);
        return;
      }

      const user = users[0];
      const { email, full_name } = user;

      // Build email content
      const subject = `⚠️ WhatsApp Device Disconnected - ${options.deviceName}`;

      const text = `
Hi ${full_name || 'there'},

Your WhatsApp device has been disconnected and requires attention.

Device Details:
- Device Name: ${options.deviceName}
- Phone Number: ${options.phoneNumber}
- Disconnected At: ${options.disconnectedAt.toLocaleString()}

Action Required:
Please log in to your WhatsFlow dashboard to reconnect this device by scanning the QR code.

Best regards,
WhatsFlow Team

---
This is an automated notification from WhatsFlow.
`;

      const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #7c3aed; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .alert-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
    .device-info { background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .device-info h3 { margin-top: 0; color: #7c3aed; }
    .device-info p { margin: 8px 0; }
    .button { display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Device Disconnected</h1>
    </div>
    <div class="content">
      <p>Hi ${full_name || 'there'},</p>

      <div class="alert-box">
        <strong>Your WhatsApp device has been disconnected and requires attention.</strong>
      </div>

      <div class="device-info">
        <h3>Device Details</h3>
        <p><strong>Device Name:</strong> ${options.deviceName}</p>
        <p><strong>Phone Number:</strong> ${options.phoneNumber}</p>
        <p><strong>Disconnected At:</strong> ${options.disconnectedAt.toLocaleString()}</p>
      </div>

      <p><strong>Action Required:</strong></p>
      <p>Please log in to your WhatsFlow dashboard to reconnect this device by scanning the QR code.</p>

      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings/devices" class="button">
        Reconnect Device
      </a>

      <p>Best regards,<br>WhatsFlow Team</p>
    </div>
    <div class="footer">
      This is an automated notification from WhatsFlow.
    </div>
  </div>
</body>
</html>
`;

      // Send email
      await this.sendEmail({
        to: email,
        subject,
        text,
        html,
      });

      // Log notification
      logger.info(`Device disconnect email sent to ${email} for device ${deviceId}`);

    } catch (error) {
      logger.error('Error sending device disconnect email:', error);
      throw error;
    }
  }

  /**
   * Send test email (for testing the email service)
   */
  async sendTestEmail(to: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'WhatsFlow Email Test',
      text: 'This is a test email from WhatsFlow. If you received this, the email service is working correctly.',
      html: '<p>This is a test email from WhatsFlow. If you received this, the email service is working correctly.</p>',
    });
  }
}

export const emailService = new EmailService();
