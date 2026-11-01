'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { formatBRL } from '@/lib/formatters';
import type { MonthlyData } from '@/types';

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as MonthlyData;
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-700 mb-2 capitalize">{label}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Resultado</span>
          <span className={`font-semibold ${d.resultado >= 0 ? 'text-argon-green' : 'text-argon-red'}`}>
            {formatBRL(d.resultado)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Margem</span>
          <span className="font-medium text-gray-700">{d.margem.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

export function MonthlyEvolutionChart({ data }: { data: MonthlyData[] }) {
  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-800">Evolução do Resultado</h3>
        <p className="text-xs text-gray-400 mt-0.5">Resultado gerencial mensal</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
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
          <ReferenceLine y={0} stroke="#E2E8F0" strokeDasharray="4 2" />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E2E8F0' }} />
          <Line
            type="monotone"
            dataKey="resultado"
            name="Resultado"
            stroke="#1D6FA4"
            strokeWidth={2.5}
            dot={{ fill: '#1D6FA4', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
