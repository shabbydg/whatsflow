'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
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
    ],
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
    ],
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
    ],
  },
];

export function Pricing() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:2153';

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your business needs. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-lg border-2 p-8 ${
                plan.popular
                  ? 'border-purple-600 shadow-lg'
                  : 'border-gray-200'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  {plan.price ? (
                    <>
                      <span className="text-4xl font-bold text-gray-900">
                        ${plan.price}
                      </span>
                      <span className="text-gray-600 ml-2">/month</span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-gray-900">Custom</span>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link href={`${appUrl}/register`}>
                <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  className="w-full"
                >
                  {plan.price ? 'Get Started' : 'Contact Sales'}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-600">
            All plans include 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}

