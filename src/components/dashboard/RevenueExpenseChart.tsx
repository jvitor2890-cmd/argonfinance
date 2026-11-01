'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatBRL } from '@/lib/formatters';
import type { MonthlyData } from '@/types';

interface Props {
  data: MonthlyData[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-700 mb-2 capitalize">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-gray-500 w-20">{p.name}:</span>
          <span className="font-medium text-gray-800">{formatBRL(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function RevenueExpenseChart({ data }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-800">Receitas × Despesas</h3>
        <p className="text-xs text-gray-400 mt-0.5">Comparativo mensal</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="mes"
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            width={36}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(v) => <span style={{ fontSize: 11, color: '#64748B' }}>{v}</span>}
          />
          <Bar dataKey="receita" name="Receita" fill="#10B981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="despesa" name="Despesa" fill="#EF4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
