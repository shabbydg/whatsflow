import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 mb-4">
                By accessing and using WhatsFlow, you accept and agree to be bound by the terms 
                and provisions of this agreement. If you do not agree to these terms, please do 
                not use our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use of Service</h2>
              <p className="text-gray-600 mb-4">
                You agree to use WhatsFlow only for lawful purposes and in accordance with these Terms. 
                You agree not to use the service:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>In any way that violates any applicable laws or regulations</li>
                <li>To send spam or unsolicited messages</li>
                <li>To impersonate or attempt to impersonate another person or entity</li>
                <li>To engage in any conduct that restricts or inhibits anyone's use of the service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Responsibilities</h2>
              <p className="text-gray-600 mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Ensuring your use complies with WhatsApp's terms of service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Billing and Payments</h2>
              <p className="text-gray-600 mb-4">
                Paid services are billed in advance on a monthly or annual basis. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Provide accurate billing information</li>
                <li>Pay all fees and charges on time</li>
                <li>Accept responsibility for all charges under your account</li>
              </ul>
              <p className="text-gray-600 mt-4">
                Refunds are provided on a case-by-case basis within 14 days of purchase.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Service Modifications</h2>
              <p className="text-gray-600 mb-4">
                We reserve the right to modify or discontinue the service at any time, with or 
                without notice. We will not be liable to you or any third party for any modification, 
                suspension, or discontinuance of the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-600 mb-4">
                WhatsFlow shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages resulting from your use or inability to use the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Termination</h2>
              <p className="text-gray-600 mb-4">
                We may terminate or suspend your account and access to the service immediately, 
                without prior notice, for conduct that we believe violates these Terms or is 
                harmful to other users, us, or third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact</h2>
              <p className="text-gray-600">
                If you have questions about these Terms, please contact us at{' '}
                <a href="mailto:legal@whatsflow.ai" className="text-purple-600 hover:text-purple-700 font-medium">
                  legal@whatsflow.ai
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

