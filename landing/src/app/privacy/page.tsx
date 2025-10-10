import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-600 mb-4">
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Account information (name, email, business details)</li>
                <li>WhatsApp messages and contact information</li>
                <li>Usage data and analytics</li>
                <li>Payment information (processed securely by third-party providers)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-600 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send notifications</li>
                <li>Respond to your comments and questions</li>
                <li>Send technical notices and support messages</li>
                <li>Monitor and analyze trends and usage</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Security</h2>
              <p className="text-gray-600 mb-4">
                We implement appropriate security measures to protect your personal information, 
                including:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>End-to-end encryption for message data</li>
                <li>Secure data storage with encryption at rest</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Sharing</h2>
              <p className="text-gray-600 mb-4">
                We do not sell your personal information. We may share your information only:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>With your consent</li>
                <li>With service providers who assist in our operations</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
              <p className="text-gray-600 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
              <p className="text-gray-600">
                If you have questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@whatsflow.ai" className="text-purple-600 hover:text-purple-700 font-medium">
                  privacy@whatsflow.ai
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

