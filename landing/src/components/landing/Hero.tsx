'use client';

import Link from 'next/link';
import { MessageSquare, Zap, Users, ArrowRight, CheckCircle, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Hero() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:2153';

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 lg:pt-24 lg:pb-20 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 -z-20" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5 -z-10" />

      {/* Floating gradient orbs */}
      <div className="absolute top-20 -left-32 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
      <div className="absolute top-40 -right-32 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }} />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 text-purple-700 text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-300">
              <Zap className="h-4 w-4" />
              Trusted by 5,000+ Growing Businesses
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl font-extrabold leading-[1.05] tracking-tight">
              <span className="text-gray-900">Scale Your Business</span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 bg-clip-text text-transparent animate-gradient">
                With WhatsApp
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-2xl lg:max-w-none mx-auto lg:mx-0 leading-relaxed">
              The complete WhatsApp Business platform for SMEs. Connect with customers,
              automate with AI, and grow your revenue—no technical skills needed.
            </p>

            {/* Key Benefits */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              {[
                'Free 14-day trial',
                'No credit card',
                'Cancel anytime'
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-100">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href={`${appUrl}/register`} className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto group shadow-xl hover:shadow-2xl">
                  Get Started Free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 border-2 border-white" />
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 text-yellow-500 text-sm">
                  {'★'.repeat(5)}
                </div>
                <p className="text-sm text-gray-600 font-medium">4.9/5 from 1,000+ reviews</p>
              </div>
            </div>
          </div>

          {/* Right Column - Stats Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {[
                {
                  icon: MessageSquare,
                  value: '250K+',
                  label: 'Messages Sent',
                  change: '+34%',
                  bgColor: 'bg-purple-100',
                  iconColor: 'text-purple-600',
                  delay: '0s'
                },
                {
                  icon: Users,
                  value: '5,000+',
                  label: 'Active Users',
                  change: '+28%',
                  bgColor: 'bg-blue-100',
                  iconColor: 'text-blue-600',
                  delay: '0.1s',
                  className: 'mt-8'
                },
                {
                  icon: TrendingUp,
                  value: '99.9%',
                  label: 'Uptime SLA',
                  change: 'Guaranteed',
                  bgColor: 'bg-green-100',
                  iconColor: 'text-green-600',
                  delay: '0.2s'
                },
                {
                  icon: Shield,
                  value: '4.9/5',
                  label: 'Customer Rating',
                  change: '500+ reviews',
                  bgColor: 'bg-orange-100',
                  iconColor: 'text-orange-600',
                  delay: '0.3s',
                  className: 'mt-8'
                }
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className={`group bg-white rounded-2xl shadow-smooth hover:shadow-smooth-lg p-6 border border-gray-100 transition-all duration-500 hover:-translate-y-2 ${stat.className || ''}`}
                  style={{ animationDelay: stat.delay }}
                >
                  <div className={`flex items-center justify-center h-14 w-14 rounded-xl ${stat.bgColor} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`h-7 w-7 ${stat.iconColor}`} />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600 mb-2">{stat.label}</div>
                  <div className="text-xs text-green-600 font-semibold">{stat.change}</div>
                </div>
              ))}
            </div>

            {/* Decorative glow effect */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
