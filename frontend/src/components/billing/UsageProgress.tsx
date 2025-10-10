import { AlertCircle } from 'lucide-react';

interface UsageProgressProps {
  label: string;
  current: number;
  limit: number;
  unit?: string;
}

export function UsageProgress({ label, current, limit, unit = '' }: UsageProgressProps) {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min(100, (current / limit) * 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  const getColor = () => {
    if (isUnlimited) return 'bg-gray-200';
    if (isAtLimit) return 'bg-red-600';
    if (isNearLimit) return 'bg-orange-500';
    return 'bg-purple-600';
  };

  const getTextColor = () => {
    if (isAtLimit) return 'text-red-600';
    if (isNearLimit) return 'text-orange-600';
    return 'text-gray-900';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-semibold ${getTextColor()}`}>
          {isUnlimited ? (
            'Unlimited'
          ) : (
            <>
              {current.toLocaleString()} / {limit.toLocaleString()} {unit}
            </>
          )}
        </span>
      </div>

      {!isUnlimited && (
        <>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getColor()}`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {isNearLimit && (
            <div className="flex items-start space-x-2 mt-3 p-2 bg-orange-50 rounded">
              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-orange-800">
                {isAtLimit
                  ? `You've reached your ${label.toLowerCase()} limit. Upgrade to continue.`
                  : `You've used ${percentage.toFixed(0)}% of your ${label.toLowerCase()}. Consider upgrading.`}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

