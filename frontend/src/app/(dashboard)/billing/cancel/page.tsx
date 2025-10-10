'use client';

import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default function PaymentCanceledPage() {
  return (
    <div className="min-h-[600px] flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center h-20 w-20 bg-gray-100 rounded-full mb-4">
            <XCircle className="h-12 w-12 text-gray-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Canceled</h1>
          <p className="text-gray-600">
            You canceled the payment process. No charges were made to your account.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/billing/plans">
            <button className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors">
              View Plans Again
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-colors">
              Back to Dashboard
            </button>
          </Link>
        </div>

        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@whatsflow.ai" className="text-purple-600 hover:text-purple-700 font-medium">
              support@whatsflow.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

