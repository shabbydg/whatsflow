import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Mail, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-lg text-gray-600">
              Have questions? We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Email */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100 mb-4">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-600 mb-4">For general inquiries and support</p>
              <a 
                href="mailto:support@whatsflow.ai" 
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                support@whatsflow.ai
              </a>
            </div>

            {/* Sales */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100 mb-4">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sales Team</h3>
              <p className="text-gray-600 mb-4">For enterprise and custom plans</p>
              <a 
                href="mailto:sales@whatsflow.ai" 
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                sales@whatsflow.ai
              </a>
            </div>
          </div>

          {/* Contact Form Placeholder */}
          <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="How can we help you?"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

