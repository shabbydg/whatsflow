import { 
  MessageSquare, 
  Bot, 
  Users, 
  BarChart3, 
  Zap, 
  Shield,
  Smartphone,
  Globe
} from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Multi-Device Support',
    description: 'Connect multiple WhatsApp numbers and manage them all from one dashboard.',
  },
  {
    icon: Bot,
    title: 'AI-Powered Replies',
    description: 'Intelligent chatbot with GPT integration for automated customer responses.',
  },
  {
    icon: Users,
    title: 'Contact Management',
    description: 'Organize contacts with tags, notes, and custom fields for better targeting.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track message stats, response times, and customer engagement metrics.',
  },
  {
    icon: Zap,
    title: 'Broadcast Campaigns',
    description: 'Send bulk messages to segmented audiences with scheduling and tracking.',
  },
  {
    icon: Shield,
    title: 'Secure & Compliant',
    description: 'End-to-end encryption and GDPR-compliant data handling.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Responsive',
    description: 'Access your dashboard from any device, anywhere, anytime.',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Connect with customers worldwide with international WhatsApp support.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to help you connect, engage, and grow your business 
            with WhatsApp messaging.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="bg-white p-6 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100 mb-4">
                  <Icon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

