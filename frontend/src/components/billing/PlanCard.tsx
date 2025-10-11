import { Check } from 'lucide-react';
import type { Plan } from '@/lib/api/billing';

interface PlanCardProps {
  plan: Plan;
  billingCycle: 'monthly' | 'annual';
  currentPlanId?: string;
  onSelect: () => void;
  isPopular?: boolean;
}

export function PlanCard({ plan, billingCycle, currentPlanId, onSelect, isPopular }: PlanCardProps) {
  // Convert prices to numbers (MySQL DECIMAL fields come as strings)
  const priceMonthly = typeof plan.price_monthly === 'string' ? parseFloat(plan.price_monthly) : plan.price_monthly;
  const priceAnnual = typeof plan.price_annual === 'string' ? parseFloat(plan.price_annual) : plan.price_annual;
  
  const price = billingCycle === 'annual' ? priceAnnual / 12 : priceMonthly;
  const totalPrice = billingCycle === 'annual' ? priceAnnual : priceMonthly;
  const isCurrent = plan.id === currentPlanId;
  const isTrial = plan.slug === 'trial';

  // Calculate savings for annual
  const annualSavings = priceMonthly * 12 - priceAnnual;
  const savingsPercent = Math.round((annualSavings / (priceMonthly * 12)) * 100);

  // Feature list
  const features: string[] = [];
  
  if (plan.limits.devices === -1) {
    features.push('Unlimited WhatsApp devices');
  } else {
    features.push(`${plan.limits.devices} WhatsApp device${plan.limits.devices > 1 ? 's' : ''}`);
  }

  if (plan.limits.contacts === -1) {
    features.push('Unlimited contacts');
  } else {
    features.push(`${plan.limits.contacts.toLocaleString()} contacts`);
  }

  if (plan.limits.messages_per_month === -1) {
    features.push('Unlimited messages');
  } else {
    features.push(`${plan.limits.messages_per_month.toLocaleString()} messages/month`);
  }

  if (plan.features.ai_replies) {
    if (plan.limits.ai_messages_per_month === -1) {
      features.push('Unlimited AI replies');
    } else {
      features.push(`${plan.limits.ai_messages_per_month.toLocaleString()} AI replies/month`);
    }
  }

  if (plan.features.broadcasts) features.push('Broadcast campaigns');
  if (plan.features.file_uploads) features.push('File uploads for AI');
  if (plan.features.advanced_analytics) features.push('Advanced analytics');
  if (plan.features.priority_support) features.push('Priority support');
  if (plan.features.custom_integrations) features.push('Custom integrations');
  if (plan.features.dedicated_support) features.push('Dedicated account manager');

  return (
    <div
      className={`relative bg-white rounded-lg border-2 p-6 flex flex-col h-full ${
        isPopular
          ? 'border-purple-600 shadow-lg'
          : isCurrent
          ? 'border-green-500'
          : 'border-gray-200'
      }`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrent && (
        <div className="absolute -top-3 right-4">
          <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Current Plan
          </span>
        </div>
      )}

      {/* Plan Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        {plan.description && (
          <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
        )}
        
        <div className="flex items-baseline justify-center">
          {priceMonthly === 0 ? (
            <span className="text-4xl font-bold text-gray-900">FREE</span>
          ) : (
            <>
              <span className="text-4xl font-bold text-gray-900">
                ${price.toFixed(2)}
              </span>
              <span className="text-gray-600 ml-2">/month</span>
            </>
          )}
        </div>

        {billingCycle === 'annual' && priceMonthly > 0 && (
          <p className="text-sm text-green-600 mt-2">
            Save ${annualSavings.toFixed(0)}/year ({savingsPercent}% off)
          </p>
        )}

        {isTrial && plan.limits.trial_days && (
          <p className="text-sm text-gray-600 mt-2">{plan.limits.trial_days} days free trial</p>
        )}
      </div>

      {/* Features - flex-grow to take available space */}
      <ul className="space-y-3 mb-6 flex-grow">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start">
            <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button - pushed to bottom */}
      <button
        onClick={onSelect}
        disabled={isCurrent}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors mt-auto ${
          isCurrent
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : isPopular
            ? 'bg-purple-600 text-white hover:bg-purple-700'
            : 'bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200'
        }`}
      >
        {isCurrent ? 'Current Plan' : isTrial ? 'Start Free Trial' : 'Select Plan'}
      </button>
    </div>
  );
}

