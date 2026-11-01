'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, RefreshCw, Info, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { AppShell } from '@/components/layout/AppShell';
import { formatBRL, formatPercent } from '@/lib/formatters';
import { createClient } from '@/lib/supabase/client';
import { useEmpresa } from '@/contexts/EmpresaContext';
import type { Lancamento } from '@/types';

const TICKET_MEDIO = 20000;
const CUSTO_CONTRATACAO = 8000;

const DEFAULTS = {
  aumentoFaturamento: 0,
  novosClientes: 0,
  reducaoDespOp: 0,
  novasContratacoes: 0,
  aumentoPessoal: 0,
  investMarketing: 0,
};

interface Base { receitas: number; impostos: number; pessoal: number; despOp: number }
interface Vars { [k: string]: number }

function calcBase(lancamentos: Lancamento[], mesISO: string): Base {
  const do_mes = lancamentos.filter(l => l.data.startsWith(mesISO));
  const receitas = do_mes.filter(l => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0);
  const impostos = do_mes.filter(l => l.tipo === 'despesa' && l.categoria === 'Impostos').reduce((s, l) => s + l.valor, 0);
  const pessoal = do_mes.filter(l => l.tipo === 'despesa' && l.categoria === 'Pessoal').reduce((s, l) => s + l.valor, 0);
  const despOp = do_mes.filter(l =>
    l.tipo === 'despesa' && !['Impostos', 'Pessoal'].includes(l.categoria)
  ).reduce((s, l) => s + l.valor, 0);
  return { receitas, impostos, pessoal, despOp };
}

function simular(base: Base, v: Vars) {
  const receitaExtra = base.receitas * (v.aumentoFaturamento / 100) + v.novosClientes * TICKET_MEDIO;
  const receitaSim = base.receitas + receitaExtra;
  const aliquotaISS = base.receitas > 0 ? base.impostos / base.receitas : 0;
  const impostosSim = receitaSim * aliquotaISS;
  const pessoalSim = base.pessoal * (1 + v.aumentoPessoal / 100) + v.novasContratacoes * CUSTO_CONTRATACAO;
  const despOpSim = base.despOp * (1 - v.reducaoDespOp / 100) + v.investMarketing * 1000;
  const resultadoBase = base.receitas - base.impostos - base.pessoal - base.despOp;
  const resultadoSim = receitaSim - impostosSim - pessoalSim - despOpSim;
  const margemBase = base.receitas > 0 ? (resultadoBase / base.receitas) * 100 : 0;
  const margemSim = receitaSim > 0 ? (resultadoSim / receitaSim) * 100 : 0;
  return { receitaSim, impostosSim, pessoalSim, despOpSim, resultadoBase, resultadoSim, margemBase, margemSim };
}

function SliderRow({ label, sublabel, value, min, max, step, unit, onChange, color = 'blue' }: {
  label: string; sublabel?: string; value: number; min: number; max: number; step: number;
  unit: string; onChange: (v: number) => void; color?: 'green' | 'red' | 'blue' | 'amber';
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const trackColor = { green: '#10B981', red: '#EF4444', blue: '#1D6FA4', amber: '#F59E0B' }[color];
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700">{label}</p>
          {sublabel && <p className="text-xs text-slate-400">{sublabel}</p>}
        </div>
        <span className={clsx(
          'min-w-16 rounded-lg px-2.5 py-1 text-center text-sm font-bold tabular-nums',
          color === 'green' ? 'bg-emerald-50 text-emerald-600' :
          color === 'red' ? 'bg-red-50 text-red-600' :
          color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-argon-blue-50 text-argon-blue'
        )}>
          {unit === 'R$k' ? `R$${value}k` : unit === 'un' ? `${value} pessoa${value !== 1 ? 's' : ''}` : `${value}${unit}`}
        </span>
      </div>
      <div className="relative">
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, ${trackColor} 0%, ${trackColor} ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)` }}
        />
        <div className="flex justify-between mt-0.5">
          <span className="text-[10px] text-slate-400">{min}{unit === '%' ? '%' : ''}</span>
          <span className="text-[10px] text-slate-400">{max}{unit === '%' ? '%' : ''}</span>
        </div>
      </div>
    </div>
  );
}

function DeltaLine({ label, base, sim, format = 'brl' }: { label: string; base: number; sim: number; format?: 'brl' | 'pct' }) {
  const delta = sim - base;
  const deltaPct = base !== 0 ? (delta / Math.abs(base)) * 100 : 0;
  const isPositive = delta > 0;
  const isZero = Math.abs(delta) < 0.01;
  const fmt = (v: number) => format === 'pct' ? formatPercent(v, 1) : formatBRL(v);
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs tabular-nums text-slate-400 w-24 text-right">{fmt(base)}</span>
        <span className="text-[10px] text-slate-300">→</span>
        <span className="text-sm font-semibold tabular-nums text-slate-800 w-24 text-right">{fmt(sim)}</span>
        <div className={clsx('flex items-center gap-0.5 text-xs font-semibold w-16 justify-end', isZero ? 'text-slate-400' : isPositive ? 'text-emerald-600' : 'text-red-500')}>
          {isZero ? <Minus className="h-3 w-3" /> : isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {!isZero && `${isPositive ? '+' : ''}${deltaPct.toFixed(1)}%`}
        </div>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; fill: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-white p-3 shadow-lg border border-slate-100 text-xs space-y-1">
      <p className="font-semibold text-slate-700">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.fill }}>{p.name}: {formatBRL(p.value)}</p>)}
    </div>
  );
}

function SimuladorContent() {
  const { empresaAtiva } = useEmpresa();
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [vars, setVars] = useState<Vars>(DEFAULTS);

  const mesBase = new Date().toISOString().slice(0, 7);
  const mesLabel = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const loadData = useCallback(async () => {
    if (!empresaAtiva) { setLancamentos([]); setLoading(false); return; }
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from('lancamentos').select('*').eq('empresa_id', empresaAtiva.id);
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

  function set(key: keyof typeof DEFAULTS, value: number) { setVars(prev => ({ ...prev, [key]: value })); }
  function resetar() { setVars(DEFAULTS); }

  const base = useMemo(() => calcBase(lancamentos, mesBase), [lancamentos, mesBase]);
  const sim = useMemo(() => simular(base, vars), [base, vars]);
  const semAlteracoes = Object.values(vars).every(v => v === 0);
  const ganhoResultado = sim.resultadoSim - sim.resultadoBase;
  const ganhoMargem = sim.margemSim - sim.margemBase;

  const chartData = [
    { name: 'Receita', Atual: base.receitas, Simulado: sim.receitaSim },
    { name: 'Impostos', Atual: base.impostos, Simulado: sim.impostosSim },
    { name: 'Pessoal', Atual: base.pessoal, Simulado: sim.pessoalSim },
    { name: 'Desp. Op.', Atual: base.despOp, Simulado: sim.despOpSim },
    { name: 'Resultado', Atual: sim.resultadoBase, Simulado: sim.resultadoSim },
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

  if (loading) {
    return (
      <div className="min-h-screen bg-argon-surface p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-argon-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-argon-surface p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Simulador de Cenários</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {empresaAtiva.nome} · Base: {mesLabel}
          </p>
        </div>
        <button
          onClick={resetar}
          disabled={semAlteracoes}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Resetar
        </button>
      </div>

      <div className="mb-5 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-argon-blue" />
        <p className="text-xs text-argon-blue">
          <span className="font-semibold">Simulação gerencial:</span> Projeções hipotéticas com base nos lançamentos de {mesLabel}.
          {base.receitas === 0 && ' Cadastre lançamentos para ter uma base real de simulação.'}
          {' '}Não constitui previsão financeira oficial.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-xl bg-white shadow-card p-5">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-emerald-600">Alavancas de Receita</h2>
            <div className="space-y-5">
              <SliderRow label="Aumento de faturamento" sublabel="Expansão com clientes atuais" value={vars.aumentoFaturamento} min={0} max={100} step={5} unit="%" color="green" onChange={v => set('aumentoFaturamento', v)} />
              <SliderRow label="Novos clientes" sublabel={`Ticket médio: ${formatBRL(TICKET_MEDIO)}`} value={vars.novosClientes} min={0} max={10} step={1} unit="un" color="green" onChange={v => set('novosClientes', v)} />
            </div>
          </div>

          <div className="rounded-xl bg-white shadow-card p-5">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-red-500">Alavancas de Custo</h2>
            <div className="space-y-5">
              <SliderRow label="Redução de despesas operacionais" sublabel="Eficiência em infra, tecnologia, etc." value={vars.reducaoDespOp} min={0} max={50} step={5} unit="%" color="green" onChange={v => set('reducaoDespOp', v)} />
              <SliderRow label="Novas contratações" sublabel={`Custo médio: ${formatBRL(CUSTO_CONTRATACAO)}/mês`} value={vars.novasContratacoes} min={0} max={10} step={1} unit="un" color="red" onChange={v => set('novasContratacoes', v)} />
              <SliderRow label="Reajuste salarial (equipe atual)" sublabel="% sobre folha atual" value={vars.aumentoPessoal} min={0} max={30} step={5} unit="%" color="red" onChange={v => set('aumentoPessoal', v)} />
              <SliderRow label="Investimento extra em marketing" sublabel="Adicional ao orçamento atual" value={vars.investMarketing} min={0} max={50} step={5} unit="R$k" color="amber" onChange={v => set('investMarketing', v)} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className={clsx(
            'rounded-xl p-5 shadow-card',
            semAlteracoes ? 'bg-slate-100 border border-slate-200' :
              ganhoResultado >= 0 ? 'bg-emerald-600' : 'bg-red-600'
          )}>
            {semAlteracoes ? (
              <p className="text-center text-sm text-slate-500 py-2">Mova os controles ao lado para simular cenários.</p>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className={clsx('text-sm font-medium', ganhoResultado >= 0 ? 'text-emerald-100' : 'text-red-100')}>Impacto no resultado mensal</p>
                  <p className="text-3xl font-bold text-white mt-1">{ganhoResultado >= 0 ? '+' : ''}{formatBRL(ganhoResultado)}</p>
                </div>
                <div className="text-right">
                  <p className={clsx('text-sm', ganhoResultado >= 0 ? 'text-emerald-100' : 'text-red-100')}>Margem</p>
                  <p className="text-xl font-bold text-white">{formatPercent(sim.margemSim, 1)}</p>
                  <p className={clsx('text-xs', ganhoResultado >= 0 ? 'text-emerald-200' : 'text-red-200')}>
                    {ganhoMargem >= 0 ? '+' : ''}{ganhoMargem.toFixed(1)} p.p. vs atual
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-white shadow-card p-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Atual → Simulado</h3>
            <DeltaLine label="Receita Bruta" base={base.receitas} sim={sim.receitaSim} />
            <DeltaLine label="(−) Impostos sobre Serviços" base={base.impostos} sim={sim.impostosSim} />
            <DeltaLine label="(−) Custo com Pessoal" base={base.pessoal} sim={sim.pessoalSim} />
            <DeltaLine label="(−) Despesas Operacionais" base={base.despOp} sim={sim.despOpSim} />
            <div className="mt-2 pt-2 border-t-2 border-slate-200">
              <DeltaLine label="Resultado Operacional" base={sim.resultadoBase} sim={sim.resultadoSim} />
              <DeltaLine label="Margem Operacional" base={sim.margemBase} sim={sim.margemSim} format="pct" />
            </div>
          </div>

          <div className="rounded-xl bg-white shadow-card p-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Comparativo Visual</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 0, right: 8, left: -10, bottom: 0 }} barGap={4}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} iconType="square" iconSize={10} />
                <ReferenceLine y={0} stroke="#e2e8f0" />
                <Bar dataKey="Atual" fill="#94a3b8" radius={[3, 3, 0, 0]} opacity={0.7} />
                <Bar dataKey="Simulado" fill="#1D6FA4" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {!semAlteracoes && (
            <div className="rounded-xl bg-argon-navy-800 text-white p-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Projeção Anual (×12)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Resultado atual (×12)</p>
                  <p className="text-base font-bold text-white mt-0.5">{formatBRL(sim.resultadoBase * 12)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Resultado simulado (×12)</p>
                  <p className={clsx('text-base font-bold mt-0.5', ganhoResultado >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                    {formatBRL(sim.resultadoSim * 12)}
                  </p>
                </div>
                <div className="col-span-2 border-t border-white/10 pt-3">
                  <p className="text-xs text-slate-400">Ganho / perda anual projetado</p>
                  <p className={clsx('text-xl font-bold mt-0.5', ganhoResultado >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                    {ganhoResultado >= 0 ? '+' : ''}{formatBRL(ganhoResultado * 12)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SimuladorPage() {
  return (
    <AppShell>
      <SimuladorContent />
    </AppShell>
  );
}
