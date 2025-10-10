'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

const faqs = [
  {
    question: 'How does WhatsFlow work?',
    answer: 'WhatsFlow connects to your WhatsApp account via QR code, similar to WhatsApp Web. Once connected, you can send and receive messages, manage contacts, and automate conversations through our intuitive dashboard.',
  },
  {
    question: 'Is WhatsFlow compliant with WhatsApp policies?',
    answer: 'Yes, WhatsFlow uses the official WhatsApp Web protocol and follows all WhatsApp terms of service. Your account remains secure and compliant.',
  },
  {
    question: 'Can I use multiple WhatsApp numbers?',
    answer: 'Yes! Depending on your plan, you can connect and manage multiple WhatsApp numbers from a single dashboard.',
  },
  {
    question: 'What happens to my data?',
    answer: 'Your data is securely stored with end-to-end encryption. We are GDPR compliant and never share your data with third parties. You maintain full ownership of your data.',
  },
  {
    question: 'Do you offer a free trial?',
    answer: 'Yes, all paid plans include a 14-day free trial. No credit card required to start your trial.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Absolutely. You can cancel your subscription at any time from your account settings. No cancellation fees.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="container mx-auto max-w-3xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Got questions? We've got answers.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                <ChevronDown
                className={clsx(
                  'h-5 w-5 text-purple-600 transition-transform',
                  openIndex === index && 'transform rotate-180'
                )}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

