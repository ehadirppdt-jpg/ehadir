import React, { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  variant?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate';
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'blue',
  trend,
  onClick,
}) => {
  const variantStyles = {
    blue: {
      card: 'border-blue-100 hover:border-blue-300',
      iconBox: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    emerald: {
      card: 'border-emerald-100 hover:border-emerald-300',
      iconBox: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    amber: {
      card: 'border-amber-100 hover:border-amber-300',
      iconBox: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    rose: {
      card: 'border-rose-100 hover:border-rose-300',
      iconBox: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    purple: {
      card: 'border-purple-100 hover:border-purple-300',
      iconBox: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    slate: {
      card: 'border-slate-200 hover:border-slate-300',
      iconBox: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  };

  const selected = variantStyles[variant];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border p-5 shadow-sm transition-all duration-200 ${selected.card} ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${selected.iconBox}`}>
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</div>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-medium">
          {trend.isPositive ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
          )}
          <span className={trend.isPositive ? 'text-emerald-700' : 'text-rose-700'}>
            {trend.value}
          </span>
          <span className="text-slate-400 text-[11px]">berbanding semalam</span>
        </div>
      )}
    </div>
  );
};
