import React from 'react';
import { Card } from './Card.js';
import { cn } from '../utils/cn.js';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  variant?: 'indigo' | 'emerald' | 'cyan' | 'purple' | 'amber';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'indigo',
}) => {
  const iconVariants = {
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };

  return (
    <Card className="relative overflow-hidden border border-gray-800/80 bg-[#111827]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
          <h4 className="text-2xl font-bold text-white mt-1.5">{value}</h4>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <span className="inline-block text-xs font-medium text-emerald-400 mt-2">
              {trend}
            </span>
          )}
        </div>
        <div
          className={cn(
            'p-2.5 rounded-xl border flex items-center justify-center shrink-0',
            iconVariants[variant]
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};
