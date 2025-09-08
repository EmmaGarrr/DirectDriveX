import { CloudUpload, HardDrive, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { HetznerStats } from '@/types/hetzner';

interface HetznerStatsDashboardProps {
  stats: HetznerStats | null;
}

export function HetznerStatsDashboard({ stats }: HetznerStatsDashboardProps) {
  // Calculate storage health indicators
  const getStorageUsagePercentage = () => {
    if (!stats?.total_storage) return 0;
    // Assuming 1TB total capacity for demo purposes
    const totalCapacity = 1024 * 1024 * 1024 * 1024; // 1TB in bytes
    return Math.min((stats.total_storage / totalCapacity) * 100, 100);
  };

  const getStorageHealthStatus = () => {
    const usage = getStorageUsagePercentage();
    if (usage < 50) return { status: 'healthy', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (usage < 80) return { status: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { status: 'critical', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const storageHealth = getStorageHealthStatus();
  const storageUsage = getStorageUsagePercentage();

  const statsCards = [
    {
      title: 'Backed Up Files',
      value: stats?.total_files || 0,
      icon: CloudUpload,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Total Storage',
      value: stats?.total_storage_formatted || '0 B',
      icon: HardDrive,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      trend: `${storageUsage.toFixed(1)}% used`,
      trendUp: storageUsage > 80,
      subtitle: `Storage Health: ${storageHealth.status.toUpperCase()}`
    },
    {
      title: 'Recent Backups',
      value: stats?.recent_backups || 0,
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      textColor: 'text-amber-600 dark:text-amber-400',
      trend: '+5%',
      trendUp: true
    },
    {
      title: 'Failed Backups',
      value: stats?.failed_backups || 0,
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400',
      trend: '-2%',
      trendUp: false
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="relative overflow-hidden bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
            
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className={`w-4 h-4 ${card.trendUp ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-sm font-medium ${card.trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {card.trend}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {card.value}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                  {card.title}
                </p>
                {card.subtitle && (
                  <p className={`text-xs font-medium mt-1 ${storageHealth.color}`}>
                    {card.subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}