'use client';

import { useEffect, useRef } from 'react';
import type { PayHereCheckoutData } from '@/lib/api/billing';

interface PayHereCheckoutProps {
  checkoutData: PayHereCheckoutData;
  onCancel?: () => void;
}

export function PayHereCheckout({ checkoutData, onCancel }: PayHereCheckoutProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Auto-submit form when component mounts
    if (formRef.current) {
      formRef.current.submit();
    }
  }, []);

  const checkoutUrl =
    process.env.NEXT_PUBLIC_PAYHERE_MODE === 'live'
      ? 'https://www.payhere.lk/pay/checkout'
      : 'https://sandbox.payhere.lk/pay/checkout';

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="text-center mb-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Redirecting to Payment Gateway...</h2>
        <p className="text-sm text-gray-600">
          You will be redirected to PayHere to complete your payment securely.
        </p>
      </div>

      {/* Hidden PayHere form */}
      <form ref={formRef} method="POST" action={checkoutUrl} className="hidden">
        <input type="hidden" name="merchant_id" value={checkoutData.merchant_id} />
        <input type="hidden" name="return_url" value={checkoutData.return_url} />
        <input type="hidden" name="cancel_url" value={checkoutData.cancel_url} />
        <input type="hidden" name="notify_url" value={checkoutData.notify_url} />
        <input type="hidden" name="first_name" value={checkoutData.first_name} />
        <input type="hidden" name="last_name" value={checkoutData.last_name} />
        <input type="hidden" name="email" value={checkoutData.email} />
        <input type="hidden" name="phone" value={checkoutData.phone} />
        <input type="hidden" name="address" value={checkoutData.address} />
        <input type="hidden" name="city" value={checkoutData.city} />
        <input type="hidden" name="country" value={checkoutData.country} />
        <input type="hidden" name="order_id" value={checkoutData.order_id} />
        <input type="hidden" name="items" value={checkoutData.items} />
        <input type="hidden" name="currency" value={checkoutData.currency} />
        <input type="hidden" name="amount" value={checkoutData.amount} />
        {checkoutData.recurrence && (
          <input type="hidden" name="recurrence" value={checkoutData.recurrence} />
        )}
        {checkoutData.duration && (
          <input type="hidden" name="duration" value={checkoutData.duration} />
        )}
        <input type="hidden" name="hash" value={checkoutData.hash} />
      </form>

      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-4 text-sm text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
      )}
    </div>
  );
}

