import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatBRL, formatPercent } from '@/lib/formatters';

type Variant = 'green' | 'red' | 'blue' | 'amber' | 'neutral';

interface KpiCardProps {
  label: string;
  value: number;
  format?: 'currency' | 'percent';
  icon: LucideIcon;
  variant?: Variant;
  trend?: number;    // percentual de variação vs mês anterior
  subtitle?: string;
}

const variantStyles: Record<Variant, { icon: string; border: string; badge: string }> = {
  green:   { icon: 'bg-argon-green/10 text-argon-green',      border: 'border-l-argon-green',      badge: 'bg-argon-green-50 text-argon-green-dark' },
  red:     { icon: 'bg-red-50 text-argon-red',                border: 'border-l-argon-red',         badge: 'bg-argon-red-50 text-argon-red' },
  blue:    { icon: 'bg-argon-blue-50 text-argon-blue',        border: 'border-l-argon-blue',        badge: 'bg-argon-blue-50 text-argon-blue' },
  amber:   { icon: 'bg-argon-amber-50 text-argon-amber',      border: 'border-l-argon-amber',       badge: 'bg-argon-amber-50 text-argon-amber' },
  neutral: { icon: 'bg-gray-100 text-gray-500',               border: 'border-l-gray-300',          badge: 'bg-gray-100 text-gray-600' },
};

export function KpiCard({ label, value, format = 'currency', icon: Icon, variant = 'neutral', trend, subtitle }: KpiCardProps) {
  const s = variantStyles[variant];
  const displayValue = format === 'currency' ? formatBRL(value) : formatPercent(value);

  const TrendIcon = trend === undefined || trend === 0 ? Minus : trend > 0 ? TrendingUp : TrendingDown;
  const trendColor = trend === undefined || trend === 0 ? 'text-gray-400' : trend > 0 ? 'text-argon-green' : 'text-argon-red';

  return (
    <div className={clsx('relative bg-white rounded-xl shadow-card border-l-4 p-5 transition-shadow hover:shadow-card-hover', s.border)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
          <p className={clsx('mt-2 text-2xl font-bold text-brl truncate', value < 0 ? 'text-argon-red' : 'text-gray-900')}>
            {displayValue}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={clsx('mt-2 flex items-center gap-1 text-xs font-medium', trendColor)}>
              <TrendIcon className="h-3 w-3" />
              <span>{trend > 0 ? '+' : ''}{trend.toFixed(1)}% vs mês anterior</span>
            </div>
          )}
        </div>
        <div className={clsx('ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', s.icon)}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
