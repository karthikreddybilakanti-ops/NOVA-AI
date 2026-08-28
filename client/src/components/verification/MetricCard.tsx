import React from 'react';
import { Card } from '../common/Card';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  color = 'text-violet-600 bg-violet-50 border-violet-200',
}) => {
  return (
    <Card className="p-4 sm:p-5 flex items-start justify-between relative overflow-hidden">
      <div className="space-y-1">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="text-[11px] text-slate-500 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      <div className={`p-2.5 rounded-xl border shrink-0 ${color}`}>
        {icon}
      </div>
    </Card>
  );
};
