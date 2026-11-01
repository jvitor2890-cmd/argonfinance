'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';
import type { Compromisso, TipoCompromisso, StatusCompromisso } from '@/types';

const CATEGORIAS_RECEBER = ['Consultoria', 'Desenvolvimento', 'Suporte', 'Treinamento', 'Outro'];
const CATEGORIAS_PAGAR = [
  'Pessoal', 'Infraestrutura', 'Tecnologia', 'Impostos',
  'Marketing', 'Contabilidade', 'Viagens', 'Cartão de crédito', 'Outro',
];

interface Props {
  compromisso?: Compromisso | null;
  onSave: (data: Omit<Compromisso, 'id'>) => void;
  onClose: () => void;
}

const empty = (): Omit<Compromisso, 'id'> => ({
  descricao: '',
  vencimento: new Date().toISOString().slice(0, 10),
  valor: 0,
  tipo: 'receber',
  status: 'pendente',
  categoria: '',
});

export function CompromissoModal({ compromisso, onSave, onClose }: Props) {
  const [form, setForm] = useState<Omit<Compromisso, 'id'>>(empty());

  useEffect(() => {
    if (compromisso) {
      const { id: _id, ...rest } = compromisso;
      setForm(rest);
    } else {
      setForm(empty());
    }
  }, [compromisso]);

  const categorias = form.tipo === 'receber' ? CATEGORIAS_RECEBER : CATEGORIAS_PAGAR;

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

  const isPagar = form.tipo === 'pagar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">
            {compromisso ? 'Editar Compromisso' : 'Novo Compromisso'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {/* Tipo */}
          <div className="flex rounded-lg border border-slate-200 p-1 gap-1">
            {(['receber', 'pagar'] as TipoCompromisso[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => set('tipo', t)}
                className={clsx(
                  'flex-1 rounded-md py-1.5 text-sm font-medium transition-all',
                  form.tipo === t
                    ? t === 'receber'
                      ? 'bg-emerald-500 text-white shadow'
                      : 'bg-red-500 text-white shadow'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {t === 'receber' ? 'A Receber' : 'A Pagar'}
              </button>
            ))}
          </div>

          {/* Descrição */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Descrição</label>
            <input
              type="text"
              value={form.descricao}
              onChange={e => set('descricao', e.target.value)}
              placeholder="Ex.: Fatura cliente X"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-argon-blue focus:outline-none focus:ring-1 focus:ring-argon-blue"
            />
          </div>

          {/* Vencimento */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Vencimento</label>
            <input
              type="date"
              value={form.vencimento}
              onChange={e => set('vencimento', e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-argon-blue focus:outline-none focus:ring-1 focus:ring-argon-blue"
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

          {/* Status */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
            <select
              value={form.status}
              onChange={e => set('status', e.target.value as StatusCompromisso)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-argon-blue focus:outline-none focus:ring-1 focus:ring-argon-blue"
            >
              <option value="pendente">Pendente</option>
              <option value={isPagar ? 'pago' : 'recebido'}>{isPagar ? 'Pago' : 'Recebido'}</option>
              <option value="atrasado">Atrasado</option>
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
                isPagar ? 'bg-red-500' : 'bg-emerald-500'
              )}
            >
              {compromisso ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
