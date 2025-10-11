'use client';

import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { ApiEndpoint } from '@/components/docs/ApiEndpoint';

export default function DevicesDocsPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DocsSidebar />
      
      <div className="flex-1 p-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">📱 Device Management</h1>
        <p className="text-xl text-gray-600 mb-8">
          Monitor and manage your WhatsApp device connections
        </p>

        {/* List Devices */}
        <ApiEndpoint
          method="GET"
          path="/api/public/v1/devices"
          title="List Devices"
          description="Get all WhatsApp devices connected to your account."
          responseExample={`{
  "success": true,
  "data": [
    {
      "id": "device_abc123",
      "device_name": "Sales Line",
      "phone_number": "+94771234567",
      "status": "connected",
      "is_primary": true,
      "last_connected_at": "2025-10-11T09:00:00.000Z",
      "created_at": "2025-10-01T10:00:00.000Z"
    },
    {
      "id": "device_xyz789",
      "device_name": "Support Hotline",
      "phone_number": "+94777654321",
      "status": "disconnected",
      "is_primary": false,
      "last_connected_at": "2025-10-10T18:30:00.000Z",
      "created_at": "2025-10-01T10:00:00.000Z"
    }
  ]
}`}
        />

        {/* Get Device Status */}
        <ApiEndpoint
          method="GET"
          path="/api/public/v1/devices/:id/status"
          title="Get Device Status"
          description="Check the connection status of a specific device."
          responseExample={`{
  "success": true,
  "data": {
    "id": "device_abc123",
    "device_name": "Sales Line",
    "phone_number": "+94771234567",
    "status": "connected",
    "is_primary": true,
    "last_connected_at": "2025-10-11T09:00:00.000Z"
  }
}`}
        />

        {/* Device Statuses */}
        <section className="mt-12 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Device Statuses</h2>
          <p className="text-gray-700 mb-4">
            Devices can have the following connection statuses:
          </p>

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
                    <code className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">connected</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">Device is online and ready to send/receive</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded">qr_pending</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">Waiting for QR code scan</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">disconnected</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">Device is offline</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Important Notes */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Important Notes</h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>💡 Multi-Device Support:</strong> WhatsFlow supports multiple WhatsApp numbers. When sending messages, the system automatically selects the appropriate device based on conversation history.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-900">
                <strong>⚠️ Device Management:</strong> Device connection and disconnection is currently managed through the WhatsFlow dashboard. API-based device creation will be added in a future update.
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-900">
                <strong>🔔 Webhooks:</strong> Subscribe to <code className="bg-purple-100 px-1 rounded">device.connected</code> and <code className="bg-purple-100 px-1 rounded">device.disconnected</code> events to monitor connection status in real-time.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

