'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, ArrowDownCircle, ArrowUpCircle,
  Activity, AlertCircle, CheckCircle2, Loader2,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { RevenueExpenseChart } from '@/components/dashboard/RevenueExpenseChart';
import { MonthlyEvolutionChart } from '@/components/dashboard/MonthlyEvolutionChart';
import { ExpenseBreakdownChart } from '@/components/dashboard/ExpenseBreakdownChart';
import { calcularDashboardMetrics } from '@/lib/demo-data';
import { formatBRL, formatMonthFull } from '@/lib/formatters';
import { createClient } from '@/lib/supabase/client';
import { useEmpresa } from '@/contexts/EmpresaContext';
import clsx from 'clsx';
import type { Lancamento, Compromisso } from '@/types';

function fromLancDB(row: Record<string, unknown>): Lancamento {
  return {
    id: row.id as string,
    data: row.data as string,
    descricao: row.descricao as string,
    categoria: row.categoria as string,
    tipo: row.tipo as 'receita' | 'despesa',
    valor: Number(row.valor),
    formaPagamento: (row.forma_pagamento as string) || '',
  };
}

function DashboardContent() {
  const { empresaAtiva } = useEmpresa();
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [loading, setLoading] = useState(true);

  const mesRef = new Date().toISOString().slice(0, 7);

  const loadData = useCallback(async () => {
    if (!empresaAtiva) {
      setLancamentos([]);
      setCompromissos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const [{ data: lancs }, { data: comps }] = await Promise.all([
      supabase.from('lancamentos').select('*').eq('empresa_id', empresaAtiva.id),
      supabase.from('compromissos').select('*').eq('empresa_id', empresaAtiva.id),
    ]);
    setLancamentos((lancs ?? []).map(fromLancDB));
    setCompromissos((comps ?? []) as Compromisso[]);
    setLoading(false);
  }, [empresaAtiva]);

  useEffect(() => { loadData(); }, [loadData]);

  if (!empresaAtiva) {
    return (
      <div className="p-6 lg:p-8 space-y-6 max-w-screen-xl mx-auto flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-600">Nenhuma empresa selecionada</p>
          <p className="mt-1 text-sm text-slate-400">Selecione ou cadastre uma empresa no menu lateral</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-argon-blue" />
      </div>
    );
  }

  const mesAnterior = new Date();
  mesAnterior.setMonth(mesAnterior.getMonth() - 1);
  const mesRefAnterior = mesAnterior.toISOString().slice(0, 7);

  const m = calcularDashboardMetrics(lancamentos, compromissos, mesRef);
  const anterior = calcularDashboardMetrics(lancamentos, compromissos, mesRefAnterior);

  const trendReceita = anterior.receitaTotal > 0
    ? ((m.receitaTotal - anterior.receitaTotal) / anterior.receitaTotal) * 100 : 0;
  const trendDespesa = anterior.despesaTotal > 0
    ? ((m.despesaTotal - anterior.despesaTotal) / anterior.despesaTotal) * 100 : 0;
  const trendResultado = anterior.resultadoGerencial !== 0
    ? ((m.resultadoGerencial - anterior.resultadoGerencial) / Math.abs(anterior.resultadoGerencial)) * 100 : 0;

  const comprAtrasados = compromissos.filter(c => c.status === 'atrasado');
  const valorAtrasado = comprAtrasados.reduce((s, c) => s + c.valor, 0);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          </div>
          <p className="mt-1 text-sm text-gray-400 capitalize">
            {empresaAtiva.nome} · {formatMonthFull(mesRef)}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 rounded-lg bg-argon-navy px-3 py-2">
          <Activity className="h-4 w-4 text-argon-green" />
          <span className="text-xs font-medium text-gray-300">Dados ao vivo</span>
        </div>
      </div>

      {comprAtrasados.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-argon-red shrink-0" />
          <p className="text-sm text-red-700">
            <span className="font-semibold">{comprAtrasados.length} compromisso{comprAtrasados.length > 1 ? 's' : ''} em atraso</span>
            {' '}— total de {formatBRL(valorAtrasado)}. Verifique a página de Contas.
          </p>
        </div>
      )}

      {lancamentos.length === 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-sm text-blue-700">
            Nenhum lançamento encontrado para <strong>{empresaAtiva.nome}</strong>.
            {' '}Adicione lançamentos na página de Lançamentos para ver os indicadores.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard label="Receita Total" value={m.receitaTotal} icon={TrendingUp} variant="green" trend={trendReceita} subtitle="Competência do mês" />
        <KpiCard label="Despesas Totais" value={m.despesaTotal} icon={TrendingDown} variant="red" trend={trendDespesa} subtitle="Competência do mês" />
        <KpiCard
          label="Resultado Gerencial"
          value={m.resultadoGerencial}
          icon={DollarSign}
          variant={m.resultadoGerencial >= 0 ? 'green' : 'red'}
          trend={trendResultado}
          subtitle="Receitas − Despesas"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          label="Margem Gerencial"
          value={m.margemGerencial}
          format="percent"
          icon={Activity}
          variant={m.margemGerencial >= 20 ? 'green' : m.margemGerencial >= 10 ? 'amber' : 'red'}
          subtitle="Resultado / Receita"
        />
        <KpiCard label="Contas a Pagar" value={m.contasAPagar} icon={ArrowDownCircle} variant="amber" subtitle="Pendentes + atrasadas" />
        <KpiCard label="Contas a Receber" value={m.contasAReceber} icon={ArrowUpCircle} variant="blue" subtitle="Pendentes + atrasadas" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RevenueExpenseChart data={m.monthlyData} />
        <MonthlyEvolutionChart data={m.monthlyData} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ExpenseBreakdownChart data={m.despesasPorCategoria} />

        <div className="lg:col-span-2 bg-white rounded-xl shadow-card p-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Resumo Executivo</h3>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">{formatMonthFull(mesRef)}</p>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Receita bruta', value: m.receitaTotal, color: 'text-argon-green' },
              { label: 'Total de despesas', value: -m.despesaTotal, color: 'text-argon-red', indent: true },
              { label: 'Resultado gerencial', value: m.resultadoGerencial, color: m.resultadoGerencial >= 0 ? 'text-argon-blue' : 'text-argon-red', bold: true },
            ].map((row) => (
              <div key={row.label} className={clsx('flex items-center justify-between', row.indent && 'pl-4')}>
                <div className="flex items-center gap-2">
                  {row.indent ? (
                    <span className="text-gray-200">└</span>
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-gray-300" />
                  )}
                  <span className={clsx('text-sm', row.bold ? 'font-semibold text-gray-800' : 'text-gray-500')}>
                    {row.label}
                  </span>
                </div>
                <span className={clsx('text-sm font-semibold', row.color)}>
                  {formatBRL(Math.abs(row.value))}
                </span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-3 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Margem gerencial</span>
                <span className={clsx(
                  'rounded-full px-2.5 py-0.5 text-xs font-bold',
                  m.margemGerencial >= 20 ? 'bg-argon-green-50 text-argon-green-dark' :
                  m.margemGerencial >= 10 ? 'bg-argon-amber-50 text-amber-700' :
                  'bg-argon-red-50 text-argon-red'
                )}>
                  {m.margemGerencial.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-argon-blue/5 border border-argon-blue/10 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-argon-blue mb-1">Nota gerencial</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Este painel apresenta o resultado gerencial de competência, com base nos lançamentos registrados.
              O resultado gerencial <strong>não representa o saldo bancário</strong> e não substitui as demonstrações contábeis oficiais.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  );
}
