'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function CTA() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:2153';

  return (
    <section className="relative py-20 md:py-28 lg:py-36 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 rounded-3xl lg:rounded-[2.5rem] p-10 md:p-14 lg:p-20 text-center shadow-2xl overflow-hidden">
          {/* Decorative grid pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />

          {/* Floating elements */}
          <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />

          <div className="relative">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold mb-8 shadow-lg">
              <Sparkles className="h-4 w-4" />
              Limited Time Offer: Get 2 Months Free on Annual Plans
            </div>

            {/* Headline */}
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 lg:mb-8 leading-tight">
              Ready to Transform
              <br />
              Your Business?
            </h2>

            {/* Subheadline */}
            <p className="text-lg md:text-xl lg:text-2xl text-purple-100 mb-8 lg:mb-12 max-w-3xl mx-auto leading-relaxed">
              Join 5,000+ businesses using WhatsFlow to connect with customers,
              automate conversations, and grow their revenue.
            </p>

            {/* Key Benefits */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-10 lg:mb-12">
              {[
                '14-day free trial',
                'No credit card required',
                'Cancel anytime',
                'Setup in 5 minutes'
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2 text-white">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 mb-8">
              <Link href={`${appUrl}/register`} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-50 w-full sm:w-auto group shadow-2xl hover:shadow-2xl transform hover:scale-105"
                >
                  Start Free Trial Now
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/contact" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 w-full sm:w-auto backdrop-blur-sm"
                >
                  Talk to Sales
                </Button>
              </Link>
            </div>

            {/* Trust badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 border-2 border-white" />
                ))}
              </div>
              <span className="text-white font-medium">Join 5,000+ happy customers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
