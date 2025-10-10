import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import type { Subscription } from '@/lib/api/billing';

interface SubscriptionStatusProps {
  subscription: Subscription;
  planName: string;
}

export function SubscriptionStatus({ subscription, planName }: SubscriptionStatusProps) {
  const getStatusDisplay = () => {
    if (subscription.is_free) {
      return {
        icon: CheckCircle,
        label: 'Free Account',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        description: subscription.free_reason || 'Account made free by admin',
      };
    }

    switch (subscription.status) {
      case 'trial':
        return {
          icon: Clock,
          label: 'Trial Active',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          description: `Free trial - ${getTrialDaysRemaining()} days remaining`,
        };
      case 'active':
        return {
          icon: CheckCircle,
          label: 'Active',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          description: `Next billing: ${formatDate(subscription.next_billing_date)}`,
        };
      case 'past_due':
        return {
          icon: AlertCircle,
          label: 'Payment Failed',
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          description: 'Please update your payment method',
        };
      case 'canceled':
        return {
          icon: XCircle,
          label: 'Canceled',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          description: subscription.cancel_at_period_end
            ? `Access until ${formatDate(subscription.current_period_end)}`
            : 'Subscription canceled',
        };
      default:
        return {
          icon: XCircle,
          label: 'Inactive',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          description: 'Please subscribe to a plan',
        };
    }
  };

  const getTrialDaysRemaining = () => {
    if (!subscription.trial_ends_at) return 0;
    const now = new Date();
    const trialEnd = new Date(subscription.trial_ends_at);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${statusDisplay.bgColor}`}>
            <StatusIcon className={`h-6 w-6 ${statusDisplay.color}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{planName}</h3>
            <p className={`text-sm font-medium ${statusDisplay.color}`}>
              {statusDisplay.label}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            {subscription.is_free ? 'FREE' : `$${subscription.current_price}`}
          </p>
          {!subscription.is_free && (
            <p className="text-xs text-gray-600 capitalize">
              per {subscription.billing_cycle === 'annual' ? 'year' : 'month'}
            </p>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600">{statusDisplay.description}</p>

      {subscription.cancel_at_period_end && subscription.status !== 'canceled' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Your subscription will be canceled at the end of the current billing period.
          </p>
        </div>
      )}
    </div>
  );
}

