import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About WhatsFlow</h1>
          
          <div className="prose prose-lg">
            <p className="text-lg text-gray-600 mb-6">
              WhatsFlow is a powerful WhatsApp Business messaging platform designed to help 
              businesses connect with their customers, automate conversations, and scale 
              their operations.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              We believe that every business, regardless of size, should have access to 
              enterprise-grade messaging tools. Our mission is to democratize business 
              communication by making WhatsApp automation accessible, affordable, and easy to use.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Why WhatsFlow?</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Built by developers who understand business communication needs</li>
              <li>Secure, reliable, and compliant with WhatsApp policies</li>
              <li>Continuous innovation with regular feature updates</li>
              <li>Dedicated customer support team</li>
              <li>Transparent pricing with no hidden fees</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer First</h3>
                <p className="text-gray-600">
                  Your success is our success. We build features based on your feedback 
                  and needs.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Transparency</h3>
                <p className="text-gray-600">
                  Clear pricing, honest communication, and open about our capabilities 
                  and limitations.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Innovation</h3>
                <p className="text-gray-600">
                  Constantly improving our platform with the latest AI and automation 
                  technologies.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reliability</h3>
                <p className="text-gray-600">
                  99.9% uptime guarantee. Your business communications are always available.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


