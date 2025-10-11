'use client';

import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { CodeBlock } from '@/components/docs/CodeBlock';
import Link from 'next/link';

export default function RateLimitsDocsPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DocsSidebar />
      
      <div className="flex-1 p-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">⚡ Rate Limits</h1>
        <p className="text-xl text-gray-600 mb-8">
          Understand API rate limits and how they apply to your plan
        </p>

        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
          <p className="text-gray-700 mb-4">
            Rate limits protect WhatsFlow's infrastructure and ensure fair usage. Limits are based on your subscription plan and are measured per minute.
          </p>
        </section>

        {/* Rate Limit Tiers */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Rate Limit Tiers</h2>
          
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Plan</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Requests/Minute</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Requests/Hour</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900">Trial</td>
                  <td className="px-4 py-3 text-sm text-gray-700">10</td>
                  <td className="px-4 py-3 text-sm text-gray-700">600</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900">Starter</td>
                  <td className="px-4 py-3 text-sm text-gray-700">30</td>
                  <td className="px-4 py-3 text-sm text-gray-700">1,800</td>
                </tr>
                <tr className="bg-purple-50">
                  <td className="px-4 py-3 font-medium text-gray-900">Professional</td>
                  <td className="px-4 py-3 text-sm text-gray-700">100</td>
                  <td className="px-4 py-3 text-sm text-gray-700">6,000</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900">Business</td>
                  <td className="px-4 py-3 text-sm text-gray-700">300</td>
                  <td className="px-4 py-3 text-sm text-gray-700">18,000</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900">Enterprise</td>
                  <td className="px-4 py-3 text-sm text-gray-700">1,000</td>
                  <td className="px-4 py-3 text-sm text-gray-700">60,000</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-sm text-gray-600 mt-4">
            Need higher limits?{' '}
            <Link href="/billing/plans" className="text-purple-600 hover:text-purple-700 font-medium">
              Upgrade your plan
            </Link>{' '}
            or contact support for custom limits.
          </p>
        </section>

        {/* Rate Limit Headers */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Rate Limit Headers</h2>
          <p className="text-gray-700 mb-4">
            All API responses include rate limit information in the headers:
          </p>

          <CodeBlock
            code={`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1696852860`}
            language="text"
          />

          <div className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Header</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-purple-600">X-RateLimit-Limit</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">Maximum requests allowed in the time window</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-purple-600">X-RateLimit-Remaining</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">Number of requests remaining in current window</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="text-sm text-purple-600">X-RateLimit-Reset</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">Unix timestamp when the rate limit resets</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 429 Response */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Rate Limit Exceeded</h2>
          <p className="text-gray-700 mb-4">
            When you exceed the rate limit, you'll receive a <code className="bg-gray-100 px-2 py-1 rounded text-sm">429 Too Many Requests</code> response:
          </p>

          <CodeBlock
            code={`{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "You have exceeded the rate limit of 100 requests per minute for your professional plan",
  "retryAfter": 45
}`}
            language="json"
          />

          <p className="text-sm text-gray-600 mt-4">
            The <code className="bg-gray-100 px-1 rounded">retryAfter</code> field indicates how many seconds to wait before retrying.
          </p>
        </section>

        {/* Handling Rate Limits */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Handling Rate Limits</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">JavaScript Example</h3>
            <CodeBlock
              code={`async function makeAPIRequest(url, options) {
  const response = await fetch(url, options);
  
  // Check rate limit headers
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');
  
  if (response.status === 429) {
    const data = await response.json();
    console.log(\`Rate limited. Retry after \${data.retryAfter} seconds\`);
    
    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, data.retryAfter * 1000));
    return makeAPIRequest(url, options);
  }
  
  // Warn if close to limit
  if (parseInt(remaining) < 10) {
    console.warn(\`Only \${remaining} requests remaining\`);
  }
  
  return response.json();
}`}
              language="javascript"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Python Example</h3>
            <CodeBlock
              code={`import time
import requests

def make_api_request(url, headers, data=None):
    response = requests.post(url, headers=headers, json=data)
    
    # Check rate limit headers
    remaining = int(response.headers.get('X-RateLimit-Remaining', 0))
    reset = int(response.headers.get('X-RateLimit-Reset', 0))
    
    if response.status_code == 429:
        data = response.json()
        retry_after = data.get('retryAfter', 60)
        print(f"Rate limited. Waiting {retry_after} seconds...")
        time.sleep(retry_after)
        return make_api_request(url, headers, data)
    
    # Warn if close to limit
    if remaining < 10:
        print(f"Warning: Only {remaining} requests remaining")
    
    return response.json()`}
              language="python"
            />
          </div>
        </section>

        {/* Best Practices */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices</h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="text-purple-600 text-xl">✓</span>
              <div>
                <p className="font-medium text-gray-900">Monitor rate limit headers</p>
                <p className="text-sm text-gray-600">Check X-RateLimit-Remaining to avoid hitting limits</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-purple-600 text-xl">✓</span>
              <div>
                <p className="font-medium text-gray-900">Implement exponential backoff</p>
                <p className="text-sm text-gray-600">When rate limited, wait before retrying</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-purple-600 text-xl">✓</span>
              <div>
                <p className="font-medium text-gray-900">Batch operations when possible</p>
                <p className="text-sm text-gray-600">Reduce API calls by combining operations</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-purple-600 text-xl">✓</span>
              <div>
                <p className="font-medium text-gray-900">Cache responses appropriately</p>
                <p className="text-sm text-gray-600">Don't repeatedly fetch data that changes infrequently</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-purple-600 text-xl">✓</span>
              <div>
                <p className="font-medium text-gray-900">Use webhooks for real-time updates</p>
                <p className="text-sm text-gray-600">Webhooks don't count against rate limits</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

