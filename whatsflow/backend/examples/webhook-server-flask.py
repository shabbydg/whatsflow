"""
WhatsFlow Webhook Server Example (Flask)

Complete example of receiving and processing WhatsFlow webhooks in Python

Setup:
    pip install flask

Usage:
    WEBHOOK_SECRET=whsec_your_secret python webhook-server-flask.py
"""

from flask import Flask, request, jsonify
import hmac
import hashlib
import json
import os
from datetime import datetime

app = Flask(__name__)

# Get webhook secret from environment
WEBHOOK_SECRET = os.environ.get('WEBHOOK_SECRET', '')

if not WEBHOOK_SECRET:
    print('❌ WEBHOOK_SECRET environment variable not set')
    print('Set it with: export WEBHOOK_SECRET=whsec_your_secret_here')
    exit(1)


def verify_webhook_signature(payload, signature, secret):
    """Verify webhook signature using HMAC-SHA256"""
    expected_hash = hmac.new(
        secret.encode('utf-8'),
        json.dumps(payload, separators=(',', ':')).encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    expected_signature = f'sha256={expected_hash}'
    
    # Timing-safe comparison
    return hmac.compare_digest(signature, expected_signature)


# Event handlers
def handle_message_received(data):
    """Handle incoming message"""
    print(f"\n📨 New message from {data.get('contact_name', data['phone_number'])}:")
    print(f"   Message: {data['message']}")
    print(f"   Device: {data.get('device_name', 'Unknown')}")
    
    # Example: Auto-respond to keywords
    message_lower = data['message'].lower()
    if 'hello' in message_lower:
        print('   → Auto-response triggered')
        # Call WhatsFlow API to send response
    
    # Example: Log to database
    # log_message_to_db(data)
    
    # Example: Create support ticket
    # if 'support' in message_lower or 'help' in message_lower:
    #     create_support_ticket(data)


def handle_message_sent(data):
    """Handle sent message confirmation"""
    print(f"\n📤 Message sent to {data['phone_number']}:")
    print(f"   Message ID: {data['message_id']}")
    print(f"   Status: {data['status']}")
    
    # Update status in your database
    # update_message_status(data['message_id'], 'sent')


def handle_message_delivered(data):
    """Handle message delivery confirmation"""
    print(f"\n✅ Message delivered: {data['message_id']}")
    
    # Update delivery status
    # update_message_status(data['message_id'], 'delivered')


def handle_message_failed(data):
    """Handle failed message"""
    print(f"\n❌ Message failed: {data['message_id']}")
    print(f"   Reason: {data.get('error_message', 'Unknown')}")
    
    # Alert admin or retry
    # send_admin_alert('Message delivery failed', data)


def handle_device_connected(data):
    """Handle device connection"""
    print(f"\n📱 Device connected: {data.get('device_name', 'Unknown')}")
    print(f"   Phone: {data['phone_number']}")
    
    # Clear disconnect alerts
    # clear_device_alerts(data['device_id'])


def handle_device_disconnected(data):
    """Handle device disconnection"""
    print(f"\n⚠️  Device disconnected: {data.get('device_name', 'Unknown')}")
    print(f"   Phone: {data['phone_number']}")
    print(f"   Reason: {data.get('reason', 'Unknown')}")
    
    # Send admin email alert
    # send_admin_email(
    #     subject='WhatsApp Device Disconnected',
    #     body=f"Device {data['device_name']} disconnected at {data['disconnected_at']}"
    # )


def handle_device_qr_updated(data):
    """Handle QR code update"""
    print(f"\n🔄 QR code updated for device: {data.get('device_name', 'Unknown')}")
    
    # Notify admin to re-scan
    # notify_admin_to_rescan(data['device_id'])


# Event handler mapping
EVENT_HANDLERS = {
    'message.received': handle_message_received,
    'message.sent': handle_message_sent,
    'message.delivered': handle_message_delivered,
    'message.failed': handle_message_failed,
    'device.connected': handle_device_connected,
    'device.disconnected': handle_device_disconnected,
    'device.qr_updated': handle_device_qr_updated,
}


@app.route('/webhooks/whatsflow', methods=['POST'])
def webhook():
    """Main webhook endpoint"""
    signature = request.headers.get('X-Webhook-Signature', '')
    delivery_id = request.headers.get('X-Webhook-Delivery-Id', '')
    event_type = request.headers.get('X-Webhook-Event', '')

    print(f"\n🔔 Webhook received:")
    print(f"   Event: {event_type}")
    print(f"   Delivery ID: {delivery_id}")

    # Verify signature
    if not signature or not verify_webhook_signature(request.json, signature, WEBHOOK_SECRET):
        print('❌ Invalid signature - rejecting webhook')
        return jsonify({'error': 'Invalid signature'}), 401

    print('✅ Signature verified')

    # Process event
    event = request.json
    
    try:
        handler = EVENT_HANDLERS.get(event['event'])
        
        if handler:
            handler(event['data'])
        else:
            print(f"⚠️  No handler for event: {event['event']}")

        # Always respond with 200 OK quickly
        return jsonify({'success': True, 'message': 'Webhook processed'}), 200

    except Exception as e:
        print(f'❌ Error processing webhook: {str(e)}')
        
        # Still return 200 to prevent retries for processing errors
        return jsonify({'success': False, 'error': str(e)}), 200


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
    })


@app.route('/test', methods=['POST'])
def test():
    """Test endpoint for debugging"""
    print('\n🧪 Test request received:')
    print('Headers:', dict(request.headers))
    print('Body:', request.json)
    return jsonify({'received': True})


if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3000))
    
    print('\n🚀 WhatsFlow Webhook Server Started')
    print('===================================')
    print(f'📡 Listening on port {PORT}')
    print(f'🔗 Webhook URL: http://localhost:{PORT}/webhooks/whatsflow')
    print(f'🔒 Secret configured: {"✅" if WEBHOOK_SECRET else "❌"}')
    print('')
    print('For local testing with WhatsFlow:')
    print('  1. Install ngrok: brew install ngrok')
    print('  2. Expose server: ngrok http 3000')
    print('  3. Copy HTTPS URL from ngrok')
    print('  4. Register in WhatsFlow: Settings → Webhooks')
    print('')
    print('Waiting for webhooks...\n')
    
    app.run(host='0.0.0.0', port=PORT, debug=True)

