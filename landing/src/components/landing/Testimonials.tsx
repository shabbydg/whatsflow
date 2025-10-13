'use client';

import { Star, Quote, TrendingUp } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Owner',
    company: 'Chen\'s Bakery',
    image: 'SC',
    content: 'WhatsFlow transformed how we handle customer orders. The AI chatbot handles routine inquiries 24/7, and we\'ve seen a 40% increase in order volume. Perfect for small businesses like ours!',
    rating: 5,
    metric: '+40% orders'
  },
  {
    name: 'Michael Rodriguez',
    role: 'Sales Manager',
    company: 'Tech Solutions Inc',
    image: 'MR',
    content: 'As a growing SME, we needed a professional WhatsApp solution without enterprise complexity. WhatsFlow delivered exactly that. Our customer response time improved by 60%.',
    rating: 5,
    metric: '60% faster'
  },
  {
    name: 'Priya Patel',
    role: 'CEO',
    company: 'Fashion Boutique',
    image: 'PP',
    content: 'The broadcast campaigns feature is a game-changer. We can segment our customer base and send personalized messages that actually convert. ROI has been incredible.',
    rating: 5,
    metric: '3x ROI'
  },
  {
    name: 'James Thompson',
    role: 'Operations Director',
    company: 'Logistics Co',
    image: 'JT',
    content: 'Managing multiple WhatsApp numbers was chaos before WhatsFlow. Now everything is in one dashboard. The analytics help us make better decisions about customer communication.',
    rating: 5,
    metric: '5 devices unified'
  },
];

export function Testimonials() {
  return (
    <section className="relative py-20 md:py-28 lg:py-36 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20 lg:mb-24 space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-200 text-yellow-700 text-sm font-semibold shadow-sm">
            <Star className="h-4 w-4 fill-yellow-700" />
            Loved by 5,000+ Growing Businesses
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight">
            What Our Customers
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Are Saying
            </span>
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join thousands of small and medium businesses who trust WhatsFlow
            to power their customer communications.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-white p-8 lg:p-10 rounded-3xl border border-gray-200 hover:border-purple-300 shadow-smooth hover:shadow-smooth-lg transition-all duration-500 hover:-translate-y-2"
            >
              {/* Metric Badge */}
              <div className="absolute -top-4 right-6 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-full shadow-lg">
                <TrendingUp className="inline h-4 w-4 mr-1" />
                {testimonial.metric}
              </div>

              {/* Quote Icon & Rating */}
              <div className="flex items-start justify-between mb-6">
                <Quote className="h-12 w-12 text-purple-100 flex-shrink-0 group-hover:text-purple-200 transition-colors" />
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
              </div>

              {/* Content */}
              <p className="text-gray-700 text-lg leading-relaxed mb-8">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg">
                  {testimonial.image}
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role} • {testimonial.company}
                  </div>
                </div>
              </div>

              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br from-purple-400 to-blue-400 -z-10 blur-xl" />
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 md:mt-20 lg:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { value: '4.9/5', label: 'Average Rating', icon: Star, gradient: 'from-yellow-500 to-orange-500' },
            { value: '5,000+', label: 'Happy Customers', icon: TrendingUp, gradient: 'from-purple-500 to-blue-500' },
            { value: '98%', label: 'Would Recommend', icon: Star, gradient: 'from-green-500 to-emerald-500' }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="relative group text-center p-8 bg-white rounded-2xl border border-gray-200 shadow-smooth hover:shadow-smooth-lg transition-all duration-500 hover:-translate-y-2">
                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${stat.gradient} mb-4 mx-auto shadow-lg`}>
                  <Icon className="h-6 w-6 text-white fill-white" />
                </div>
                <div className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
