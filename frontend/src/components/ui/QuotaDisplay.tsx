import { QuotaInfo } from '@/services/uploadService';

interface QuotaDisplayProps {
  quotaInfo: QuotaInfo | null;
}

export function QuotaDisplay({ quotaInfo }: QuotaDisplayProps) {
  if (!quotaInfo) return null;

  // Add safety checks for numeric values
  const currentUsage = quotaInfo.current_usage_gb ?? 0;
  const dailyLimit = quotaInfo.daily_limit_gb ?? 0;
  const remaining = quotaInfo.remaining_gb ?? 0;
  const usagePercentage = quotaInfo.usage_percentage ?? 0;

  const getColorClass = () => {
    if (usagePercentage >= 90) return 'from-red-500 to-red-600';
    if (usagePercentage >= 75) return 'from-orange-500 to-orange-600';
    if (usagePercentage >= 50) return 'from-yellow-500 to-yellow-600';
    return 'from-blue-500 to-blue-600';
  };

  return (
    <div className="p-3 mb-4 border bg-gradient-to-r from-blue-50/20 to-white border-blue-300/30 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">Daily Usage</span>
        <span className="text-sm font-bold text-blue-600">
          {currentUsage.toFixed(1)}GB / {dailyLimit}GB
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-200">
        <div 
          className={`bg-gradient-to-r ${getColorClass()} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-slate-500">
          {remaining.toFixed(1)}GB remaining
        </span>
        <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
          {quotaInfo.user_type === 'authenticated' ? 'Authenticated' : 'Guest'}
        </span>
      </div>
    </div>
  );
}
