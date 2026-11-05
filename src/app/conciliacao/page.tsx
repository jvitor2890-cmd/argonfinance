'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useEmpresa } from '@/contexts/EmpresaContext';
import PainelSaldo from '@/components/conciliacao/PainelSaldo';
import TabelaExtrato from '@/components/conciliacao/TabelaExtrato';
import TabelaLancamentos from '@/components/conciliacao/TabelaLancamentos';
import ModalImportar from '@/components/conciliacao/ModalImportar';
import ModalCriarLancamento from '@/components/conciliacao/ModalCriarLancamento';
import ModalSugestoes from '@/components/conciliacao/ModalSugestoes';
import RegrasCategoria from '@/components/conciliacao/RegrasCategoria';
import type { ExtratoItem, Lancamento, ExtratoConta, MatchSugestao } from '@/lib/conciliacao/types';

function ConciliacaoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { empresaAtiva } = useEmpresa();

  const empresaId = empresaAtiva?.id ?? '';
  const contaId   = searchParams.get('conta_id') ?? '';
  const mes       = searchParams.get('mes') ?? new Date().toISOString().slice(0, 7);

  const [contas, setContas]               = useState<ExtratoConta[]>([]);
  const [extratoItens, setExtratoItens]   = useState<ExtratoItem[]>([]);
  const [lancamentos, setLancamentos]     = useState<Lancamento[]>([]);
  const [loading, setLoading]             = useState(false);

  const [modalImportar, setModalImportar]       = useState(false);
  const [modalRegras, setModalRegras]           = useState(false);
  const [itemSelecionado, setItemSelecionado]   = useState<ExtratoItem | null>(null);
  const [modalCriar, setModalCriar]             = useState(false);
  const [sugestoes, setSugestoes]               = useState<MatchSugestao[] | null>(null);
  const [loadingSugestoes, setLoadingSugestoes] = useState(false);

  const fetchDados = useCallback(async () => {
    if (!empresaId || !contaId) return;
    setLoading(true);
    try {
      const [resExtrato, resLanc] = await Promise.all([
        fetch(`/api/conciliacao/extrato?empresa_id=${empresaId}&conta_id=${contaId}&mes=${mes}`),
        fetch(`/api/conciliacao/lancamentos?empresa_id=${empresaId}&mes=${mes}`),
      ]);
      if (resExtrato.ok) { const d = await resExtrato.json(); setExtratoItens(Array.isArray(d) ? d : []); }
      if (resLanc.ok)   { const d = await resLanc.json();    setLancamentos(Array.isArray(d) ? d : []); }
    } finally {
      setLoading(false);
    }
  }, [empresaId, contaId, mes]);

  useEffect(() => { fetchDados(); }, [fetchDados]);

  useEffect(() => {
    if (!empresaId) return;
    fetch(`/api/conciliacao/contas?empresa_id=${empresaId}`)
      .then(r => r.ok ? r.json() : [])
      .then(d => setContas(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [empresaId]);

  async function handleCasar(extratoItemId: string, lancamentoId: string) {
    await fetch('/api/conciliacao/casar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ extrato_item_id: extratoItemId, lancamento_id: lancamentoId, empresa_id: empresaId }),
    });
    fetchDados();
    setSugestoes(null);
    setItemSelecionado(null);
  }

  async function handleIgnorar(extratoItemId: string) {
    await fetch('/api/conciliacao/ignorar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ extrato_item_id: extratoItemId, empresa_id: empresaId }),
    });
    fetchDados();
  }

  async function handleDesconciliar(extratoItemId: string) {
    await fetch('/api/conciliacao/casar', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ extrato_item_id: extratoItemId, empresa_id: empresaId }),
    });
    fetchDados();
  }

  async function handleVerSugestoes(item: ExtratoItem) {
    setItemSelecionado(item);
    setLoadingSugestoes(true);
    setSugestoes(null);
    const res = await fetch(
      `/api/conciliacao/sugestoes?extrato_item_id=${item.id}&empresa_id=${empresaId}`,
    );
    if (res.ok) {
      const data = await res.json();
      setSugestoes(data.sugestoes);
    }
    setLoadingSugestoes(false);
  }

  async function handleFecharMes() {
    const saldoExtrato = extratoItens.reduce((a, i) => a + i.valor, 0);
    const saldoSistema = lancamentos.reduce(
      (a, l) => a + (l.tipo === 'receita' ? l.valor : -l.valor),
      0,
    );
    if (Math.abs(saldoExtrato - saldoSistema) > 0.01) {
      alert(`Não é possível fechar: diferença de R$ ${Math.abs(saldoExtrato - saldoSistema).toFixed(2)}`);
      return;
    }
    if (!confirm(`Fechar ${mes}? Esta ação é registrada no audit trail.`)) return;
    const res = await fetch('/api/conciliacao/fechar-mes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ empresa_id: empresaId, conta_id: contaId, mes, saldo_extrato: saldoExtrato, saldo_sistema: saldoSistema }),
    });
    if (res.ok) alert('Mês fechado com sucesso!');
    else { const e = await res.json(); alert(e.error); }
  }

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

  const contaSelecionada = contas.find(c => c.id === contaId);

  return (
    <div className="min-h-screen bg-argon-surface">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Conciliação Bancária</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {empresaAtiva.nome}
            {contaSelecionada && ` · ${contaSelecionada.banco} — ${contaSelecionada.nome}`}
            {mes && ` · ${mes.slice(5, 7)}/${mes.slice(0, 4)}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalRegras(true)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Regras de Categoria
          </button>
          <button
            onClick={() => setModalImportar(true)}
            className="flex items-center gap-2 rounded-lg bg-argon-blue px-4 py-2 text-sm font-semibold text-white shadow hover:bg-argon-blue-light transition-colors"
          >
            + Importar Extrato
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b border-slate-100 px-6 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Conta:</label>
          <select
            value={contaId}
            onChange={e => {
              const p = new URLSearchParams({ conta_id: e.target.value, mes });
              router.push(`/conciliacao?${p}`);
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-argon-blue focus:outline-none"
          >
            <option value="">— selecione —</option>
            {contas.map(c => <option key={c.id} value={c.id}>{c.banco} · {c.nome}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Mês:</label>
          <input
            type="month"
            value={mes}
            onChange={e => {
              const p = new URLSearchParams({ conta_id: contaId, mes: e.target.value });
              router.push(`/conciliacao?${p}`);
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-argon-blue focus:outline-none"
          />
        </div>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-argon-blue ml-2" />}
      </div>

      {/* Painel de saldo */}
      <div className="px-6 pt-5">
        <PainelSaldo
          itens={extratoItens}
          lancamentos={lancamentos}
          mes={mes}
          onFecharMes={handleFecharMes}
        />
      </div>

      {/* Duas colunas */}
      <div className="px-6 pt-5 pb-10 grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Extrato */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              Extrato Bancário
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                {extratoItens.filter(i => i.status === 'pendente').length} pendentes
              </span>
            </h2>
          </div>
          <TabelaExtrato
            itens={extratoItens}
            loading={loading}
            onVerSugestoes={handleVerSugestoes}
            onIgnorar={handleIgnorar}
            onDesconciliar={handleDesconciliar}
            onCriarLancamento={item => { setItemSelecionado(item); setModalCriar(true); }}
          />
        </div>

        {/* Lançamentos */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              Lançamentos do Sistema
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {lancamentos.length} lançamentos
              </span>
            </h2>
          </div>
          <TabelaLancamentos
            lancamentos={lancamentos}
            extratoItens={extratoItens}
            itemSelecionado={itemSelecionado}
            onCasar={handleCasar}
            loading={loading}
          />
        </div>
      </div>

      {/* Modais */}
      {modalImportar && (
        <ModalImportar
          empresaId={empresaId}
          contas={contas}
          onClose={() => setModalImportar(false)}
          onImportado={fetchDados}
        />
      )}

      {modalCriar && itemSelecionado && (
        <ModalCriarLancamento
          item={itemSelecionado}
          empresaId={empresaId}
          onClose={() => { setModalCriar(false); setItemSelecionado(null); }}
          onCriado={() => { setModalCriar(false); setItemSelecionado(null); fetchDados(); }}
        />
      )}

      {itemSelecionado && (sugestoes !== null || loadingSugestoes) && !modalCriar && (
        <ModalSugestoes
          item={itemSelecionado}
          sugestoes={sugestoes ?? []}
          loading={loadingSugestoes}
          onCasar={handleCasar}
          onClose={() => { setSugestoes(null); setItemSelecionado(null); }}
          onCriarLancamento={() => { setSugestoes(null); setModalCriar(true); }}
        />
      )}

      {modalRegras && (
        <RegrasCategoria
          empresaId={empresaId}
          onClose={() => setModalRegras(false)}
        />
      )}
    </div>
  );
}

export default function ConciliacaoPage() {
  return (
    <AppShell>
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-argon-blue" />
        </div>
      }>
        <ConciliacaoContent />
      </Suspense>
    </AppShell>
  );
}
