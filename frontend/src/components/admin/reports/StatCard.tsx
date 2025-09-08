import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  label: string;
  icon: LucideIcon;
  colorClass: string;
}

export function StatCard({ title, value, label, icon: Icon, colorClass }: StatCardProps) {
  return (
    <div className="p-6 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/5 dark:shadow-black/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</h3>
        <div className={cn("p-2 rounded-lg", colorClass.replace('text-', 'bg-').replace('600', '100').replace('dark:bg-slate-800/95', 'dark:bg-opacity-30'))}>
          <Icon className={cn("w-5 h-5", colorClass)} />
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold text-slate-900 dark:text-white">{value}</div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
      </div>
    </div>
  );
}