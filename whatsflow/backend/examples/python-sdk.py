"""
WhatsFlow API SDK for Python

Simple Python SDK for integrating with WhatsFlow API

Installation:
    pip install requests

Usage:
    from whatsflow_sdk import WhatsFlowAPI
    
    api = WhatsFlowAPI('wf_live_your_api_key')
    result = api.send_message('+94771234567', 'Hello!')
    print(f"Message sent: {result['message_id']}")
"""

import requests
import hmac
import hashlib
import json
from typing import Dict, List, Optional, Any


class WhatsFlowAPI:
    """WhatsFlow API Client for Python"""

    def __init__(self, api_key: str, base_url: str = 'http://localhost:2152/api/public/v1'):
        """
        Initialize WhatsFlow API client
        
        Args:
            api_key: Your WhatsFlow API key (wf_live_xxx or wf_test_xxx)
            base_url: API base URL
        """
        if not api_key:
            raise ValueError('API key is required')

        if not api_key.startswith('wf_live_') and not api_key.startswith('wf_test_'):
            raise ValueError('Invalid API key format. Must start with wf_live_ or wf_test_')

        self.api_key = api_key
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        })

    def _request(self, method: str, endpoint: str, **kwargs) -> Dict:
        """Make API request with error handling"""
        url = f'{self.base_url}{endpoint}'
        
        try:
            response = self.session.request(method, url, **kwargs)
            
            # Check rate limits
            remaining = response.headers.get('X-RateLimit-Remaining')
            limit = response.headers.get('X-RateLimit-Limit')
            
            if remaining and int(remaining) < 10:
                print(f'⚠️  Low rate limit: {remaining}/{limit} remaining')

            # Handle rate limiting
            if response.status_code == 429:
                data = response.json()
                retry_after = data.get('retryAfter', 60)
                raise Exception(f"Rate limited. Retry after {retry_after} seconds")

            response.raise_for_status()
            return response.json()

        except requests.exceptions.HTTPError as e:
            data = e.response.json() if e.response else {}
            error_msg = data.get('message', data.get('error', str(e)))
            
            if e.response.status_code == 401:
                raise Exception(f'Authentication failed: {error_msg}')
            elif e.response.status_code == 403:
                raise Exception(f'Permission denied: {error_msg}')
            else:
                raise Exception(f'API error ({e.response.status_code}): {error_msg}')

        except requests.exceptions.RequestException as e:
            raise Exception(f'Network error: {str(e)}')

    # ==================== Messaging ====================

    def send_message(self, phone_number: str, message: str) -> Dict:
        """
        Send a WhatsApp message
        
        Args:
            phone_number: Recipient phone number with country code
            message: Message text to send
            
        Returns:
            Message details including message_id
        """
        data = {
            'phone_number': phone_number,
            'message': message,
        }
        result = self._request('POST', '/messages/send', json=data)
        return result['data']

    def get_message_status(self, message_id: str) -> Dict:
        """
        Get message status
        
        Args:
            message_id: Message ID
            
        Returns:
            Message details and status
        """
        result = self._request('GET', f'/messages/{message_id}')
        return result['data']

    def list_messages(self, page: int = 1, limit: int = 50, contact_id: Optional[str] = None) -> Dict:
        """
        List messages with pagination
        
        Args:
            page: Page number
            limit: Items per page (max 100)
            contact_id: Optional contact ID filter
            
        Returns:
            Dict with 'data' (messages) and 'pagination' info
        """
        params = {'page': page, 'limit': min(limit, 100)}
        if contact_id:
            params['contact_id'] = contact_id

        return self._request('GET', '/messages', params=params)

    # ==================== Devices ====================

    def list_devices(self) -> List[Dict]:
        """
        List all connected devices
        
        Returns:
            Array of device objects
        """
        result = self._request('GET', '/devices')
        return result['data']

    def get_device_status(self, device_id: str) -> Dict:
        """
        Get device status
        
        Args:
            device_id: Device ID
            
        Returns:
            Device status information
        """
        result = self._request('GET', f'/devices/{device_id}/status')
        return result['data']

    # ==================== Contacts ====================

    def list_contacts(self, page: int = 1, limit: int = 50) -> Dict:
        """
        List contacts with pagination
        
        Args:
            page: Page number
            limit: Items per page (max 100)
            
        Returns:
            Dict with 'contacts' and 'pagination' info
        """
        params = {'page': page, 'limit': min(limit, 100)}
        return self._request('GET', '/contacts', params=params)

    def get_contact(self, contact_id: str) -> Dict:
        """
        Get contact details
        
        Args:
            contact_id: Contact ID
            
        Returns:
            Contact details
        """
        result = self._request('GET', f'/contacts/{contact_id}')
        return result['data']

    def verify_contact(self, phone_number: str) -> Dict:
        """
        Verify if phone number exists on WhatsApp
        
        Args:
            phone_number: Phone number to verify
            
        Returns:
            Verification result
        """
        data = {'phone_number': phone_number}
        result = self._request('POST', '/contacts/verify', json=data)
        return result['data']

    # ==================== Webhooks ====================

    def list_webhooks(self) -> List[Dict]:
        """
        List all configured webhooks
        
        Returns:
            Array of webhook configurations
        """
        result = self._request('GET', '/webhooks')
        return result['data']

    def create_webhook(self, url: str, events: List[str], description: str = '') -> Dict:
        """
        Create a new webhook
        
        Args:
            url: Webhook endpoint URL
            events: List of events to subscribe to
            description: Optional description
            
        Returns:
            Webhook details including secret (shown once)
        """
        data = {
            'url': url,
            'events': events,
            'description': description,
        }
        result = self._request('POST', '/webhooks', json=data)
        
        print(f"⚠️  Save this webhook secret: {result['data']['secret']}")
        return result['data']

    def update_webhook(self, webhook_id: str, updates: Dict) -> Dict:
        """
        Update webhook configuration
        
        Args:
            webhook_id: Webhook ID
            updates: Fields to update
            
        Returns:
            Updated webhook details
        """
        result = self._request('PUT', f'/webhooks/{webhook_id}', json=updates)
        return result['data']

    def delete_webhook(self, webhook_id: str) -> Dict:
        """
        Delete a webhook
        
        Args:
            webhook_id: Webhook ID
            
        Returns:
            Deletion confirmation
        """
        return self._request('DELETE', f'/webhooks/{webhook_id}')

    def test_webhook(self, webhook_id: str) -> Dict:
        """
        Send test event to webhook
        
        Args:
            webhook_id: Webhook ID
            
        Returns:
            Test confirmation
        """
        return self._request('POST', f'/webhooks/{webhook_id}/test')

    def get_webhook_deliveries(self, webhook_id: str, limit: int = 50) -> List[Dict]:
        """
        Get webhook delivery logs
        
        Args:
            webhook_id: Webhook ID
            limit: Number of deliveries to retrieve
            
        Returns:
            Array of delivery logs
        """
        params = {'limit': min(limit, 100)}
        result = self._request('GET', f'/webhooks/{webhook_id}/deliveries', params=params)
        return result['data']

    # ==================== Utilities ====================

    @staticmethod
    def verify_webhook_signature(payload: Dict, signature: str, secret: str) -> bool:
        """
        Verify webhook signature
        
        Args:
            payload: Webhook payload (dict)
            signature: X-Webhook-Signature header value
            secret: Webhook secret
            
        Returns:
            True if signature is valid
        """
        expected = hmac.new(
            secret.encode('utf-8'),
            json.dumps(payload, separators=(',', ':')).encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        expected_signature = f'sha256={expected}'

        # Timing-safe comparison
        return hmac.compare_digest(signature, expected_signature)


# Example usage
if __name__ == '__main__':
    # Initialize API
    api = WhatsFlowAPI('wf_live_your_key_here')

    # Send message
    result = api.send_message('+94771234567', 'Hello from Python SDK!')
    print(f"✅ Message sent: {result['message_id']}")

    # List devices
    devices = api.list_devices()
    connected = [d for d in devices if d['status'] == 'connected']
    print(f"📱 Connected devices: {len(connected)}")

    # List contacts
    contacts_data = api.list_contacts(page=1, limit=10)
    print(f"👥 Total contacts: {contacts_data['pagination']['total']}")

    # Create webhook
    webhook = api.create_webhook(
        url='https://your-domain.com/webhooks/whatsflow',
        events=['message.received', 'device.disconnected'],
        description='Production webhook'
    )
    print(f"🔔 Webhook created: {webhook['id']}")

