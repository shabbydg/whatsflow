# Device Disconnect Email Alerts

## Overview

WhatsFlow can automatically send email alerts to users when their WhatsApp devices lose connection. This helps users stay informed about device status and take timely action to reconnect.

## Features

- **Per-Device Configuration**: Enable/disable email alerts for each device individually
- **Automatic Detection**: Monitors device connection status and triggers alerts on disconnect
- **Detailed Email Content**: Includes device name, phone number, and disconnect timestamp
- **HTML & Plain Text**: Emails are sent in both HTML and plain text formats
- **Placeholder Mode**: Currently logs emails to console (ready for real email service)

## How It Works

### 1. Enable Email Alerts

Users can enable email alerts for any device through the device settings:

1. Go to Settings → Devices
2. Click Edit on a device
3. Check "Email Alert on Disconnect"
4. Save changes

### 2. Disconnect Detection

The system detects disconnections in two scenarios:

**Scenario A: Max Reconnection Attempts Reached**
- Device loses connection (e.g., QR code expired, phone disconnected)
- System attempts to reconnect (up to 5 attempts with exponential backoff)
- If all reconnection attempts fail, device is marked as disconnected
- Email alert is sent to the user

**Scenario B: Device Logged Out**
- User manually logs out the device from WhatsApp
- Device is immediately marked as disconnected
- Email alert is sent to the user

### 3. Email Notification

When a device is disconnected, the system:

1. Checks if `email_on_disconnect` is enabled for the device
2. Retrieves the user's email address from the database
3. Sends a formatted email with:
   - Device details (name, phone number)
   - Disconnect timestamp
   - Link to reconnect the device
4. Logs the email send attempt

## Database Schema

```sql
-- Added to whatsapp_connections table
ALTER TABLE whatsapp_connections
ADD COLUMN email_on_disconnect BOOLEAN DEFAULT FALSE
COMMENT 'Send email alert when device disconnects';

CREATE INDEX idx_email_on_disconnect
ON whatsapp_connections(email_on_disconnect);
```

## Email Service Implementation

### Current Status: Placeholder Mode

The email service is currently in placeholder mode and logs emails to the console:

```
========================================
📧 EMAIL NOTIFICATION (PLACEHOLDER)
========================================
To: user@example.com
Subject: ⚠️ WhatsApp Device Disconnected - Main Device
----------------------------------------
Hi John,

Your WhatsApp device has been disconnected...
========================================
```

### Enabling Real Email Sending

To enable actual email sending, you need to:

1. **Choose an Email Service Provider**
   - **SendGrid**: Popular, easy integration, generous free tier
   - **AWS SES**: Cost-effective, requires domain verification
   - **Mailgun**: Developer-friendly, good API
   - **Nodemailer + SMTP**: Use any SMTP server (Gmail, custom)

2. **Set Environment Variables**

```env
# Enable email sending
EMAIL_ENABLED=true

# For SendGrid
SENDGRID_API_KEY=your-api-key-here

# For AWS SES
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# For Mailgun
MAILGUN_API_KEY=your-api-key
MAILGUN_DOMAIN=mg.yourdomain.com

# For SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# From address
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=WhatsFlow

# Frontend URL (for links in emails)
FRONTEND_URL=https://yourdomain.com
```

3. **Update Email Service**

Edit `src/services/email.service.ts` to implement actual sending:

**Example: SendGrid**
```typescript
import sgMail from '@sendgrid/mail';

constructor() {
  this.enabled = !!process.env.EMAIL_ENABLED;

  if (this.enabled) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }
}

private async sendEmail(options: EmailOptions): Promise<void> {
  if (this.enabled) {
    await sgMail.send({
      to: options.to,
      from: {
        email: process.env.EMAIL_FROM || 'noreply@whatsflow.com',
        name: process.env.EMAIL_FROM_NAME || 'WhatsFlow',
      },
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    logger.info(`Email sent to ${options.to}: ${options.subject}`);
  }
}
```

**Example: Nodemailer (SMTP)**
```typescript
import nodemailer from 'nodemailer';

private transporter: any;

constructor() {
  this.enabled = !!process.env.EMAIL_ENABLED;

  if (this.enabled) {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
}

private async sendEmail(options: EmailOptions): Promise<void> {
  if (this.enabled) {
    await this.transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    logger.info(`Email sent to ${options.to}: ${options.subject}`);
  }
}
```

## API Endpoints

### Update Device Settings

```http
PUT /api/v1/devices/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "device_name": "Main Device",
  "email_on_disconnect": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "device-uuid",
    "device_name": "Main Device",
    "email_on_disconnect": true,
    ...
  }
}
```

### Get Device Details

```http
GET /api/v1/devices/:id
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "device-uuid",
    "device_name": "Main Device",
    "email_on_disconnect": true,
    "status": "connected",
    ...
  }
}
```

## Email Template

The system sends a professionally formatted HTML email:

### Subject Line
```
⚠️ WhatsApp Device Disconnected - {Device Name}
```

### Email Content
- **Alert Box**: Highlights the disconnect event
- **Device Details**: Name, phone number, disconnect time
- **Call to Action**: Button linking to device reconnection page
- **Footer**: Automated notification disclaimer

### Sample Email Preview

![Email Preview](https://via.placeholder.com/600x400?text=Email+Preview)

## Testing

### Test Email Service

```bash
# Using the test endpoint (add to routes if needed)
curl -X POST http://localhost:5000/api/v1/email/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Simulate Device Disconnect

1. Connect a device with email alerts enabled
2. Force disconnect by:
   - Logging out from WhatsApp app
   - Deleting session files
   - Stopping the backend server
3. Check console logs for email placeholder
4. Verify email is sent when EMAIL_ENABLED=true

## Security Considerations

1. **Email Validation**: User emails are validated during registration
2. **Rate Limiting**: Prevent email spam (consider implementing)
3. **Unsubscribe**: Users can disable alerts per device
4. **Data Privacy**: Emails don't contain sensitive message content
5. **Authentication**: Only device owner receives alerts

## Monitoring

### Check Email Logs

```bash
# View email activity
tail -f logs/app.log | grep "Email sent"

# Count emails sent today
grep "$(date +%Y-%m-%d)" logs/app.log | grep "Email sent" | wc -l
```

### Database Queries

```sql
-- Count devices with email alerts enabled
SELECT COUNT(*) as alert_enabled_devices
FROM whatsapp_connections
WHERE email_on_disconnect = 1;

-- Devices disconnected recently with alerts
SELECT
  wc.device_name,
  wc.phone_number,
  wc.email_on_disconnect,
  wc.status,
  wc.updated_at
FROM whatsapp_connections wc
WHERE wc.status = 'disconnected'
  AND wc.email_on_disconnect = 1
  AND wc.updated_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR);
```

## Troubleshooting

### Emails Not Being Sent

1. **Check EMAIL_ENABLED**:
   ```bash
   echo $EMAIL_ENABLED  # Should be 'true'
   ```

2. **Check Logs**:
   ```bash
   tail -f logs/app.log | grep "disconnect alert"
   ```

3. **Verify Device Setting**:
   - Ensure `email_on_disconnect` is enabled in database
   - Check device edit form shows checkbox as checked

4. **Test Email Service**:
   ```typescript
   await emailService.sendTestEmail('your@email.com');
   ```

### Common Issues

**"Email service not configured"**
- Set EMAIL_ENABLED=true
- Configure email service provider credentials

**"User not found"**
- Verify user exists in database
- Check business_profile → user_id relationship

**"SMTP connection failed"**
- Verify SMTP credentials
- Check firewall rules
- Try different SMTP port (587 or 465)

**"SendGrid API error"**
- Verify API key is valid
- Check SendGrid account status
- Ensure sender email is verified

## Future Enhancements

1. **Email Preferences**: Per-user email settings
2. **Alert Types**: Different alerts (low battery, message failures)
3. **Email Templates**: Customizable templates
4. **Batch Digests**: Daily summary emails
5. **SMS Alerts**: Text message notifications
6. **Push Notifications**: In-app notifications
7. **Alert History**: Log all sent alerts
8. **Retry Logic**: Retry failed email sends

## Related Documentation

- [Device Management](./DEVICE_MANAGEMENT.md)
- [WhatsApp Service](./WHATSAPP_SERVICE.md)
- [API Reference](./API_REFERENCE.md)

---

For questions or issues, please create an issue on GitHub.
