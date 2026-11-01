'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';
import type { Lancamento, TipoLancamento } from '@/types';

const CATEGORIAS_RECEITA = ['Consultoria', 'Desenvolvimento', 'Suporte', 'Treinamento', 'Outro'];
const CATEGORIAS_DESPESA = [
  'Pessoal', 'Infraestrutura', 'Tecnologia', 'Impostos',
  'Marketing', 'Contabilidade', 'Viagens', 'Outro',
];
const FORMAS_PAGAMENTO = [
  'Transferência', 'Boleto', 'Cartão de crédito', 'Débito automático', 'DARF', 'Pix', 'Outro',
];

interface Props {
  lancamento?: Lancamento | null;
  onSave: (data: Omit<Lancamento, 'id'>) => void;
  onClose: () => void;
}

const empty = (): Omit<Lancamento, 'id'> => ({
  data: new Date().toISOString().slice(0, 10),
  descricao: '',
  categoria: '',
  tipo: 'receita',
  valor: 0,
  formaPagamento: 'Transferência',
});

export function LancamentoModal({ lancamento, onSave, onClose }: Props) {
  const [form, setForm] = useState<Omit<Lancamento, 'id'>>(empty());

  useEffect(() => {
    if (lancamento) {
      const { id: _id, ...rest } = lancamento;
      setForm(rest);
    } else {
      setForm(empty());
    }
  }, [lancamento]);

  const categorias = form.tipo === 'receita' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm(prev => {
      const next = { ...prev, [key]: val };
      if (key === 'tipo') next.categoria = '';
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.descricao.trim() || !form.categoria || form.valor <= 0) return;
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">
            {lancamento ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {/* Tipo */}
          <div className="flex rounded-lg border border-slate-200 p-1 gap-1">
            {(['receita', 'despesa'] as TipoLancamento[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => set('tipo', t)}
                className={clsx(
                  'flex-1 rounded-md py-1.5 text-sm font-medium capitalize transition-all',
                  form.tipo === t
                    ? t === 'receita'
                      ? 'bg-emerald-500 text-white shadow'
                      : 'bg-red-500 text-white shadow'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {t === 'receita' ? 'Receita' : 'Despesa'}
              </button>
            ))}
          </div>

          {/* Data */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Data</label>
            <input
              type="date"
              value={form.data}
              onChange={e => set('data', e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-argon-blue focus:outline-none focus:ring-1 focus:ring-argon-blue"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Descrição</label>
            <input
              type="text"
              value={form.descricao}
              onChange={e => set('descricao', e.target.value)}
              placeholder="Ex.: Consultoria TI – Cliente X"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-argon-blue focus:outline-none focus:ring-1 focus:ring-argon-blue"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Categoria</label>
            <select
              value={form.categoria}
              onChange={e => set('categoria', e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-argon-blue focus:outline-none focus:ring-1 focus:ring-argon-blue"
            >
              <option value="">Selecione...</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Valor */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Valor (R$)</label>
            <input
              type="number"
              min={0.01}
              step={0.01}
              value={form.valor || ''}
              onChange={e => set('valor', parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-argon-blue focus:outline-none focus:ring-1 focus:ring-argon-blue"
            />
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Forma de Pagamento</label>
            <select
              value={form.formaPagamento}
              onChange={e => set('formaPagamento', e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-argon-blue focus:outline-none focus:ring-1 focus:ring-argon-blue"
            >
              {FORMAS_PAGAMENTO.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={clsx(
                'flex-1 rounded-lg py-2 text-sm font-semibold text-white shadow transition-opacity hover:opacity-90',
                form.tipo === 'receita' ? 'bg-emerald-500' : 'bg-red-500'
              )}
            >
              {lancamento ? 'Salvar alterações' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
