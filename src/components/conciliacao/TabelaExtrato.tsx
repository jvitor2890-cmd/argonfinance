'use client';

import { Loader2, Tag } from 'lucide-react';
import type { ExtratoItem } from '@/lib/conciliacao/types';

interface Props {
  itens: ExtratoItem[];
  loading: boolean;
  onVerSugestoes: (item: ExtratoItem) => void;
  onIgnorar: (id: string) => void;
  onDesconciliar: (id: string) => void;
  onCriarLancamento: (item: ExtratoItem) => void;
}

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function fmtDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export default function TabelaExtrato({
  itens, loading, onVerSugestoes, onIgnorar, onDesconciliar, onCriarLancamento,
}: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 rounded-xl bg-white shadow-card">
        <Loader2 className="h-5 w-5 animate-spin text-argon-blue" />
      </div>
    );
  }

  if (itens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-slate-200 bg-white text-center p-6">
        <p className="text-sm font-medium text-slate-500">Nenhum item importado</p>
        <p className="text-xs text-slate-400 mt-1">Importe um extrato OFX ou CSV para começar.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white shadow-card overflow-hidden">
      <div className="max-h-[560px] overflow-y-auto divide-y divide-slate-100">
        {itens.map(item => (
          <div
            key={item.id}
            className={`p-3 transition-colors hover:bg-argon-surface ${
              item.status === 'conciliado' ? 'opacity-60' : ''
            } ${item.status === 'ignorado' ? 'opacity-40' : ''}`}
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <span className="text-xs text-slate-400">{fmtDate(item.data)}</span>
                  <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    item.status === 'pendente'   ? 'bg-argon-amber-50 text-argon-amber' :
                    item.status === 'conciliado' ? 'bg-argon-green-50 text-argon-green' :
                                                   'bg-slate-100 text-slate-500'
                  }`}>
                    {item.status}
                  </span>
                  {item.categoria_sugerida && item.status === 'pendente' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-argon-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-argon-blue">
                      <Tag className="h-2.5 w-2.5" />
                      {item.categoria_sugerida}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-800 truncate">{item.descricao}</p>
                {item.memo && item.memo !== item.descricao && (
                  <p className="text-xs text-slate-400 truncate">{item.memo}</p>
                )}
              </div>
              <span className={`shrink-0 text-sm font-bold tabular-nums ${item.valor >= 0 ? 'text-argon-green' : 'text-argon-red'}`}>
                {fmt(item.valor)}
              </span>
            </div>

            {item.status === 'pendente' && (
              <div className="flex items-center gap-1.5 mt-2">
                <button
                  onClick={() => onVerSugestoes(item)}
                  className="rounded-md bg-argon-blue-50 px-2.5 py-1 text-xs font-medium text-argon-blue hover:bg-argon-blue hover:text-white transition-colors"
                >
                  Ver sugestões
                </button>
                <button
                  onClick={() => onCriarLancamento(item)}
                  className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Criar lançamento
                </button>
                <button
                  onClick={() => onIgnorar(item.id)}
                  className="ml-auto text-xs text-slate-400 hover:text-slate-600 px-1"
                >
                  Ignorar
                </button>
              </div>
            )}

            {item.status === 'conciliado' && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-argon-green font-medium">✓ Conciliado</span>
                <button onClick={() => onDesconciliar(item.id)} className="text-xs text-slate-400 hover:text-slate-600 ml-auto">
                  Desfazer
                </button>
              </div>
            )}

            {item.status === 'ignorado' && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-400">Ignorado</span>
                <button onClick={() => onDesconciliar(item.id)} className="text-xs text-argon-blue hover:underline ml-auto text-xs">
                  Restaurar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
