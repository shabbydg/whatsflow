'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { billingAPI } from '@/lib/api/billing';
import type { Subscription } from '@/lib/api/billing';
import { AlertCircle } from 'lucide-react';

export default function BillingSettingsPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const response = await billingAPI.getSubscription();
      setSubscription(response.data.data.subscription);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (immediately: boolean = false) => {
    if (!immediately && !confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    setCanceling(true);
    try {
      await billingAPI.cancelSubscription(immediately);
      alert(
        immediately
          ? 'Subscription canceled immediately'
          : 'Your subscription will be canceled at the end of the current billing period'
      );
      loadSubscription();
      setShowCancelConfirm(false);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to cancel subscription');
    } finally {
      setCanceling(false);
    }
  };

  const handleReactivate = async () => {
    try {
      await billingAPI.reactivateSubscription();
      alert('Subscription reactivated successfully!');
      loadSubscription();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to reactivate subscription');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing Settings</h1>
        <p className="text-gray-600 mt-1">Manage your subscription settings</p>
      </div>

      {/* Subscription Management */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Management</h2>

        <div className="space-y-4">
          {subscription.cancel_at_period_end && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Subscription Scheduled for Cancellation
                  </p>
                  <p className="text-sm text-yellow-800 mt-1">
                    Your subscription will end on{' '}
                    {subscription.current_period_end &&
                      new Date(subscription.current_period_end).toLocaleDateString()}
                    . You can reactivate it anytime before then.
                  </p>
                  <button
                    onClick={handleReactivate}
                    className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-semibold"
                  >
                    Reactivate Subscription
                  </button>
                </div>
              </div>
            </div>
          )}

          {!subscription.cancel_at_period_end && subscription.status !== 'canceled' && (
            <div>
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold"
              >
                Cancel Subscription
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cancel Subscription</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your subscription? You can choose to:
            </p>

            <div className="space-y-3 mb-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="font-semibold text-gray-900 mb-1">Cancel at Period End</p>
                <p className="text-sm text-gray-600">
                  Continue using WhatsFlow until{' '}
                  {subscription.current_period_end &&
                    new Date(subscription.current_period_end).toLocaleDateString()}
                  , then cancel.
                </p>
                <button
                  onClick={() => handleCancelSubscription(false)}
                  disabled={canceling}
                  className="mt-3 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-colors disabled:opacity-50"
                >
                  {canceling ? 'Processing...' : 'Cancel at Period End'}
                </button>
              </div>

              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <p className="font-semibold text-red-900 mb-1">Cancel Immediately</p>
                <p className="text-sm text-red-800">Lose access to all features right now.</p>
                <button
                  onClick={() => handleCancelSubscription(true)}
                  disabled={canceling}
                  className="mt-3 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors disabled:opacity-50"
                >
                  {canceling ? 'Processing...' : 'Cancel Immediately'}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowCancelConfirm(false)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Keep Subscription
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

