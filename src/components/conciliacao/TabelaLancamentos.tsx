'use client';

import { Loader2 } from 'lucide-react';
import type { ExtratoItem, Lancamento } from '@/lib/conciliacao/types';

interface Props {
  lancamentos: Lancamento[];
  extratoItens: ExtratoItem[];
  itemSelecionado: ExtratoItem | null;
  onCasar: (extratoItemId: string, lancamentoId: string) => void;
  loading: boolean;
}

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function fmtDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export default function TabelaLancamentos({
  lancamentos, extratoItens, itemSelecionado, onCasar, loading,
}: Props) {
  const conciliadosIds = new Set(
    extratoItens.filter(i => i.status === 'conciliado').map(i => i.lancamento_id).filter(Boolean),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 rounded-xl bg-white shadow-card">
        <Loader2 className="h-5 w-5 animate-spin text-argon-blue" />
      </div>
    );
  }

  if (lancamentos.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 rounded-xl border-2 border-dashed border-slate-200 bg-white">
        <p className="text-sm text-slate-400">Nenhum lançamento neste mês</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white shadow-card overflow-hidden">
      <div className="max-h-[560px] overflow-y-auto divide-y divide-slate-100">
        {lancamentos.map(lanc => {
          const jaConciliado = conciliadosIds.has(lanc.id);
          const podeCarsar   = itemSelecionado && !jaConciliado && itemSelecionado.status === 'pendente';
          const mesmaNatureza = itemSelecionado &&
            (lanc.tipo === 'receita') === (itemSelecionado.valor >= 0);

          return (
            <div
              key={lanc.id}
              className={`p-3 transition-colors ${
                jaConciliado ? 'opacity-50 bg-argon-green-50' :
                podeCarsar && mesmaNatureza ? 'bg-argon-blue-50 ring-1 ring-inset ring-argon-blue/20' :
                'hover:bg-argon-surface'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <span className="text-xs text-slate-400">{fmtDate(lanc.data)}</span>
                    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                      lanc.tipo === 'receita'
                        ? 'bg-argon-green-50 text-argon-green'
                        : 'bg-argon-red-50 text-argon-red'
                    }`}>
                      {lanc.tipo === 'receita' ? 'Receita' : 'Despesa'}
                    </span>
                    <span className="text-[10px] text-slate-400">{lanc.categoria}</span>
                    {jaConciliado && <span className="text-[10px] text-argon-green font-medium">✓ conciliado</span>}
                  </div>
                  <p className="text-sm font-medium text-slate-800 truncate">{lanc.descricao}</p>
                  <p className="text-xs text-slate-400">{lanc.forma_pagamento}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`text-sm font-bold tabular-nums ${lanc.tipo === 'receita' ? 'text-argon-green' : 'text-argon-red'}`}>
                    {lanc.tipo === 'despesa' ? '−' : '+'}{fmt(lanc.valor)}
                  </p>
                  {podeCarsar && !jaConciliado && (
                    <button
                      onClick={() => onCasar(itemSelecionado!.id, lanc.id)}
                      className="mt-1 rounded bg-argon-blue px-2.5 py-0.5 text-[11px] font-semibold text-white hover:bg-argon-blue-light transition-colors"
                    >
                      Casar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
