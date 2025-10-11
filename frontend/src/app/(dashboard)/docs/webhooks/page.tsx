'use client';

import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { ApiEndpoint } from '@/components/docs/ApiEndpoint';
import { CodeBlock } from '@/components/docs/CodeBlock';
import Link from 'next/link';

export default function WebhooksDocsPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DocsSidebar />
      
      <div className="flex-1 p-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🔔 Webhooks</h1>
        <p className="text-xl text-gray-600 mb-8">
          Receive real-time notifications for WhatsApp events
        </p>

        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
          <p className="text-gray-700 mb-4">
            Webhooks allow your application to receive real-time notifications when events occur in WhatsFlow. Instead of polling for updates, WhatsFlow will send HTTP POST requests to your configured endpoint.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>💡 Tip:</strong> Set up webhooks in{' '}
              <Link href="/settings/webhooks" className="text-blue-700 hover:text-blue-800 font-medium underline">
                Settings → Webhooks
              </Link>
            </p>
          </div>
        </section>

        {/* Available Events */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Events</h2>
          
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Event</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      message.received
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">When an inbound message is received</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      message.sent
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">When an outbound message is sent</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      message.delivered
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">When a message is delivered</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      message.failed
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">When a message fails to send</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      device.connected
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">When a device connects successfully</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      device.disconnected
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">When a device loses connection</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      device.qr_updated
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">When a new QR code is generated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Webhook Payload */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Webhook Payload Format</h2>
          <p className="text-gray-700 mb-4">
            All webhook events are sent as HTTP POST requests with the following structure:
          </p>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Headers</h3>
            <CodeBlock
              code={`Content-Type: application/json
X-Webhook-Event: message.received
X-Webhook-Signature: sha256=abc123...
X-Webhook-Delivery-Id: delivery_xyz789
User-Agent: WhatsFlow-Webhooks/1.0`}
              language="text"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Example: message.received</h3>
            <CodeBlock
              code={`{
  "event": "message.received",
  "timestamp": "2025-10-11T10:30:00.000Z",
  "data": {
    "message_id": "msg_abc123",
    "contact_id": "contact_xyz789",
    "phone_number": "+94771234567",
    "contact_name": "John Doe",
    "message": "Hi, I need help with my order",
    "message_type": "text",
    "device_id": "device_123",
    "device_name": "Main Line",
    "created_at": "2025-10-11T10:30:00.000Z"
  }
}`}
              language="json"
            />
          </div>
        </section>

        {/* Signature Verification */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Signature Verification</h2>
          <p className="text-gray-700 mb-4">
            Every webhook includes an <code className="bg-gray-100 px-2 py-1 rounded text-sm">X-Webhook-Signature</code> header. Verify this signature to ensure the webhook came from WhatsFlow.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Node.js / JavaScript</h3>
              <CodeBlock
                code={`const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  const expected = \`sha256=\${expectedSignature}\`;
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// In your webhook endpoint
app.post('/webhooks/whatsflow', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.WHATSFLOW_WEBHOOK_SECRET;
  
  if (!verifyWebhookSignature(req.body, signature, secret)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook...
  res.status(200).send('OK');
});`}
                language="javascript"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Python</h3>
              <CodeBlock
                code={`import hmac
import hashlib
import json

def verify_webhook_signature(payload, signature, secret):
    expected = hmac.new(
        secret.encode('utf-8'),
        json.dumps(payload).encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    expected_signature = f'sha256={expected}'
    return hmac.compare_digest(signature, expected_signature)

# In your Flask webhook endpoint
@app.route('/webhooks/whatsflow', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Webhook-Signature')
    secret = os.environ['WHATSFLOW_WEBHOOK_SECRET']
    
    if not verify_webhook_signature(request.json, signature, secret):
        return 'Invalid signature', 401
    
    # Process webhook...
    return 'OK', 200`}
                language="python"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">PHP</h3>
              <CodeBlock
                code={`<?php
function verifyWebhookSignature($payload, $signature, $secret) {
    $expected = hash_hmac(
        'sha256',
        json_encode($payload),
        $secret
    );
    
    $expectedSignature = 'sha256=' . $expected;
    return hash_equals($signature, $expectedSignature);
}

// In your webhook endpoint
$signature = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'];
$secret = getenv('WHATSFLOW_WEBHOOK_SECRET');
$payload = json_decode(file_get_contents('php://input'), true);

if (!verifyWebhookSignature($payload, $signature, $secret)) {
    http_response_code(401);
    die('Invalid signature');
}

// Process webhook...
http_response_code(200);
echo 'OK';
?>`}
                language="php"
              />
            </div>
          </div>
        </section>

        {/* Webhook Management */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Webhook Management</h2>

          <ApiEndpoint
            method="POST"
            path="/api/public/v1/webhooks"
            title="Create Webhook"
            description="Register a new webhook endpoint to receive events."
            requestBody={`{
  "url": "https://your-domain.com/webhooks/whatsflow",
  "events": ["message.received", "device.disconnected"],
  "description": "Production webhook"
}`}
            responseExample={`{
  "success": true,
  "data": {
    "id": "webhook_abc123",
    "url": "https://your-domain.com/webhooks/whatsflow",
    "secret": "whsec_abc123xyz789...",
    "events": ["message.received", "device.disconnected"],
    "is_active": true,
    "created_at": "2025-10-11T10:00:00.000Z"
  },
  "message": "Webhook created successfully. Save the secret - it will not be shown again."
}`}
          />

          <ApiEndpoint
            method="GET"
            path="/api/public/v1/webhooks"
            title="List Webhooks"
            description="Get all configured webhooks for your account."
            responseExample={`{
  "success": true,
  "data": [
    {
      "id": "webhook_abc123",
      "url": "https://your-domain.com/webhooks/whatsflow",
      "events": ["message.received", "device.disconnected"],
      "is_active": true,
      "success_count": 1234,
      "failure_count": 5,
      "last_triggered_at": "2025-10-11T10:30:00.000Z"
    }
  ]
}`}
          />

          <ApiEndpoint
            method="DELETE"
            path="/api/public/v1/webhooks/:id"
            title="Delete Webhook"
            description="Remove a webhook configuration."
            responseExample={`{
  "success": true,
  "message": "Webhook deleted successfully"
}`}
          />

          <ApiEndpoint
            method="POST"
            path="/api/public/v1/webhooks/:id/test"
            title="Test Webhook"
            description="Send a test event to your webhook endpoint to verify it's working."
            responseExample={`{
  "success": true,
  "message": "Test webhook queued for delivery"
}`}
          />
        </section>

        {/* Best Practices */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices</h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="text-purple-600 text-xl">✓</span>
              <div>
                <p className="font-medium text-gray-900">Always verify signatures</p>
                <p className="text-sm text-gray-600">Validate the X-Webhook-Signature header to ensure authenticity</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-purple-600 text-xl">✓</span>
              <div>
                <p className="font-medium text-gray-900">Respond quickly</p>
                <p className="text-sm text-gray-600">Return a 200 response within 30 seconds. Process events asynchronously</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-purple-600 text-xl">✓</span>
              <div>
                <p className="font-medium text-gray-900">Handle retries gracefully</p>
                <p className="text-sm text-gray-600">Make your endpoints idempotent. Use the delivery ID to detect duplicates</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-purple-600 text-xl">✓</span>
              <div>
                <p className="font-medium text-gray-900">Use HTTPS</p>
                <p className="text-sm text-gray-600">Webhook URLs must use HTTPS in production</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-purple-600 text-xl">✓</span>
              <div>
                <p className="font-medium text-gray-900">Test before going live</p>
                <p className="text-sm text-gray-600">Use the test webhook feature to verify your endpoint</p>
              </div>
            </div>
          </div>
        </section>

        {/* Retry Logic */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Retry Logic</h2>
          <p className="text-gray-700 mb-4">
            If your webhook endpoint fails or times out, WhatsFlow will automatically retry with exponential backoff:
          </p>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <ul className="space-y-2 text-gray-700">
              <li><strong>Attempt 1:</strong> Immediate</li>
              <li><strong>Attempt 2:</strong> After 2 seconds</li>
              <li><strong>Attempt 3:</strong> After 4 seconds</li>
              <li><strong>Attempt 4:</strong> After 8 seconds</li>
              <li><strong>Attempt 5:</strong> After 16 seconds (final attempt)</li>
            </ul>
          </div>

          <p className="text-sm text-gray-600 mt-4">
            After 5 failed attempts, the delivery will be marked as failed. You can view failed deliveries in the webhook management interface.
          </p>
        </section>
      </div>
    </div>
  );
}

