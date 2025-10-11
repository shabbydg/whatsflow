'use client';

import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { Rocket, MessageSquare, Globe, Lock, Zap } from 'lucide-react';
import Link from 'next/link';

export default function DocsIntroPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2152';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DocsSidebar />
      
      <div className="flex-1 p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🚀 WhatsFlow API</h1>
          <p className="text-xl text-gray-600">
            Developer-friendly WhatsApp Business API for seamless integration
          </p>
        </div>

        {/* What Makes WhatsFlow Special */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">✨ What makes WhatsFlow Special?</h2>
          <p className="text-gray-700 mb-6">
            Enterprise-grade WhatsApp API with AI-powered features, multi-device support, and real-time webhooks designed for businesses of all sizes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard
              icon={<MessageSquare className="w-6 h-6" />}
              title="Rich Messaging"
              features={[
                'Text messages with formatting',
                'Images with captions',
                'Documents and files',
                'Location sharing',
                'AI-powered auto-replies',
              ]}
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Multi-Device Support"
              features={[
                'Multiple WhatsApp numbers',
                'QR code authentication',
                'Device status monitoring',
                'Auto-reconnection',
                'Session management',
              ]}
            />
            <FeatureCard
              icon={<Lock className="w-6 h-6" />}
              title="Enterprise Security"
              features={[
                'API key authentication',
                'Scope-based permissions',
                'Rate limiting protection',
                'Webhook signatures',
                'Secure data handling',
              ]}
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6" />}
              title="Developer Tools"
              features={[
                'RESTful API',
                'Real-time webhooks',
                'Comprehensive docs',
                'Code examples',
                'Test environment',
              ]}
            />
          </div>
        </section>

        {/* Base URL */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🌐 Base URL</h2>
          <CodeBlock 
            code={`${baseUrl}/api/public/v1`}
            language="text"
          />
        </section>

        {/* Quick Start */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🚀 Quick Start</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Get Your API Key</h3>
              <p className="text-gray-700 mb-3">
                Navigate to <Link href="/settings/api-keys" className="text-purple-600 hover:text-purple-700 font-medium">Settings → API Keys</Link> and create a new API key with the required scopes.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Make Your First Request</h3>
              <p className="text-gray-700 mb-3">All API requests require authentication:</p>
              <CodeBlock
                code={`curl -H 'Authorization: Bearer YOUR_API_KEY' \\
     -H 'Content-Type: application/json' \\
     -H 'Accept: application/json' \\
     ${baseUrl}/api/public/v1/devices`}
                language="bash"
                title="List Your Devices"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Send Your First Message</h3>
              <CodeBlock
                code={`curl -X POST '${baseUrl}/api/public/v1/messages/send' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "phone_number": "+94771234567",
    "message": "Hello from WhatsFlow API!"
  }'`}
                language="bash"
                title="Send a Message"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Handle Responses</h3>
              <p className="text-gray-700 mb-3">All successful responses follow this format:</p>
              <CodeBlock
                code={`{
  "success": true,
  "data": {
    "message_id": "msg_abc123",
    "phone_number": "+94771234567",
    "message": "Hello from WhatsFlow API!",
    "status": "sent",
    "timestamp": "2025-10-11T10:30:00.000Z"
  }
}`}
                language="json"
              />
            </div>
          </div>
        </section>

        {/* API Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">API Features</h2>
          
          <div className="space-y-4">
            <FeatureSection
              title="📬 Messaging"
              items={[
                'Send text messages',
                'Get message status and history',
                'Real-time delivery notifications',
              ]}
            />
            <FeatureSection
              title="📱 Device Management"
              items={[
                'List connected devices',
                'Check device status',
                'Monitor connection health',
              ]}
            />
            <FeatureSection
              title="👥 Contact Management"
              items={[
                'List and search contacts',
                'Get contact details',
                'Verify WhatsApp numbers',
              ]}
            />
            <FeatureSection
              title="🔔 Webhooks"
              items={[
                'Real-time event notifications',
                'Configurable event subscriptions',
                'Automatic retry with backoff',
                'Signature verification',
              ]}
            />
          </div>
        </section>

        {/* Response Format */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Response Format</h2>
          <p className="text-gray-700 mb-4">All API responses follow a consistent format:</p>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Success Response</h3>
              <CodeBlock
                code={`{
  "success": true,
  "data": {
    // Response data here
  }
}`}
                language="json"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Response</h3>
              <CodeBlock
                code={`{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}`}
                language="json"
              />
            </div>
          </div>
        </section>

        {/* Rate Limits */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Rate Limits</h2>
          <p className="text-gray-700 mb-4">
            Rate limits are based on your subscription plan. All responses include rate limit headers:
          </p>
          <CodeBlock
            code={`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1696852800`}
            language="text"
          />
          <p className="text-sm text-gray-600 mt-3">
            Learn more about rate limits in the <Link href="/docs/rate-limits" className="text-purple-600 hover:text-purple-700 font-medium">Rate Limits</Link> section.
          </p>
        </section>

        {/* Next Steps */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Next Steps</h2>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <ul className="space-y-3">
              <li>
                <Link href="/docs/authentication" className="text-purple-600 hover:text-purple-700 font-medium">
                  → Learn about Authentication
                </Link>
              </li>
              <li>
                <Link href="/docs/webhooks" className="text-purple-600 hover:text-purple-700 font-medium">
                  → Set up Webhooks
                </Link>
              </li>
              <li>
                <Link href="/docs/messaging" className="text-purple-600 hover:text-purple-700 font-medium">
                  → Start sending messages
                </Link>
              </li>
              <li>
                <Link href="/settings/api-keys" className="text-purple-600 hover:text-purple-700 font-medium">
                  → Create an API key
                </Link>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, features }: { icon: React.ReactNode; title: string; features: string[] }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <ul className="space-y-2">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
            <span className="text-purple-600 mt-0.5">•</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeatureSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <ul className="space-y-1">
        {items.map((item, idx) => (
          <li key={idx} className="text-sm text-gray-700 flex items-start space-x-2">
            <span className="text-purple-600">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

