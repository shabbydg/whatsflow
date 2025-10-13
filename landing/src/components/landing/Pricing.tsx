'use client';

import Link from 'next/link';
import { Check, Star, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const plans = [
  {
    name: 'Starter',
    price: 29,
    description: 'Perfect for small businesses',
    features: [
      '2 WhatsApp devices',
      '1,000 contacts',
      '5,000 messages/month',
      'Basic AI replies',
      'Email support',
      'Message templates',
      'Basic analytics'
    ],
    highlight: 'Best for Solo Entrepreneurs'
  },
  {
    name: 'Professional',
    price: 99,
    description: 'For growing businesses',
    popular: true,
    features: [
      '5 WhatsApp devices',
      '10,000 contacts',
      '50,000 messages/month',
      'Advanced AI + knowledge base',
      'Broadcasts & campaigns',
      'Priority support',
      'Advanced analytics',
      'Team collaboration'
    ],
    highlight: 'Most Popular Choice',
    savings: 'Save $100/month'
  },
  {
    name: 'Enterprise',
    price: null,
    description: 'For large organizations',
    features: [
      'Unlimited devices',
      'Unlimited contacts',
      'Unlimited messages',
      'Custom AI training',
      'Advanced analytics',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee'
    ],
    highlight: 'Maximum Flexibility'
  },
];

export function Pricing() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:2153';

  return (
    <section id="pricing" className="relative py-20 md:py-28 lg:py-36 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20 lg:mb-24 space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 text-green-700 text-sm font-semibold shadow-sm">
            <Star className="h-4 w-4 fill-green-700" />
            Flexible Plans for Every Business
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Simple, Transparent
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Choose the plan that fits your business needs. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-3xl p-8 lg:p-10 transition-all duration-500 ${
                plan.popular
                  ? 'border-2 border-purple-600 shadow-2xl scale-105 md:scale-110 z-10'
                  : 'border border-gray-200 shadow-smooth hover:shadow-smooth-lg hover:-translate-y-2'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg">
                    {plan.highlight}
                  </div>
                </div>
              )}

              {/* Savings Badge */}
              {plan.savings && (
                <div className="absolute -top-3 -right-3">
                  <div className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform rotate-12">
                    {plan.savings}
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8 space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-600">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  {plan.price ? (
                    <>
                      <span className="text-5xl md:text-6xl font-extrabold text-gray-900">
                        ${plan.price}
                      </span>
                      <span className="text-gray-600 ml-2 text-lg">/month</span>
                    </>
                  ) : (
                    <span className="text-5xl md:text-6xl font-extrabold text-gray-900">Custom</span>
                  )}
                </div>
                {!plan.popular && plan.highlight && (
                  <div className="text-sm font-semibold text-purple-600">
                    {plan.highlight}
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center ${plan.popular ? 'bg-purple-100' : 'bg-green-100'}`}>
                        <Check className={`h-3 w-3 ${plan.popular ? 'text-purple-600' : 'text-green-600'}`} />
                      </div>
                    </div>
                    <span className="ml-3 text-sm text-gray-700 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link href={`${appUrl}/register`} className="block w-full">
                <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  size="lg"
                  className={`w-full group ${plan.popular ? 'shadow-xl' : ''}`}
                >
                  {plan.price ? 'Start Free Trial' : 'Contact Sales'}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              {/* Decorative glow for popular plan */}
              {plan.popular && (
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-3xl opacity-10 blur-xl" />
              )}
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12 lg:mt-16">
          <div className="inline-flex flex-col items-center gap-4 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="font-medium">14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="font-medium">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="font-medium">Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>

        {/* Money-back guarantee */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
            <Zap className="h-6 w-6 text-green-600" />
            <span className="font-bold text-gray-900">30-Day Money-Back Guarantee</span>
          </div>
        </div>
      </div>
    </section>
  );
}
