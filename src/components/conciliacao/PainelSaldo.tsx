'use client';

import type { ExtratoItem, Lancamento } from '@/lib/conciliacao/types';
import { calcularSaldo } from '@/lib/conciliacao/matching';

interface Props {
  itens: ExtratoItem[];
  lancamentos: Lancamento[];
  mes: string;
  onFecharMes: () => void;
}

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

export default function PainelSaldo({ itens, lancamentos, mes, onFecharMes }: Props) {
  const s = calcularSaldo(itens, lancamentos, mes);
  const zerado = Math.abs(s.diferenca) <= 0.01;

  return (
    <div className="rounded-xl bg-white shadow-card border border-slate-100 p-5 mb-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">Saldo Extrato</p>
          <p className={`text-lg font-bold tabular-nums ${s.saldoExtrato >= 0 ? 'text-argon-green' : 'text-argon-red'}`}>
            {fmt(s.saldoExtrato)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">Saldo Sistema</p>
          <p className={`text-lg font-bold tabular-nums ${s.saldoSistema >= 0 ? 'text-argon-green' : 'text-argon-red'}`}>
            {fmt(s.saldoSistema)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">Diferença</p>
          <p className={`text-lg font-bold tabular-nums ${zerado ? 'text-argon-green' : 'text-argon-red'}`}>
            {fmt(s.diferenca)}
          </p>
          {!zerado && (
            <p className="text-[10px] text-argon-red mt-0.5">Mês não pode ser fechado</p>
          )}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">Itens</p>
          <div className="flex flex-col gap-0.5 text-xs text-slate-600">
            <span><span className="inline-block w-2 h-2 rounded-full bg-argon-amber mr-1.5" />{s.itensPendentes} pendentes</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-argon-green mr-1.5" />{s.itensConciliados} conciliados</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-slate-300 mr-1.5" />{s.itensIgnorados} ignorados</span>
          </div>
        </div>
      </div>

      {/* Barra de progresso + botão fechar */}
      <div className="mt-4 flex items-center gap-4">
        <div className="flex-1">
          {s.totalItens > 0 && (
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-argon-green transition-all"
                style={{ width: `${(s.itensConciliados / s.totalItens) * 100}%` }}
              />
            </div>
          )}
          {!zerado && s.totalItens > 0 && (
            <p className="text-[10px] text-argon-red mt-1">
              ⚠ Diferença de {fmt(Math.abs(s.diferenca))}
            </p>
          )}
          {zerado && s.itensPendentes > 0 && (
            <p className="text-[10px] text-argon-amber mt-1">
              ⚠ Saldo zerado, mas há {s.itensPendentes} item(ns) pendente(s).
            </p>
          )}
        </div>
        <button
          onClick={onFecharMes}
          disabled={!zerado || s.itensPendentes > 0}
          className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            zerado && s.itensPendentes === 0
              ? 'bg-argon-green text-white hover:bg-argon-green-dark shadow'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          Fechar {mes.slice(5, 7)}/{mes.slice(0, 4)}
        </button>
      </div>
    </div>
  );
}
