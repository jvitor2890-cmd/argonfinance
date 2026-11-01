'use client';

import { useState, useMemo } from 'react';
import {
  Plus, Search, Pencil, Trash2, TrendingUp, TrendingDown, ArrowUpDown,
} from 'lucide-react';
import clsx from 'clsx';
import { LANCAMENTOS } from '@/lib/demo-data';
import { LancamentoModal } from '@/components/lancamentos/LancamentoModal';
import { formatBRL, formatDate } from '@/lib/formatters';
import type { Lancamento } from '@/types';

const MESES = [
  '', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

const CATEGORIAS_ALL = [
  'Consultoria', 'Desenvolvimento', 'Suporte', 'Treinamento',
  'Pessoal', 'Infraestrutura', 'Tecnologia', 'Impostos',
  'Marketing', 'Contabilidade', 'Viagens', 'Outro',
];

type SortKey = 'data' | 'descricao' | 'categoria' | 'valor';

export default function LancamentosPage() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>(LANCAMENTOS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lancamento | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filters
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [mesFiltro, setMesFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>('data');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    let list = lancamentos;
    if (tipoFiltro !== 'todos') list = list.filter(l => l.tipo === tipoFiltro);
    if (mesFiltro) list = list.filter(l => l.data.slice(5, 7) === mesFiltro);
    if (categoriaFiltro) list = list.filter(l => l.categoria === categoriaFiltro);
    if (busca.trim()) {
      const q = busca.toLowerCase();
      list = list.filter(l =>
        l.descricao.toLowerCase().includes(q) ||
        l.categoria.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      let diff = 0;
      if (sortKey === 'valor') diff = a.valor - b.valor;
      else if (sortKey === 'data') diff = a.data.localeCompare(b.data);
      else diff = a[sortKey].localeCompare(b[sortKey]);
      return sortAsc ? diff : -diff;
    });
  }, [lancamentos, tipoFiltro, mesFiltro, categoriaFiltro, busca, sortKey, sortAsc]);

  const totais = useMemo(() => ({
    receitas: filtered.filter(l => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0),
    despesas: filtered.filter(l => l.tipo === 'despesa').reduce((s, l) => s + l.valor, 0),
  }), [filtered]);

  function handleSave(data: Omit<Lancamento, 'id'>) {
    if (editing) {
      setLancamentos(prev => prev.map(l => l.id === editing.id ? { ...data, id: editing.id } : l));
    } else {
      const newId = `custom-${Date.now()}`;
      setLancamentos(prev => [...prev, { ...data, id: newId }]);
    }
    setModalOpen(false);
    setEditing(null);
  }

  function handleEdit(l: Lancamento) {
    setEditing(l);
    setModalOpen(true);
  }

  function handleDelete(id: string) {
    setLancamentos(prev => prev.filter(l => l.id !== id));
    setDeleteId(null);
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(p => !p);
    else { setSortKey(key); setSortAsc(false); }
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
          <h1 className="text-xl font-bold text-slate-800">Lançamentos</h1>
          <p className="mt-0.5 text-sm text-slate-500">Nexus Consultoria & Tecnologia · {new Date().getFullYear()}</p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="flex items-center gap-2 rounded-lg bg-argon-blue px-4 py-2 text-sm font-semibold text-white shadow hover:bg-argon-blue-light transition-colors"
        >
          <Plus className="h-4 w-4" /> Novo Lançamento
        </button>
      </div>

      {/* Summary cards */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total no filtro</p>
          <p className="mt-1 text-lg font-bold text-slate-800">{filtered.length} lançamentos</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-card border-l-4 border-argon-green">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-argon-green" />
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Receitas</p>
          </div>
          <p className="mt-1 text-lg font-bold text-argon-green">{formatBRL(totais.receitas)}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-card border-l-4 border-red-500">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Despesas</p>
          </div>
          <p className="mt-1 text-lg font-bold text-red-500">{formatBRL(totais.despesas)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar descrição ou categoria..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-argon-blue focus:outline-none focus:ring-1 focus:ring-argon-blue"
          />
        </div>

        {/* Tipo */}
        <div className="flex rounded-lg border border-slate-200 bg-white">
          {(['todos', 'receita', 'despesa'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTipoFiltro(t)}
              className={clsx(
                'px-3 py-2 text-xs font-medium capitalize transition-all first:rounded-l-lg last:rounded-r-lg',
                tipoFiltro === t
                  ? t === 'receita' ? 'bg-emerald-500 text-white'
                    : t === 'despesa' ? 'bg-red-500 text-white'
                      : 'bg-argon-blue text-white'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {t === 'todos' ? 'Todos' : t === 'receita' ? 'Receitas' : 'Despesas'}
            </button>
          ))}
        </div>

        {/* Mês */}
        <select
          value={mesFiltro}
          onChange={e => setMesFiltro(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-argon-blue focus:outline-none"
        >
          <option value="">Todos os meses</option>
          {Array.from({ length: 12 }, (_, i) => {
            const m = String(i + 1).padStart(2, '0');
            return <option key={m} value={m}>{MESES[i + 1]}</option>;
          })}
        </select>

        {/* Categoria */}
        <select
          value={categoriaFiltro}
          onChange={e => setCategoriaFiltro(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-argon-blue focus:outline-none"
        >
          <option value="">Todas categorias</option>
          {CATEGORIAS_ALL.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Data <SortBtn col="data" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Descrição <SortBtn col="descricao" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Categoria <SortBtn col="categoria" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Forma
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Valor <SortBtn col="valor" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                    Nenhum lançamento encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : filtered.map(l => (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(l.data)}</td>
                  <td className="px-4 py-3 text-slate-800 font-medium max-w-xs truncate">{l.descricao}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {l.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      l.tipo === 'receita'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    )}>
                      {l.tipo === 'receita' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {l.tipo === 'receita' ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{l.formaPagamento}</td>
                  <td className={clsx(
                    'px-4 py-3 text-right font-semibold tabular-nums whitespace-nowrap',
                    l.tipo === 'receita' ? 'text-emerald-600' : 'text-red-600'
                  )}>
                    {l.tipo === 'despesa' ? '–' : '+'}{formatBRL(l.valor)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(l)}
                        className="rounded p-1.5 text-slate-400 hover:bg-argon-blue-50 hover:text-argon-blue transition-colors"
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(l.id)}
                        className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 flex justify-between text-xs text-slate-500">
            <span>{filtered.length} registro(s) exibido(s)</span>
            <span>
              Resultado:{' '}
              <span className={clsx(
                'font-semibold',
                totais.receitas - totais.despesas >= 0 ? 'text-emerald-600' : 'text-red-600'
              )}>
                {formatBRL(totais.receitas - totais.despesas)}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Modal add/edit */}
      {modalOpen && (
        <LancamentoModal
          lancamento={editing}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditing(null); }}
        />
      )}

      {/* Confirm delete */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-800">Excluir lançamento?</h3>
            <p className="mt-1 text-sm text-slate-500">Esta ação não pode ser desfeita nesta sessão.</p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
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
