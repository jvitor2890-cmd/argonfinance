'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { ExtratoItem } from '@/lib/conciliacao/types';

const CATEGORIAS = [
  'Consultoria', 'Desenvolvimento', 'Suporte', 'Treinamento',
  'Pessoal', 'Infraestrutura', 'Tecnologia', 'Impostos',
  'Marketing', 'Contabilidade', 'Viagens', 'Outro',
];
const FORMAS = ['Pix', 'Boleto', 'Débito automático', 'TED', 'DOC', 'Cartão', 'Dinheiro', 'Outro'];

interface Props {
  item: ExtratoItem;
  empresaId: string;
  onClose: () => void;
  onCriado: () => void;
}

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

export default function ModalCriarLancamento({ item, empresaId, onClose, onCriado }: Props) {
  const [descricao, setDescricao] = useState(item.descricao);
  const [categoria, setCategoria] = useState(item.categoria_sugerida ?? '');
  const [forma, setForma]         = useState('Pix');
  const [loading, setLoading]     = useState(false);
  const [erro, setErro]           = useState('');

  const tipo  = item.valor >= 0 ? 'receita' : 'despesa';
  const valor = Math.abs(item.valor);

  async function handleCriar() {
    if (!descricao || !categoria) { setErro('Preencha descrição e categoria.'); return; }
    setLoading(true); setErro('');
    const res = await fetch('/api/conciliacao/criar-lancamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ extrato_item_id: item.id, empresa_id: empresaId, descricao, categoria, forma }),
    });
    setLoading(false);
    if (res.ok) onCriado();
    else { const e = await res.json(); setErro(e.error ?? 'Erro'); }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Criar Lançamento</h2>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-4">
          {/* Resumo do item do extrato */}
          <div className="rounded-lg bg-argon-surface p-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{new Date(item.data + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
              <span className={`font-bold tabular-nums ${item.valor >= 0 ? 'text-argon-green' : 'text-argon-red'}`}>
                {tipo === 'despesa' ? '−' : '+'}{fmt(valor)}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 truncate">{item.descricao}</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Descrição</label>
              <input
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-argon-blue focus:outline-none focus:ring-1 focus:ring-argon-blue"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Categoria
                {item.categoria_sugerida && categoria === item.categoria_sugerida && (
                  <span className="normal-case rounded-full bg-argon-blue-50 px-2 py-0.5 text-[10px] font-semibold text-argon-blue">
                    ✦ auto-detectado
                  </span>
                )}
              </label>
              <select
                value={categoria}
                onChange={e => setCategoria(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-1 ${
                  item.categoria_sugerida && categoria === item.categoria_sugerida
                    ? 'border-argon-blue bg-argon-blue-50 focus:border-argon-blue focus:ring-argon-blue'
                    : 'border-slate-200 focus:border-argon-blue focus:ring-argon-blue'
                }`}
              >
                <option value="">— selecione —</option>
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Forma de pagamento</label>
              <select
                value={forma}
                onChange={e => setForma(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-argon-blue focus:outline-none"
              >
                {FORMAS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {erro && <p className="mt-3 text-xs text-argon-red">{erro}</p>}
        </div>

        <div className="flex gap-3 px-6 pb-5">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleCriar}
            disabled={loading || !descricao || !categoria}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-argon-blue py-2 text-sm font-semibold text-white shadow hover:bg-argon-blue-light transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Criar e Conciliar
          </button>
        </div>
      </div>
    </div>
  );
}
