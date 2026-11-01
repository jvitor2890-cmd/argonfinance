'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatBRL } from '@/lib/formatters';

const COLORS = ['#1D6FA4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

interface Props {
  data: { categoria: string; valor: number }[];
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold text-gray-700">{item.name}</p>
      <p className="text-gray-500">{formatBRL(item.value)}</p>
      <p className="text-gray-400 text-xs">{item.payload.pct?.toFixed(1)}% do total</p>
    </div>
  );
}

export function ExpenseBreakdownChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.valor, 0);
  const chartData = data.map((d) => ({ ...d, name: d.categoria, pct: (d.valor / total) * 100 }));

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Composição das Despesas</h3>
        <p className="text-xs text-gray-400 mt-0.5">Acumulado no período</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            dataKey="valor"
            paddingAngle={2}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(v) => <span style={{ fontSize: 10, color: '#64748B' }}>{v}</span>}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Top 3 por valor */}
      <div className="mt-3 space-y-2 border-t border-gray-50 pt-3">
        {chartData.slice(0, 3).map((d, i) => (
          <div key={d.categoria} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="text-gray-600 truncate max-w-[100px]">{d.categoria}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-16 rounded-full bg-gray-100">
                <div
                  className="h-1 rounded-full"
                  style={{ width: `${d.pct}%`, background: COLORS[i % COLORS.length] }}
                />
              </div>
              <span className="text-gray-400 w-8 text-right">{d.pct.toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
