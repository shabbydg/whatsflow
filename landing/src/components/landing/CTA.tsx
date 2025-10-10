'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function CTA() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:2153';

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using WhatsFlow to connect with customers 
            and grow their revenue.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={`${appUrl}/register`}>
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white/10"
              >
                Contact Sales
              </Button>
            </Link>
          </div>
          <p className="text-sm text-purple-100 mt-6">
            14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}

