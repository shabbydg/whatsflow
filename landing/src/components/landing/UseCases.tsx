'use client';

import { ShoppingBag, Utensils, Heart, Wrench, GraduationCap, Home, ArrowRight, CheckCircle } from 'lucide-react';

const useCases = [
  {
    icon: ShoppingBag,
    title: 'Retail & E-commerce',
    description: 'Send order confirmations, shipping updates, and product recommendations directly to customers.',
    benefits: ['Order notifications', 'Abandoned cart recovery', 'Customer support'],
    color: 'from-purple-500 to-pink-500',
    stats: '73% conversion boost'
  },
  {
    icon: Utensils,
    title: 'Restaurants & Cafes',
    description: 'Take orders, send menu updates, and handle reservations seamlessly through WhatsApp.',
    benefits: ['Online ordering', 'Table reservations', 'Daily specials'],
    color: 'from-orange-500 to-red-500',
    stats: '2x faster ordering'
  },
  {
    icon: Heart,
    title: 'Healthcare & Wellness',
    description: 'Appointment reminders, health tips, and patient communication made simple and HIPAA-friendly.',
    benefits: ['Appointment reminders', 'Health updates', 'Prescription alerts'],
    color: 'from-green-500 to-teal-500',
    stats: '85% show-up rate'
  },
  {
    icon: Wrench,
    title: 'Home Services',
    description: 'Schedule appointments, send quotes, and provide real-time service updates to clients.',
    benefits: ['Booking management', 'Service updates', 'Quote delivery'],
    color: 'from-blue-500 to-cyan-500',
    stats: '60% more bookings'
  },
  {
    icon: GraduationCap,
    title: 'Education & Training',
    description: 'Course updates, assignment reminders, and student-teacher communication in one place.',
    benefits: ['Class schedules', 'Assignment reminders', 'Parent communication'],
    color: 'from-indigo-500 to-purple-500',
    stats: '95% engagement'
  },
  {
    icon: Home,
    title: 'Real Estate',
    description: 'Property updates, viewing schedules, and client follow-ups automated through WhatsApp.',
    benefits: ['Property listings', 'Virtual tours', 'Client follow-ups'],
    color: 'from-yellow-500 to-orange-500',
    stats: '3x more viewings'
  },
];

export function UseCases() {
  return (
    <section className="relative py-20 md:py-28 lg:py-36 bg-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20 lg:mb-24 space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 text-blue-700 text-sm font-semibold shadow-sm">
            <ShoppingBag className="h-4 w-4" />
            Built for Every Industry
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Perfect for
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Your Business
            </span>
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            WhatsFlow adapts to your industry needs. See how businesses like yours
            leverage WhatsApp to grow and serve customers better.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <div
                key={index}
                className="group relative bg-white p-8 rounded-2xl border border-gray-200 hover:border-purple-300 shadow-smooth hover:shadow-smooth-lg transition-all duration-500 hover:-translate-y-2"
              >
                {/* Icon with Gradient */}
                <div className={`inline-flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br ${useCase.color} mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>

                {/* Stats Badge */}
                <div className="absolute top-6 right-6 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                  <span className="text-xs font-semibold text-green-700">{useCase.stats}</span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                  {useCase.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  {useCase.description}
                </p>

                {/* Benefits List */}
                <ul className="space-y-3 mb-6">
                  {useCase.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      {benefit}
                    </li>
                  ))}
                </ul>

                {/* Learn More Link */}
                <a
                  href="#pricing"
                  className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-700 transition-all duration-300 group-hover:gap-3 gap-2"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 transition-transform" />
                </a>

                {/* Hover glow effect */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${useCase.color} -z-10 blur-xl`} />
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 md:mt-20 lg:mt-24 relative">
          <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 rounded-3xl p-10 lg:p-14 text-center shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
            {/* Decorative patterns */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10 rounded-3xl" />

            <div className="relative">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
                Don't See Your Industry?
              </h3>
              <p className="text-lg md:text-xl text-purple-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                WhatsFlow is flexible enough to work for any business. Let's discuss your specific needs.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                Contact Our Team
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
