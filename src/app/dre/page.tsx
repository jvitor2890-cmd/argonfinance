'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import { AlertCircle, ChevronDown, ChevronUp, Minus, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { AppShell } from '@/components/layout/AppShell';
import { formatBRL, formatPercent } from '@/lib/formatters';
import { createClient } from '@/lib/supabase/client';
import { useEmpresa } from '@/contexts/EmpresaContext';
import type { Lancamento } from '@/types';

const MESES_LABELS = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function getMesesDisponiveis() {
  const now = new Date();
  const ano = now.getFullYear();
  return Array.from({ length: now.getMonth() + 1 }, (_, i) => {
    const m = i + 1;
    return { value: `${ano}-${String(m).padStart(2, '0')}`, label: `${MESES_LABELS[m]}/${ano}` };
  });
}

interface DRE {
  receitaBruta: number;
  impostos: number;
  receitaLiquida: number;
  custoServicos: number;
  lucroBruto: number;
  margemBruta: number;
  despesasOp: { infraestrutura: number; tecnologia: number; marketing: number; contabilidade: number; viagens: number; outros: number; total: number };
  resultadoOperacional: number;
  margemOperacional: number;
}

function calcularDRE(mesISO: string, lancamentos: Lancamento[]): DRE {
  const do_mes = lancamentos.filter(l => l.data.startsWith(mesISO));
  const receitas = do_mes.filter(l => l.tipo === 'receita');
  const despesas = do_mes.filter(l => l.tipo === 'despesa');

  const receitaBruta = receitas.reduce((s, l) => s + l.valor, 0);
  const impostos = despesas.filter(l => l.categoria === 'Impostos').reduce((s, l) => s + l.valor, 0);
  const receitaLiquida = receitaBruta - impostos;
  const custoServicos = despesas.filter(l => l.categoria === 'Pessoal').reduce((s, l) => s + l.valor, 0);
  const lucroBruto = receitaLiquida - custoServicos;
  const margemBruta = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0;

  const soma = (cat: string) => despesas.filter(l => l.categoria === cat).reduce((s, l) => s + l.valor, 0);
  const infraestrutura = soma('Infraestrutura');
  const tecnologia = soma('Tecnologia');
  const marketing = soma('Marketing');
  const contabilidade = soma('Contabilidade');
  const viagens = soma('Viagens');
  const outros = despesas.filter(l =>
    !['Impostos', 'Pessoal', 'Infraestrutura', 'Tecnologia', 'Marketing', 'Contabilidade', 'Viagens'].includes(l.categoria)
  ).reduce((s, l) => s + l.valor, 0);
  const total = infraestrutura + tecnologia + marketing + contabilidade + viagens + outros;

  const resultadoOperacional = lucroBruto - total;
  const margemOperacional = receitaBruta > 0 ? (resultadoOperacional / receitaBruta) * 100 : 0;

  return {
    receitaBruta, impostos, receitaLiquida, custoServicos, lucroBruto, margemBruta,
    despesasOp: { infraestrutura, tecnologia, marketing, contabilidade, viagens, outros, total },
    resultadoOperacional, margemOperacional,
  };
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-white p-3 shadow-lg border border-slate-100 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.name === 'Resultado' ? (p.value >= 0 ? '#10B981' : '#EF4444') : '#1D6FA4' }}>
          {p.name}: {formatBRL(p.value)}
        </p>
      ))}
    </div>
  );
}

function DreRow({ label, valor, indent = false, isTotal = false, isSubtotal = false, isDeduction = false, receitaBruta = 0 }: {
  label: string; valor: number; indent?: boolean; isTotal?: boolean; isSubtotal?: boolean; isDeduction?: boolean; receitaBruta?: number;
}) {
  const pct = receitaBruta > 0 ? (valor / receitaBruta) * 100 : 0;

  return (
    <div className={clsx(
      'flex items-center justify-between py-2.5 px-4 transition-colors',
      isTotal ? 'bg-argon-navy text-white rounded-lg mt-1' :
        isSubtotal ? 'bg-argon-blue-50 rounded-lg font-semibold text-argon-blue' :
          indent ? 'border-b border-slate-50 hover:bg-slate-50/80' : 'border-b border-slate-100'
    )}>
      <div className={clsx('flex items-center gap-2 text-sm', indent && 'pl-4')}>
        {isDeduction && <Minus className="h-3 w-3 shrink-0 text-red-400" />}
        <span className={clsx(
          isTotal ? 'font-bold text-white' :
            isSubtotal ? 'font-semibold' :
              indent ? 'text-slate-500' : 'font-medium text-slate-700'
        )}>
          {label}
        </span>
      </div>
      <div className="flex items-center gap-4">
        {receitaBruta > 0 && !isTotal && (
          <span className="text-xs tabular-nums w-12 text-right text-slate-400">{formatPercent(pct, 1)}</span>
        )}
        <span className={clsx(
          'text-sm tabular-nums font-semibold w-32 text-right',
          isTotal ? 'text-white' :
            isDeduction ? 'text-red-500' :
              isSubtotal ? (valor >= 0 ? 'text-argon-blue' : 'text-red-500') :
                indent ? 'text-slate-600' : 'text-slate-800'
        )}>
          {isDeduction ? `(${formatBRL(valor)})` : formatBRL(valor)}
        </span>
      </div>
    </div>
  );
}

function DreContent() {
  const { empresaAtiva } = useEmpresa();
  const mesesDisponiveis = getMesesDisponiveis();
  const [mesSelecionado, setMesSelecionado] = useState(() => new Date().toISOString().slice(0, 7));
  const [showMensalChart, setShowMensalChart] = useState(true);
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!empresaAtiva) { setLancamentos([]); setLoading(false); return; }
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('lancamentos')
      .select('*')
      .eq('empresa_id', empresaAtiva.id);
    setLancamentos((data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      data: row.data as string,
      descricao: row.descricao as string,
      categoria: row.categoria as string,
      tipo: row.tipo as 'receita' | 'despesa',
      valor: Number(row.valor),
      formaPagamento: (row.forma_pagamento as string) || '',
    })));
    setLoading(false);
  }, [empresaAtiva]);

  useEffect(() => { loadData(); }, [loadData]);

  const dre = useMemo(() => calcularDRE(mesSelecionado, lancamentos), [mesSelecionado, lancamentos]);
  const mesLabel = mesesDisponiveis.find(m => m.value === mesSelecionado)?.label ?? mesSelecionado;

  const chartData = useMemo(() => mesesDisponiveis.map(m => {
    const d = calcularDRE(m.value, lancamentos);
    return { mes: m.label.slice(0, 3), receita: d.receitaBruta, resultado: d.resultadoOperacional };
  }), [lancamentos, mesesDisponiveis]);

  const waterfallData = [
    { name: 'Rec. Bruta', valor: dre.receitaBruta, color: '#10B981' },
    { name: '(-) Impostos', valor: -dre.impostos, color: '#F59E0B' },
    { name: 'Rec. Líquida', valor: dre.receitaLiquida, color: '#1D6FA4' },
    { name: '(-) Pessoal', valor: -dre.custoServicos, color: '#EF4444' },
    { name: 'Lucro Bruto', valor: dre.lucroBruto, color: dre.lucroBruto >= 0 ? '#1D6FA4' : '#EF4444' },
    { name: '(-) Desp. Op.', valor: -dre.despesasOp.total, color: '#EF4444' },
    { name: 'Resultado', valor: dre.resultadoOperacional, color: dre.resultadoOperacional >= 0 ? '#10B981' : '#EF4444' },
  ];

  if (!empresaAtiva) {
    return (
      <div className="min-h-screen bg-argon-surface p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-600">Nenhuma empresa selecionada</p>
          <p className="mt-1 text-sm text-slate-400">Selecione ou cadastre uma empresa no menu lateral</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-argon-surface p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">DRE Gerencial</h1>
          <p className="mt-0.5 text-sm text-slate-500">{empresaAtiva.nome} · competência mensal</p>
        </div>
        <select
          value={mesSelecionado}
          onChange={e => setMesSelecionado(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-argon-blue focus:outline-none"
        >
          {mesesDisponiveis.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <p className="text-xs text-amber-800">
          <span className="font-semibold">Nota gerencial:</span> DRE de competência com base nos lançamentos registrados.
          Não representa saldo bancário e não substitui demonstrações contábeis oficiais.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-argon-blue" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3 rounded-xl bg-white shadow-card overflow-hidden">
              <div className="border-b border-slate-100 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-700">Demonstração do Resultado — {mesLabel}</h2>
              </div>
              <div className="p-2">
                <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Receita</p>
                <DreRow label="Receita Bruta de Serviços" valor={dre.receitaBruta} receitaBruta={dre.receitaBruta} />
                <DreRow label="(-) Impostos sobre Serviços (ISS)" valor={dre.impostos} isDeduction receitaBruta={dre.receitaBruta} indent />
                <DreRow label="Receita Líquida de Serviços" valor={dre.receitaLiquida} isSubtotal receitaBruta={dre.receitaBruta} />

                <p className="px-4 py-1.5 mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Custo dos Serviços</p>
                <DreRow label="(-) Custo com Pessoal" valor={dre.custoServicos} isDeduction receitaBruta={dre.receitaBruta} indent />
                <DreRow label={`Lucro Bruto  ·  Margem ${formatPercent(dre.margemBruta, 1)}`} valor={dre.lucroBruto} isSubtotal receitaBruta={dre.receitaBruta} />

                <p className="px-4 py-1.5 mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Despesas Operacionais</p>
                {dre.despesasOp.infraestrutura > 0 && <DreRow label="(-) Infraestrutura" valor={dre.despesasOp.infraestrutura} isDeduction receitaBruta={dre.receitaBruta} indent />}
                {dre.despesasOp.tecnologia > 0 && <DreRow label="(-) Tecnologia" valor={dre.despesasOp.tecnologia} isDeduction receitaBruta={dre.receitaBruta} indent />}
                {dre.despesasOp.marketing > 0 && <DreRow label="(-) Marketing" valor={dre.despesasOp.marketing} isDeduction receitaBruta={dre.receitaBruta} indent />}
                {dre.despesasOp.contabilidade > 0 && <DreRow label="(-) Contabilidade" valor={dre.despesasOp.contabilidade} isDeduction receitaBruta={dre.receitaBruta} indent />}
                {dre.despesasOp.viagens > 0 && <DreRow label="(-) Viagens" valor={dre.despesasOp.viagens} isDeduction receitaBruta={dre.receitaBruta} indent />}
                {dre.despesasOp.outros > 0 && <DreRow label="(-) Outros" valor={dre.despesasOp.outros} isDeduction receitaBruta={dre.receitaBruta} indent />}
                <DreRow label="Total Desp. Operacionais" valor={dre.despesasOp.total} isDeduction receitaBruta={dre.receitaBruta} />

                <div className="mt-3">
                  <DreRow label={`RESULTADO OPERACIONAL  ·  Margem ${formatPercent(dre.margemOperacional, 1)}`} valor={dre.resultadoOperacional} isTotal receitaBruta={dre.receitaBruta} />
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="rounded-xl bg-white shadow-card p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Resumo do Mês</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Receita Bruta', value: dre.receitaBruta, color: 'text-emerald-600' },
                    { label: 'Impostos', value: -dre.impostos, color: 'text-amber-600' },
                    { label: 'Custo Pessoal', value: -dre.custoServicos, color: 'text-red-500' },
                    { label: 'Desp. Operacionais', value: -dre.despesasOp.total, color: 'text-red-500' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{item.label}</span>
                      <span className={clsx('text-sm font-semibold tabular-nums', item.color)}>
                        {item.value < 0 ? `(${formatBRL(Math.abs(item.value))})` : formatBRL(item.value)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">Resultado</span>
                    <span className={clsx('text-base font-bold tabular-nums', dre.resultadoOperacional >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                      {formatBRL(dre.resultadoOperacional)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white shadow-card p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Composição — {mesLabel}</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={waterfallData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<ChartTooltip />} />
                    <ReferenceLine y={0} stroke="#e2e8f0" />
                    <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                      {waterfallData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-white shadow-card">
            <button
              onClick={() => setShowMensalChart(p => !p)}
              className="flex w-full items-center justify-between px-5 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors rounded-xl"
            >
              <span>Evolução Mensal — Receita × Resultado</span>
              {showMensalChart ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showMensalChart && (
              <div className="px-4 pb-5">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 0, right: 16, left: -10, bottom: 0 }} barGap={4}>
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<ChartTooltip />} />
                    <ReferenceLine y={0} stroke="#e2e8f0" strokeWidth={1.5} />
                    <Bar dataKey="receita" name="Receita" fill="#10B981" radius={[3, 3, 0, 0]} opacity={0.85} />
                    <Bar dataKey="resultado" name="Resultado" radius={[3, 3, 0, 0]}>
                      {chartData.map((entry, i) => <Cell key={i} fill={entry.resultado >= 0 ? '#1D6FA4' : '#EF4444'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-6 mt-1">
                  <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /><span className="text-xs text-slate-500">Receita</span></div>
                  <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-argon-blue" /><span className="text-xs text-slate-500">Resultado positivo</span></div>
                  <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-red-500" /><span className="text-xs text-slate-500">Resultado negativo</span></div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function DrePage() {
  return (
    <AppShell>
      <DreContent />
    </AppShell>
  );
}
