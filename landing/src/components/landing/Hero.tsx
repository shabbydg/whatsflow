'use client';

import Link from 'next/link';
import { MessageSquare, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Hero() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:2153';

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm mb-8">
            <Zap className="h-4 w-4 mr-2" />
            Powerful WhatsApp Business Platform
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Your Business
            <br />
            <span className="text-purple-600">With WhatsApp</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Connect with customers, automate conversations with AI, and grow your business 
            with the most powerful WhatsApp messaging platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href={`${appUrl}/register`}>
              <Button variant="primary" size="lg">
                Get Started Free
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg">
                See How It Works
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center">
              <MessageSquare className="h-8 w-8 text-purple-600 mb-2" />
              <div className="text-3xl font-bold text-gray-900">100K+</div>
              <div className="text-sm text-gray-600">Messages Sent</div>
            </div>
            <div className="flex flex-col items-center">
              <Users className="h-8 w-8 text-purple-600 mb-2" />
              <div className="text-3xl font-bold text-gray-900">5K+</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="flex flex-col items-center">
              <Zap className="h-8 w-8 text-purple-600 mb-2" />
              <div className="text-3xl font-bold text-gray-900">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

