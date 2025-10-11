'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { billingAPI } from '@/lib/api/billing';
import type { Plan, Subscription } from '@/lib/api/billing';
import { PlanCard } from '@/components/billing/PlanCard';
import { PayHereCheckout } from '@/components/billing/PayHereCheckout';
import type { PayHereCheckoutData } from '@/lib/api/billing';

export default function PlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(true);
  const [checkoutData, setCheckoutData] = useState<PayHereCheckoutData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansResponse, subResponse] = await Promise.all([
        billingAPI.getPlans(),
        billingAPI.getSubscription().catch(() => null),
      ]);

      setPlans(plansResponse.data.data);
      if (subResponse?.data?.data) {
        setCurrentSubscription(subResponse.data.data.subscription);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan: Plan) => {
    if (plan.slug === 'trial') {
      // Start trial directly
      try {
        await billingAPI.startTrial();
        alert('Trial started successfully!');
        router.push('/billing');
      } catch (error: any) {
        alert(error.response?.data?.error || 'Failed to start trial');
      }
      return;
    }

    // For paid plans, initiate PayHere checkout
    try {
      const response = await billingAPI.subscribe(plan.id, billingCycle);
      setCheckoutData(response.data.data.checkout);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to initiate subscription');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Show PayHere checkout if initiated
  if (checkoutData) {
    return (
      <div className="max-w-2xl mx-auto">
        <PayHereCheckout
          checkoutData={checkoutData}
          onCancel={() => setCheckoutData(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
        <p className="text-gray-600">Select the perfect plan for your business needs</p>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center">
        <div className="bg-gray-100 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md text-sm font-semibold transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-6 py-2 rounded-md text-sm font-semibold transition-colors ${
              billingCycle === 'annual'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Annual
            <span className="ml-2 text-green-600 text-xs">Save 15%</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
        {plans.map((plan, index) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billingCycle={billingCycle}
            currentPlanId={currentSubscription?.plan_id}
            onSelect={() => handleSelectPlan(plan)}
            isPopular={index === 2} // Professional plan
          />
        ))}
      </div>

      {/* Additional Info */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-600">
          All paid plans include a 7-day free trial. No credit card required to start.
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Cancel anytime. No questions asked.
        </p>
      </div>
    </div>
  );
}

