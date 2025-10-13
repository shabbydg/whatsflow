'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

const faqs = [
  {
    question: 'How does WhatsFlow work?',
    answer: 'WhatsFlow connects to your WhatsApp account via QR code, similar to WhatsApp Web. Once connected, you can send and receive messages, manage contacts, and automate conversations through our intuitive dashboard. Setup takes less than 5 minutes.',
  },
  {
    question: 'Is WhatsFlow compliant with WhatsApp policies?',
    answer: 'Yes, WhatsFlow uses the official WhatsApp Web protocol and follows all WhatsApp terms of service. Your account remains secure, compliant, and won\'t be banned. We prioritize safety and compliance.',
  },
  {
    question: 'Can I use multiple WhatsApp numbers?',
    answer: 'Yes! Depending on your plan, you can connect and manage multiple WhatsApp numbers from a single unified dashboard. Our Professional plan supports up to 5 devices, and Enterprise offers unlimited.',
  },
  {
    question: 'What happens to my data?',
    answer: 'Your data is securely stored with end-to-end encryption and bank-grade security. We are GDPR compliant and never share your data with third parties. You maintain full ownership and can export or delete your data at any time.',
  },
  {
    question: 'Do you offer a free trial?',
    answer: 'Yes! All paid plans include a comprehensive 14-day free trial with full access to all features. No credit card required to start your trial—just sign up and start exploring.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Absolutely. You can cancel your subscription at any time from your account settings with just one click. No cancellation fees, no questions asked. We also offer a 30-day money-back guarantee.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative py-20 md:py-28 lg:py-36 bg-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 text-purple-700 text-sm font-semibold shadow-sm">
            <HelpCircle className="h-4 w-4" />
            Common Questions
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Frequently Asked
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Got questions? We've got answers. Can't find what you're looking for? Chat with us!
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={clsx(
                'bg-white rounded-2xl border-2 overflow-hidden transition-all duration-300',
                openIndex === index
                  ? 'border-purple-300 shadow-smooth-lg'
                  : 'border-gray-200 hover:border-purple-200 hover:shadow-smooth'
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 md:p-7 text-left hover:bg-gray-50/50 transition-colors group"
              >
                <span className={clsx(
                  'font-bold pr-4 text-base md:text-lg transition-colors',
                  openIndex === index ? 'text-purple-600' : 'text-gray-900 group-hover:text-purple-600'
                )}>
                  {faq.question}
                </span>
                <div className={clsx(
                  'flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300',
                  openIndex === index ? 'bg-purple-100' : 'bg-gray-100 group-hover:bg-purple-50'
                )}>
                  <ChevronDown
                    className={clsx(
                      'h-5 w-5 transition-all duration-300',
                      openIndex === index ? 'text-purple-600 rotate-180' : 'text-gray-600 group-hover:text-purple-600'
                    )}
                  />
                </div>
              </button>
              {openIndex === index && (
                <div className="px-6 md:px-7 pb-6 md:pb-7 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-base text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 md:mt-16">
          <div className="relative inline-block p-8 md:p-10 bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-3xl border-2 border-purple-100 shadow-smooth">
            {/* Decorative elements */}
            <div className="absolute -top-3 -right-3 h-24 w-24 bg-purple-200 rounded-full blur-3xl opacity-30" />
            <div className="absolute -bottom-3 -left-3 h-24 w-24 bg-blue-200 rounded-full blur-3xl opacity-30" />

            <div className="relative">
              <MessageCircle className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Still have questions?
              </h3>
              <p className="text-base text-gray-600 mb-6 max-w-md mx-auto">
                Our support team is here to help you get started and succeed with WhatsFlow.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Contact Support Team
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
