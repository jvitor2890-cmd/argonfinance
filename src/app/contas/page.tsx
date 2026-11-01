'use client';

import { useState, useMemo } from 'react';
import {
  Plus, Pencil, Trash2, CheckCircle, AlertTriangle, Clock, ArrowUpDown,
} from 'lucide-react';
import clsx from 'clsx';
import { COMPROMISSOS } from '@/lib/demo-data';
import { CompromissoModal } from '@/components/contas/CompromissoModal';
import { formatBRL, formatDate } from '@/lib/formatters';
import type { Compromisso, StatusCompromisso, TipoCompromisso } from '@/types';

const STATUS_CONFIG: Record<StatusCompromisso, { label: string; color: string; icon: React.ElementType }> = {
  pendente:  { label: 'Pendente',  color: 'bg-amber-100 text-amber-700',  icon: Clock },
  pago:      { label: 'Pago',      color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  recebido:  { label: 'Recebido',  color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  atrasado:  { label: 'Atrasado',  color: 'bg-red-100 text-red-700',      icon: AlertTriangle },
};

type SortKey = 'vencimento' | 'descricao' | 'valor';

export default function ContasPage() {
  const [compromissos, setCompromissos] = useState<Compromisso[]>(COMPROMISSOS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Compromisso | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filters
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | TipoCompromisso>('todos');
  const [statusFiltro, setStatusFiltro] = useState<'todos' | StatusCompromisso>('todos');

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>('vencimento');
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    let list = compromissos;
    if (tipoFiltro !== 'todos') list = list.filter(c => c.tipo === tipoFiltro);
    if (statusFiltro !== 'todos') list = list.filter(c => c.status === statusFiltro);
    return [...list].sort((a, b) => {
      let diff = 0;
      if (sortKey === 'valor') diff = a.valor - b.valor;
      else diff = a[sortKey].localeCompare(b[sortKey]);
      return sortAsc ? diff : -diff;
    });
  }, [compromissos, tipoFiltro, statusFiltro, sortKey, sortAsc]);

  const totais = useMemo(() => {
    const atrasados = compromissos.filter(c => c.status === 'atrasado');
    return {
      aPagar: compromissos.filter(c => c.tipo === 'pagar' && c.status !== 'pago').reduce((s, c) => s + c.valor, 0),
      aReceber: compromissos.filter(c => c.tipo === 'receber' && c.status !== 'recebido').reduce((s, c) => s + c.valor, 0),
      atrasados: atrasados.length,
      valorAtrasado: atrasados.reduce((s, c) => s + c.valor, 0),
    };
  }, [compromissos]);

  function handleSave(data: Omit<Compromisso, 'id'>) {
    if (editing) {
      setCompromissos(prev => prev.map(c => c.id === editing.id ? { ...data, id: editing.id } : c));
    } else {
      setCompromissos(prev => [...prev, { ...data, id: `custom-${Date.now()}` }]);
    }
    setModalOpen(false);
    setEditing(null);
  }

  function handleStatusChange(id: string, status: StatusCompromisso) {
    setCompromissos(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(p => !p);
    else { setSortKey(key); setSortAsc(true); }
  }

  function SortBtn({ col }: { col: SortKey }) {
    return (
      <button onClick={() => toggleSort(col)} className="ml-1 inline-flex opacity-50 hover:opacity-100">
        <ArrowUpDown className="h-3 w-3" />
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-argon-surface p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Contas a Pagar e Receber</h1>
          <p className="mt-0.5 text-sm text-slate-500">Nexus Consultoria & Tecnologia · compromissos futuros</p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="flex items-center gap-2 rounded-lg bg-argon-blue px-4 py-2 text-sm font-semibold text-white shadow hover:bg-argon-blue-light transition-colors"
        >
          <Plus className="h-4 w-4" /> Novo Compromisso
        </button>
      </div>

      {/* KPI Cards */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-4 shadow-card border-l-4 border-emerald-500">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">A Receber</p>
          <p className="mt-1 text-lg font-bold text-emerald-600">{formatBRL(totais.aReceber)}</p>
          <p className="text-xs text-slate-400 mt-0.5">pendente + atrasado</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-card border-l-4 border-red-500">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">A Pagar</p>
          <p className="mt-1 text-lg font-bold text-red-600">{formatBRL(totais.aPagar)}</p>
          <p className="text-xs text-slate-400 mt-0.5">pendente + atrasado</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-card border-l-4 border-argon-blue">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Saldo Projetado</p>
          <p className={clsx(
            'mt-1 text-lg font-bold',
            totais.aReceber - totais.aPagar >= 0 ? 'text-emerald-600' : 'text-red-600'
          )}>
            {formatBRL(totais.aReceber - totais.aPagar)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">receber − pagar</p>
        </div>
        <div className={clsx(
          'rounded-xl p-4 shadow-card border-l-4',
          totais.atrasados > 0 ? 'bg-red-50 border-red-500' : 'bg-white border-slate-200'
        )}>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Atrasados</p>
          <p className={clsx('mt-1 text-lg font-bold', totais.atrasados > 0 ? 'text-red-600' : 'text-slate-800')}>
            {totais.atrasados} item{totais.atrasados !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{totais.atrasados > 0 ? formatBRL(totais.valorAtrasado) : 'Nenhum atraso'}</p>
        </div>
      </div>

      {/* Alert de atrasados */}
      {totais.atrasados > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">
            <span className="font-semibold">{totais.atrasados} compromisso{totais.atrasados > 1 ? 's' : ''} em atraso</span>
            {' '}— total de {formatBRL(totais.valorAtrasado)}. Regularize o quanto antes.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="flex rounded-lg border border-slate-200 bg-white">
          {(['todos', 'receber', 'pagar'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTipoFiltro(t)}
              className={clsx(
                'px-3 py-2 text-xs font-medium transition-all first:rounded-l-lg last:rounded-r-lg',
                tipoFiltro === t
                  ? t === 'receber' ? 'bg-emerald-500 text-white'
                    : t === 'pagar' ? 'bg-red-500 text-white'
                      : 'bg-argon-blue text-white'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {t === 'todos' ? 'Todos' : t === 'receber' ? 'A Receber' : 'A Pagar'}
            </button>
          ))}
        </div>

        <div className="flex rounded-lg border border-slate-200 bg-white">
          {(['todos', 'pendente', 'atrasado', 'pago', 'recebido'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFiltro(s)}
              className={clsx(
                'px-3 py-2 text-xs font-medium capitalize transition-all first:rounded-l-lg last:rounded-r-lg',
                statusFiltro === s
                  ? s === 'atrasado' ? 'bg-red-500 text-white'
                    : s === 'pendente' ? 'bg-amber-500 text-white'
                      : s === 'todos' ? 'bg-argon-blue text-white'
                        : 'bg-emerald-500 text-white'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {s === 'todos' ? 'Todos' : STATUS_CONFIG[s as StatusCompromisso]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Vencimento <SortBtn col="vencimento" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Descrição <SortBtn col="descricao" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Categoria</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Valor <SortBtn col="valor" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                    Nenhum compromisso encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : filtered.map(c => {
                const statusCfg = STATUS_CONFIG[c.status];
                const StatusIcon = statusCfg.icon;
                const isAtrasado = c.status === 'atrasado';
                const isPago = c.status === 'pago' || c.status === 'recebido';

                return (
                  <tr key={c.id} className={clsx(
                    'transition-colors',
                    isAtrasado ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-slate-50'
                  )}>
                    <td className={clsx('px-4 py-3 whitespace-nowrap font-medium', isAtrasado ? 'text-red-600' : 'text-slate-700')}>
                      {formatDate(c.vencimento)}
                      {isAtrasado && <span className="ml-2 text-xs font-semibold text-red-500">VENCIDO</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-800 max-w-xs truncate">{c.descricao}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        {c.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        c.tipo === 'receber' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      )}>
                        {c.tipo === 'receber' ? 'A Receber' : 'A Pagar'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {/* Status dropdown inline */}
                      <div className="relative group inline-block">
                        <button className={clsx(
                          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all',
                          statusCfg.color,
                          !isPago && 'hover:ring-2 hover:ring-slate-300 cursor-pointer'
                        )}>
                          <StatusIcon className="h-3 w-3" />
                          {statusCfg.label}
                        </button>
                        {!isPago && (
                          <div className="absolute left-0 top-6 z-10 hidden w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-lg group-hover:block">
                            {(c.tipo === 'pagar'
                              ? [['pago', 'Marcar como Pago'], ['pendente', 'Pendente'], ['atrasado', 'Atrasado']]
                              : [['recebido', 'Marcar como Recebido'], ['pendente', 'Pendente'], ['atrasado', 'Atrasado']]
                            ).map(([s, label]) => (
                              <button
                                key={s}
                                onClick={() => handleStatusChange(c.id, s as StatusCompromisso)}
                                className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50"
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={clsx(
                      'px-4 py-3 text-right font-semibold tabular-nums whitespace-nowrap',
                      c.tipo === 'receber' ? 'text-emerald-600' : 'text-red-600'
                    )}>
                      {formatBRL(c.valor)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditing(c); setModalOpen(true); }}
                          className="rounded p-1.5 text-slate-400 hover:bg-argon-blue-50 hover:text-argon-blue transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(c.id)}
                          className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 flex justify-between text-xs text-slate-500">
            <span>{filtered.length} registro(s) exibido(s)</span>
            <span>
              A Receber:{' '}
              <span className="font-semibold text-emerald-600">
                {formatBRL(filtered.filter(c => c.tipo === 'receber').reduce((s, c) => s + c.valor, 0))}
              </span>
              {' · '}
              A Pagar:{' '}
              <span className="font-semibold text-red-600">
                {formatBRL(filtered.filter(c => c.tipo === 'pagar').reduce((s, c) => s + c.valor, 0))}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <CompromissoModal
          compromisso={editing}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditing(null); }}
        />
      )}

      {/* Confirm delete */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-800">Excluir compromisso?</h3>
            <p className="mt-1 text-sm text-slate-500">Esta ação não pode ser desfeita nesta sessão.</p>
            <div className="mt-4 flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Cancelar
              </button>
              <button
                onClick={() => { setCompromissos(prev => prev.filter(c => c.id !== deleteId)); setDeleteId(null); }}
                className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
