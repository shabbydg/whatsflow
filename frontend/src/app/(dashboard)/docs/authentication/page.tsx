'use client';

import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { CodeBlock } from '@/components/docs/CodeBlock';
import Link from 'next/link';

export default function AuthenticationDocsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2152';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DocsSidebar />
      
      <div className="flex-1 p-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🔐 Authentication</h1>
        <p className="text-xl text-gray-600 mb-8">
          Secure your API requests with API key authentication
        </p>

        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
          <p className="text-gray-700 mb-4">
            All WhatsFlow API requests require authentication using an API key. API keys are unique to your account and should be kept secure.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              <strong>⚠️ Important:</strong> Never expose your API keys in client-side code, public repositories, or share them publicly. Treat them like passwords.
            </p>
          </div>
        </section>

        {/* Getting Your API Key */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Your API Key</h2>
          
          <ol className="space-y-4 text-gray-700">
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </span>
              <div className="flex-1">
                <p>
                  Navigate to{' '}
                  <Link href="/settings/api-keys" className="text-purple-600 hover:text-purple-700 font-medium">
                    Settings → API Keys
                  </Link>
                </p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </span>
              <div className="flex-1">
                <p>Click "Create API Key" and fill in the details</p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </span>
              <div className="flex-1">
                <p>Select the required permissions (scopes) for your integration</p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                4
              </span>
              <div className="flex-1">
                <p>Copy and securely store your API key (it's shown only once!)</p>
              </div>
            </li>
          </ol>
        </section>

        {/* API Key Format */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">API Key Format</h2>
          <p className="text-gray-700 mb-4">
            WhatsFlow API keys come in two environments:
          </p>
          
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-medium text-green-900 mb-2">Live Keys (Production)</p>
              <code className="text-sm text-green-800 font-mono">wf_live_a1b2c3d4e5f6...</code>
              <p className="text-sm text-green-700 mt-2">
                Use these keys for production integrations
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="font-medium text-yellow-900 mb-2">Test Keys (Development)</p>
              <code className="text-sm text-yellow-800 font-mono">wf_test_x1y2z3w4v5u6...</code>
              <p className="text-sm text-yellow-700 mt-2">
                Use these keys for testing and development
              </p>
            </div>
          </div>
        </section>

        {/* Making Authenticated Requests */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Making Authenticated Requests</h2>
          <p className="text-gray-700 mb-4">
            Include your API key in the <code className="bg-gray-100 px-2 py-1 rounded text-sm">Authorization</code> header using the Bearer scheme:
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">cURL Example</h3>
              <CodeBlock
                code={`curl -X POST '${baseUrl}/api/public/v1/messages/send' \\
  -H 'Authorization: Bearer wf_live_your_api_key_here' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "phone_number": "+94771234567",
    "message": "Hello!"
  }'`}
                language="bash"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">JavaScript Example</h3>
              <CodeBlock
                code={`const apiKey = 'wf_live_your_api_key_here';

const response = await fetch('${baseUrl}/api/public/v1/messages/send', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${apiKey}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    phone_number: '+94771234567',
    message: 'Hello from JavaScript!'
  })
});

const data = await response.json();
console.log(data);`}
                language="javascript"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Python Example</h3>
              <CodeBlock
                code={`import requests

api_key = 'wf_live_your_api_key_here'
url = '${baseUrl}/api/public/v1/messages/send'

headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json'
}

payload = {
    'phone_number': '+94771234567',
    'message': 'Hello from Python!'
}

response = requests.post(url, headers=headers, json=payload)
data = response.json()
print(data)`}
                language="python"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">PHP Example</h3>
              <CodeBlock
                code={`<?php
$apiKey = 'wf_live_your_api_key_here';
$url = '${baseUrl}/api/public/v1/messages/send';

$data = [
    'phone_number' => '+94771234567',
    'message' => 'Hello from PHP!'
];

$options = [
    'http' => [
        'header' => "Authorization: Bearer $apiKey\\r\\n" .
                    "Content-Type: application/json\\r\\n",
        'method' => 'POST',
        'content' => json_encode($data)
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);
$response = json_decode($result, true);

print_r($response);
?>`}
                language="php"
              />
            </div>
          </div>
        </section>

        {/* Scopes & Permissions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Scopes & Permissions</h2>
          <p className="text-gray-700 mb-4">
            API keys can be configured with specific scopes to limit access:
          </p>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Scope</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      messages:send
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">Send WhatsApp messages</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      messages:read
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">View message history and status</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      devices:read
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">View device information</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      devices:manage
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">Control device connections</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      contacts:read
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">View contact list</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      contacts:write
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">Create and update contacts</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      webhooks:manage
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">Configure webhooks</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Error Responses */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Errors</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">401 Unauthorized</h3>
              <p className="text-gray-700 mb-3">
                No API key provided or invalid API key
              </p>
              <CodeBlock
                code={`{
  "success": false,
  "error": "Invalid API key",
  "message": "The provided API key is invalid or has been revoked"
}`}
                language="json"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">403 Forbidden</h3>
              <p className="text-gray-700 mb-3">
                API key doesn't have the required scope
              </p>
              <CodeBlock
                code={`{
  "success": false,
  "error": "Insufficient permissions",
  "message": "This API key does not have the required scope",
  "requiredScopes": ["messages:send"]
}`}
                language="json"
              />
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices</h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="text-purple-600 text-xl">✓</span>
              <div>
                <p className="font-medium text-gray-900">Use environment variables</p>
                <p className="text-sm text-gray-600">Store API keys in environment variables, never hardcode them</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-purple-600 text-xl">✓</span>
              <div>
                <p className="font-medium text-gray-900">Rotate keys regularly</p>
                <p className="text-sm text-gray-600">Create new keys and delete old ones periodically</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-purple-600 text-xl">✓</span>
              <div>
                <p className="font-medium text-gray-900">Use minimal scopes</p>
                <p className="text-sm text-gray-600">Only grant permissions that your integration needs</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-purple-600 text-xl">✓</span>
              <div>
                <p className="font-medium text-gray-900">Use test keys for development</p>
                <p className="text-sm text-gray-600">Test your integration with test keys before going live</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-red-600 text-xl">✗</span>
              <div>
                <p className="font-medium text-gray-900">Never commit keys to version control</p>
                <p className="text-sm text-gray-600">Add .env files to .gitignore</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-red-600 text-xl">✗</span>
              <div>
                <p className="font-medium text-gray-900">Never use keys in client-side code</p>
                <p className="text-sm text-gray-600">API keys should only be used from your server</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

