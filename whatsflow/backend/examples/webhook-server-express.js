/**
 * WhatsFlow Webhook Server Example (Express.js)
 * 
 * Complete example of receiving and processing WhatsFlow webhooks
 * 
 * Setup:
 *   npm install express
 *   
 * Usage:
 *   WEBHOOK_SECRET=whsec_your_secret node webhook-server-express.js
 */

const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Get webhook secret from environment
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

if (!WEBHOOK_SECRET) {
  console.error('❌ WEBHOOK_SECRET environment variable not set');
  console.log('Set it with: export WEBHOOK_SECRET=whsec_your_secret_here');
  process.exit(1);
}

/**
 * Verify webhook signature
 */
function verifyWebhookSignature(payload, signature, secret) {
  const expectedHash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  const expectedSignature = `sha256=${expectedHash}`;

  // Timing-safe comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * Process different webhook events
 */
const eventHandlers = {
  'message.received': async (data) => {
    console.log(`\n📨 New message from ${data.contact_name || data.phone_number}:`);
    console.log(`   Message: ${data.message}`);
    console.log(`   Device: ${data.device_name}`);
    
    // Example: Auto-respond to specific keywords
    if (data.message.toLowerCase().includes('hello')) {
      console.log('   → Auto-response triggered');
      // You would call WhatsFlow API here to send response
    }
    
    // Example: Log to CRM
    // await logToCRM(data.phone_number, data.message);
    
    // Example: Create support ticket
    // if (data.message.toLowerCase().includes('support')) {
    //   await createSupportTicket(data);
    // }
  },

  'message.sent': async (data) => {
    console.log(`\n📤 Message sent to ${data.phone_number}:`);
    console.log(`   Message ID: ${data.message_id}`);
    console.log(`   Status: ${data.status}`);
    
    // Example: Update delivery status in your database
    // await updateMessageStatus(data.message_id, 'sent');
  },

  'message.delivered': async (data) => {
    console.log(`\n✅ Message delivered: ${data.message_id}`);
    
    // Example: Update delivery status
    // await updateMessageStatus(data.message_id, 'delivered');
  },

  'message.failed': async (data) => {
    console.log(`\n❌ Message failed: ${data.message_id}`);
    console.log(`   Reason: ${data.error_message}`);
    
    // Example: Alert admin or retry
    // await alertAdmin('Message delivery failed', data);
  },

  'device.connected': async (data) => {
    console.log(`\n📱 Device connected: ${data.device_name}`);
    console.log(`   Phone: ${data.phone_number}`);
    
    // Example: Clear any disconnect alerts
    // await clearDeviceAlerts(data.device_id);
  },

  'device.disconnected': async (data) => {
    console.log(`\n⚠️  Device disconnected: ${data.device_name}`);
    console.log(`   Phone: ${data.phone_number}`);
    console.log(`   Reason: ${data.reason}`);
    
    // Example: Send admin alert
    // await sendAdminEmail({
    //   subject: 'WhatsApp Device Disconnected',
    //   body: `Device ${data.device_name} disconnected at ${data.disconnected_at}`
    // });
  },

  'device.qr_updated': async (data) => {
    console.log(`\n🔄 QR code updated for device: ${data.device_name}`);
    
    // Example: Notify admin to re-scan
    // await notifyAdminToRescan(data.device_id);
  },
};

/**
 * Main webhook endpoint
 */
app.post('/webhooks/whatsflow', async (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const deliveryId = req.headers['x-webhook-delivery-id'];
  const eventType = req.headers['x-webhook-event'];

  console.log(`\n🔔 Webhook received:`);
  console.log(`   Event: ${eventType}`);
  console.log(`   Delivery ID: ${deliveryId}`);

  // Verify signature
  if (!signature || !verifyWebhookSignature(req.body, signature, WEBHOOK_SECRET)) {
    console.log('❌ Invalid signature - rejecting webhook');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  console.log('✅ Signature verified');

  // Get event data
  const event = req.body;

  try {
    // Process event
    const handler = eventHandlers[event.event];
    
    if (handler) {
      await handler(event.data);
    } else {
      console.log(`⚠️  No handler for event: ${event.event}`);
    }

    // Always respond with 200 OK quickly
    res.status(200).json({ success: true, message: 'Webhook processed' });

  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    
    // Still return 200 to prevent retries for processing errors
    res.status(200).json({ success: false, error: error.message });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Test endpoint (useful for debugging)
 */
app.post('/test', (req, res) => {
  console.log('\n🧪 Test request received:');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  res.json({ received: true });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('\n🚀 WhatsFlow Webhook Server Started');
  console.log('===================================');
  console.log(`📡 Listening on port ${PORT}`);
  console.log(`🔗 Webhook URL: http://localhost:${PORT}/webhooks/whatsflow`);
  console.log(`🔒 Secret configured: ${WEBHOOK_SECRET ? '✅' : '❌'}`);
  console.log('');
  console.log('For local testing with WhatsFlow:');
  console.log('  1. Install ngrok: brew install ngrok');
  console.log('  2. Expose server: ngrok http 3000');
  console.log('  3. Copy HTTPS URL from ngrok');
  console.log('  4. Register in WhatsFlow: Settings → Webhooks');
  console.log('');
  console.log('Waiting for webhooks...');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down webhook server...');
  process.exit(0);
});

