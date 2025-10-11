'use client';

import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { ApiEndpoint } from '@/components/docs/ApiEndpoint';

export default function ContactsDocsPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DocsSidebar />
      
      <div className="flex-1 p-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">👥 Contacts API</h1>
        <p className="text-xl text-gray-600 mb-8">
          Access and manage your WhatsApp contacts
        </p>

        {/* List Contacts */}
        <ApiEndpoint
          method="GET"
          path="/api/public/v1/contacts"
          title="List Contacts"
          description="Get a paginated list of all contacts in your account."
          queryParams={[
            { name: 'page', type: 'integer', description: 'Page number (default: 1)' },
            { name: 'limit', type: 'integer', description: 'Items per page (default: 50, max: 100)' },
          ]}
          responseExample={`{
  "success": true,
  "data": {
    "contacts": [
      {
        "id": "contact_abc123",
        "phone_number": "+94771234567",
        "name": "John Doe",
        "profile_pic_url": "https://...",
        "is_business": false,
        "last_message_at": "2025-10-11T10:30:00.000Z",
        "total_messages": 45,
        "created_at": "2025-09-15T08:00:00.000Z"
      },
      {
        "id": "contact_xyz789",
        "phone_number": "+94777654321",
        "name": "Jane Smith",
        "is_business": true,
        "last_message_at": "2025-10-10T16:20:00.000Z",
        "total_messages": 23,
        "created_at": "2025-09-20T11:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 250,
      "pages": 5
    }
  }
}`}
        />

        {/* Get Contact */}
        <ApiEndpoint
          method="GET"
          path="/api/public/v1/contacts/:id"
          title="Get Contact"
          description="Retrieve detailed information about a specific contact."
          responseExample={`{
  "success": true,
  "data": {
    "id": "contact_abc123",
    "phone_number": "+94771234567",
    "name": "John Doe",
    "profile_pic_url": "https://...",
    "is_business": false,
    "first_message_at": "2025-09-15T08:00:00.000Z",
    "last_message_at": "2025-10-11T10:30:00.000Z",
    "total_messages": 45,
    "tags": ["vip", "customer"],
    "created_at": "2025-09-15T08:00:00.000Z"
  }
}`}
        />

        {/* Verify Contact */}
        <ApiEndpoint
          method="POST"
          path="/api/public/v1/contacts/verify"
          title="Verify Contact"
          description="Check if a phone number exists on WhatsApp (coming soon)."
          requestBody={`{
  "phone_number": "+94771234567"
}`}
          responseExample={`{
  "success": true,
  "data": {
    "phone_number": "+94771234567",
    "exists": true,
    "is_business": false
  }
}`}
        />

        {/* Contact Fields */}
        <section className="mt-12 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Fields</h2>
          
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Field</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-purple-600">id</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">string</td>
                  <td className="px-4 py-3 text-sm text-gray-700">Unique contact identifier</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-purple-600">phone_number</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">string</td>
                  <td className="px-4 py-3 text-sm text-gray-700">WhatsApp number with country code</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-purple-600">name</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">string</td>
                  <td className="px-4 py-3 text-sm text-gray-700">Contact display name</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-purple-600">profile_pic_url</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">string?</td>
                  <td className="px-4 py-3 text-sm text-gray-700">WhatsApp profile picture URL</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-purple-600">is_business</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">boolean</td>
                  <td className="px-4 py-3 text-sm text-gray-700">Whether this is a business account</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-purple-600">total_messages</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">integer</td>
                  <td className="px-4 py-3 text-sm text-gray-700">Total message count</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-purple-600">last_message_at</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">string</td>
                  <td className="px-4 py-3 text-sm text-gray-700">Timestamp of last message (ISO 8601)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Notes */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Notes</h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>💡 Auto-Sync:</strong> Contacts are automatically synchronized when messages are sent or received. You don't need to manually create contacts.
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-900">
                <strong>🔍 Search:</strong> Contact search functionality will be added in a future API update. For now, use pagination to retrieve all contacts.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

