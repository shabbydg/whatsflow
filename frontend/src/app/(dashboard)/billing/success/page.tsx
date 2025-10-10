'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/billing');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const orderId = searchParams.get('order_id');
  const paymentId = searchParams.get('payment_id');

  return (
    <div className="min-h-[600px] flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center h-20 w-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">
            Your subscription has been activated. Thank you for choosing WhatsFlow!
          </p>
        </div>

        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="text-sm font-mono text-gray-900">{orderId}</p>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Redirecting to your billing dashboard in {countdown} seconds...
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/billing">
              <button className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors">
                Go to Billing Dashboard
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-colors">
                Go to Dashboard
              </button>
            </Link>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            A confirmation email with your invoice has been sent to your email address.
          </p>
        </div>
      </div>
    </div>
  );
}

