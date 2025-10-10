'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { billingAPI } from '@/lib/api/billing';
import type { Subscription, Plan, Usage } from '@/lib/api/billing';
import { SubscriptionStatus } from '@/components/billing/SubscriptionStatus';
import { UsageProgress } from '@/components/billing/UsageProgress';
import { CreditCard, TrendingUp, FileText, Settings } from 'lucide-react';
import Link from 'next/link';

export default function BillingPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const response = await billingAPI.getSubscription();
      setSubscription(response.data.data.subscription);
      setPlan(response.data.data.plan);
      setUsage(response.data.data.usage);
    } catch (error: any) {
      console.error('Error loading subscription:', error);
      // If no subscription, redirect to plans
      if (error.response?.status === 404) {
        router.push('/billing/plans');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!subscription || !plan) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-600 mt-1">Manage your subscription and usage</p>
      </div>

      {/* Subscription Status */}
      <SubscriptionStatus subscription={subscription} planName={plan.name} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/billing/plans"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Change Plan</h3>
              <p className="text-sm text-gray-600">Upgrade or downgrade</p>
            </div>
          </div>
        </Link>

        <Link
          href="/billing/invoices"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Invoices</h3>
              <p className="text-sm text-gray-600">View payment history</p>
            </div>
          </div>
        </Link>

        <Link
          href="/billing/settings"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Settings className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Settings</h3>
              <p className="text-sm text-gray-600">Manage billing</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Usage Dashboard */}
      {usage && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Current Usage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UsageProgress
              label="Messages"
              current={usage.messages_sent}
              limit={plan.limits.messages_per_month}
            />
            <UsageProgress
              label="AI Messages"
              current={usage.ai_messages_count}
              limit={plan.limits.ai_messages_per_month}
            />
            <UsageProgress
              label="Contacts"
              current={usage.contacts_count}
              limit={plan.limits.contacts}
            />
            <UsageProgress
              label="Devices"
              current={usage.devices_used}
              limit={plan.limits.devices}
            />
          </div>
        </div>
      )}

      {/* Plan Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Plan Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 mb-1">Plan</p>
            <p className="font-semibold text-gray-900">{plan.name}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Billing Cycle</p>
            <p className="font-semibold text-gray-900 capitalize">{subscription.billing_cycle}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Current Period</p>
            <p className="font-semibold text-gray-900">
              {subscription.current_period_start &&
                new Date(subscription.current_period_start).toLocaleDateString()}{' '}
              -{' '}
              {subscription.current_period_end &&
                new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Amount</p>
            <p className="font-semibold text-gray-900">
              ${subscription.current_price.toFixed(2)} {subscription.currency}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

