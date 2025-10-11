'use client';

import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { ApiEndpoint } from '@/components/docs/ApiEndpoint';
import { CodeBlock } from '@/components/docs/CodeBlock';

export default function MessagingDocsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2152';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DocsSidebar />
      
      <div className="flex-1 p-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">📬 Messaging API</h1>
        <p className="text-xl text-gray-600 mb-8">
          Send and manage WhatsApp messages programmatically
        </p>

        {/* Send Message */}
        <ApiEndpoint
          method="POST"
          path="/api/public/v1/messages/send"
          title="Send Message"
          description="Send a text message to a WhatsApp number. The message will be sent from one of your connected devices."
          requestBody={`{
  "phone_number": "+94771234567",
  "message": "Hello! How can we help you today?"
}`}
          responseExample={`{
  "success": true,
  "data": {
    "message_id": "msg_abc123xyz",
    "phone_number": "+94771234567",
    "message": "Hello! How can we help you today?",
    "status": "sent",
    "timestamp": "2025-10-11T10:30:00.000Z"
  }
}`}
        />

        {/* Get Message Status */}
        <ApiEndpoint
          method="GET"
          path="/api/public/v1/messages/:id"
          title="Get Message Status"
          description="Retrieve the status and details of a specific message."
          responseExample={`{
  "success": true,
  "data": {
    "id": "msg_abc123xyz",
    "phone_number": "+94771234567",
    "contact_name": "John Doe",
    "direction": "outbound",
    "message_type": "text",
    "content": "Hello! How can we help you today?",
    "status": "delivered",
    "created_at": "2025-10-11T10:30:00.000Z"
  }
}`}
        />

        {/* List Messages */}
        <ApiEndpoint
          method="GET"
          path="/api/public/v1/messages"
          title="List Messages"
          description="Get a paginated list of recent messages. Optionally filter by contact."
          queryParams={[
            { name: 'page', type: 'integer', description: 'Page number (default: 1)' },
            { name: 'limit', type: 'integer', description: 'Items per page (default: 50, max: 100)' },
            { name: 'contact_id', type: 'string', description: 'Filter by specific contact ID' },
          ]}
          responseExample={`{
  "success": true,
  "data": [
    {
      "id": "msg_abc123",
      "phone_number": "+94771234567",
      "contact_name": "John Doe",
      "direction": "inbound",
      "content": "Hi, I need help",
      "created_at": "2025-10-11T10:25:00.000Z"
    },
    {
      "id": "msg_xyz789",
      "phone_number": "+94771234567",
      "contact_name": "John Doe",
      "direction": "outbound",
      "content": "Hello! How can we help you?",
      "created_at": "2025-10-11T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 2,
    "pages": 1
  }
}`}
        />

        {/* Message Statuses */}
        <section className="mt-12 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Message Statuses</h2>
          <p className="text-gray-700 mb-4">Messages can have the following statuses:</p>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">pending</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">Message queued for sending</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">sent</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">Message sent to WhatsApp</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">delivered</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">Message delivered to recipient</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded">read</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">Message read by recipient</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">failed</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">Message failed to send</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Phone Number Format */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Phone Number Format</h2>
          <p className="text-gray-700 mb-4">
            Always include the country code with phone numbers:
          </p>

          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">✅</span>
              <div>
                <code className="text-green-600 font-mono">+94771234567</code>
                <p className="text-sm text-gray-600">Correct - with country code</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">✅</span>
              <div>
                <code className="text-green-600 font-mono">94771234567</code>
                <p className="text-sm text-gray-600">Also acceptable</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">❌</span>
              <div>
                <code className="text-red-600 font-mono">0771234567</code>
                <p className="text-sm text-gray-600">Missing country code</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

