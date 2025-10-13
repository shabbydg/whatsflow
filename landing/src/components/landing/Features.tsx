'use client';

import {
  MessageSquare,
  Bot,
  Users,
  BarChart3,
  Zap,
  Shield,
  Smartphone,
  Globe,
  ArrowRight
} from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Multi-Device Management',
    description: 'Connect and manage multiple WhatsApp Business numbers from one unified, powerful dashboard.',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    icon: Bot,
    title: 'AI-Powered Automation',
    description: 'Intelligent chatbot with GPT integration that handles customer inquiries automatically, 24/7.',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    icon: Users,
    title: 'Smart CRM',
    description: 'Organize contacts with tags, custom fields, and notes for personalized customer relationships.',
    color: 'green',
    gradient: 'from-green-500 to-green-600'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Track metrics, response times, and customer engagement with real-time reporting and insights.',
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600'
  },
  {
    icon: Zap,
    title: 'Broadcast Campaigns',
    description: 'Send personalized bulk messages to segmented audiences with intelligent scheduling.',
    color: 'yellow',
    gradient: 'from-yellow-500 to-yellow-600'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade encryption, GDPR compliance, and secure data handling protect your business.',
    color: 'red',
    gradient: 'from-red-500 to-red-600'
  },
  {
    icon: Smartphone,
    title: 'Cross-Platform',
    description: 'Seamless experience across mobile, tablet, and desktop—work from anywhere, anytime.',
    color: 'indigo',
    gradient: 'from-indigo-500 to-indigo-600'
  },
  {
    icon: Globe,
    title: 'Global Coverage',
    description: 'Reach customers worldwide with international WhatsApp support and multi-language capability.',
    color: 'teal',
    gradient: 'from-teal-500 to-teal-600'
  },
];

const colorVariants = {
  purple: 'bg-purple-100 text-purple-600',
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  orange: 'bg-orange-100 text-orange-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  red: 'bg-red-100 text-red-600',
  indigo: 'bg-indigo-100 text-indigo-600',
  teal: 'bg-teal-100 text-teal-600',
};

export function Features() {
  return (
    <section id="features" className="relative py-20 md:py-28 lg:py-36 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20 lg:mb-24 space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 text-purple-700 text-sm font-semibold shadow-sm">
            <Zap className="h-4 w-4" />
            Powerful Features Built for SMEs
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Everything You Need
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              To Succeed
            </span>
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Professional WhatsApp messaging capabilities designed specifically for
            growing businesses. No technical expertise required.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white p-8 rounded-2xl border border-gray-200 hover:border-purple-300 shadow-smooth hover:shadow-smooth-lg transition-all duration-500 hover:-translate-y-2"
              >
                {/* Icon */}
                <div className={`relative flex items-center justify-center h-16 w-16 rounded-xl mb-6 transition-all duration-500 ${colorVariants[feature.color as keyof typeof colorVariants]} group-hover:scale-110`}>
                  <Icon className="h-8 w-8 transition-all duration-300" />

                  {/* Glow effect on hover */}
                  <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 bg-gradient-to-br ${feature.gradient} blur-xl transition-all duration-500`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Hover indicator */}
                <div className="flex items-center gap-2 text-purple-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <span className="text-sm font-semibold">Learn more</span>
                  <ArrowRight className="h-4 w-4" />
                </div>

                {/* Decorative gradient border on hover */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${feature.gradient} -z-10 blur-xl`} />
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 md:mt-20 lg:mt-24">
          <div className="inline-flex flex-col items-center gap-4 p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100">
            <p className="text-lg font-medium text-gray-700">
              Plus many more features to supercharge your business growth
            </p>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              View All Features & Pricing
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

