'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Building2, X, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import clsx from 'clsx';
import { AppShell } from '@/components/layout/AppShell';
import { createClient } from '@/lib/supabase/client';
import { useEmpresa, type Empresa } from '@/contexts/EmpresaContext';

const SEGMENTOS = [
  'Consultoria', 'Tecnologia', 'Varejo', 'Serviços', 'Indústria',
  'Saúde', 'Educação', 'Construção', 'Contabilidade', 'Jurídico', 'Outro',
];

interface FormData {
  nome: string;
  cnpj: string;
  responsavel: string;
  segmento: string;
  email: string;
  telefone: string;
}

const emptyForm = (): FormData => ({
  nome: '', cnpj: '', responsavel: '', segmento: '', email: '', telefone: '',
});

function EmpresaModal({
  empresa,
  onSave,
  onClose,
}: {
  empresa?: Empresa | null;
  onSave: (data: FormData) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormData>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (empresa) {
      setForm({
        nome: empresa.nome,
        cnpj: empresa.cnpj ?? '',
        responsavel: empresa.responsavel ?? '',
        segmento: empresa.segmento ?? '',
        email: empresa.email ?? '',
        telefone: empresa.telefone ?? '',
      });
    } else {
      setForm(emptyForm());
    }
  }, [empresa]);

  function set<K extends keyof FormData>(key: K, val: string) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar empresa');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">
            {empresa ? 'Editar Empresa' : 'Nova Empresa'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">Nome da empresa *</label>
              <input
                type="text"
                value={form.nome}
                onChange={e => set('nome', e.target.value)}
                required
                placeholder="Ex.: Nexus Consultoria Ltda"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-argon-blue focus:outline-none focus:ring-1 focus:ring-argon-blue"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">CNPJ</label>
              <input
                type="text"
                value={form.cnpj}
                onChange={e => set('cnpj', e.target.value)}
                placeholder="00.000.000/0001-00"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-argon-blue focus:outline-none focus:ring-1 focus:ring-argon-blue"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Segmento</label>
              <select
                value={form.segmento}
                onChange={e => set('segmento', e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-argon-blue focus:outline-none"
              >
                <option value="">Selecione...</option>
                {SEGMENTOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Responsável</label>
              <input
                type="text"
                value={form.responsavel}
                onChange={e => set('responsavel', e.target.value)}
                placeholder="Nome do responsável"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-argon-blue focus:outline-none focus:ring-1 focus:ring-argon-blue"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Telefone</label>
              <input
                type="tel"
                value={form.telefone}
                onChange={e => set('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-argon-blue focus:outline-none focus:ring-1 focus:ring-argon-blue"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="contato@empresa.com.br"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-argon-blue focus:outline-none focus:ring-1 focus:ring-argon-blue"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

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
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-argon-blue py-2 text-sm font-semibold text-white hover:bg-argon-blue-light disabled:opacity-60"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {empresa ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmpresasContent() {
  const { empresas, empresaAtiva, setEmpresaAtiva, refresh } = useEmpresa();
  const [allEmpresas, setAllEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Empresa | null>(null);

  async function loadAll() {
    const supabase = createClient();
    const { data } = await supabase.from('empresas').select('*').order('nome');
    setAllEmpresas(data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  async function handleSave(form: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    if (editing) {
      const { error } = await supabase
        .from('empresas')
        .update({
          nome: form.nome,
          cnpj: form.cnpj || null,
          responsavel: form.responsavel || null,
          segmento: form.segmento || null,
          email: form.email || null,
          telefone: form.telefone || null,
        })
        .eq('id', editing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from('empresas').insert({
        operador_id: user.id,
        nome: form.nome,
        cnpj: form.cnpj || null,
        responsavel: form.responsavel || null,
        segmento: form.segmento || null,
        email: form.email || null,
        telefone: form.telefone || null,
        ativo: true,
      });
      if (error) throw new Error(error.message);
    }

    setModalOpen(false);
    setEditing(null);
    await loadAll();
    await refresh();
  }

  async function toggleAtivo(empresa: Empresa) {
    const supabase = createClient();
    await supabase.from('empresas').update({ ativo: !empresa.ativo }).eq('id', empresa.id);
    if (empresa.ativo && empresaAtiva?.id === empresa.id) {
      setEmpresaAtiva(null);
    }
    await loadAll();
    await refresh();
  }

  const ativas = allEmpresas.filter(e => e.ativo);
  const inativas = allEmpresas.filter(e => !e.ativo);

  return (
    <div className="min-h-screen bg-argon-surface p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Empresas Clientes</h1>
          <p className="mt-0.5 text-sm text-slate-500">Gerencie as empresas atendidas neste BPO</p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="flex items-center gap-2 rounded-lg bg-argon-blue px-4 py-2 text-sm font-semibold text-white shadow hover:bg-argon-blue-light transition-colors"
        >
          <Plus className="h-4 w-4" /> Nova Empresa
        </button>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total cadastradas</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{allEmpresas.length}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-card border-l-4 border-emerald-500">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Ativas</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{ativas.length}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-card border-l-4 border-slate-300">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Inativas</p>
          <p className="mt-1 text-2xl font-bold text-slate-500">{inativas.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-argon-blue" />
        </div>
      ) : allEmpresas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
          <Building2 className="h-12 w-12 text-slate-300 mb-3" />
          <p className="text-base font-semibold text-slate-600">Nenhuma empresa cadastrada</p>
          <p className="mt-1 text-sm text-slate-400 mb-5">Comece cadastrando a primeira empresa cliente</p>
          <button
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="flex items-center gap-2 rounded-lg bg-argon-blue px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" /> Cadastrar empresa
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {ativas.length > 0 && (
            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Ativas</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ativas.map(emp => (
                  <EmpresaCard
                    key={emp.id}
                    empresa={emp}
                    isAtiva={empresaAtiva?.id === emp.id}
                    onEdit={() => { setEditing(emp); setModalOpen(true); }}
                    onToggle={() => toggleAtivo(emp)}
                    onSelect={() => setEmpresaAtiva(emp)}
                  />
                ))}
              </div>
            </div>
          )}

          {inativas.length > 0 && (
            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Inativas</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 opacity-60">
                {inativas.map(emp => (
                  <EmpresaCard
                    key={emp.id}
                    empresa={emp}
                    isAtiva={false}
                    onEdit={() => { setEditing(emp); setModalOpen(true); }}
                    onToggle={() => toggleAtivo(emp)}
                    onSelect={() => {}}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <EmpresaModal
          empresa={editing}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function EmpresaCard({
  empresa, isAtiva, onEdit, onToggle, onSelect,
}: {
  empresa: Empresa; isAtiva: boolean;
  onEdit: () => void; onToggle: () => void; onSelect: () => void;
}) {
  const initials = empresa.nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  return (
    <div className={clsx(
      'rounded-xl bg-white p-5 shadow-card transition-all border-2',
      isAtiva ? 'border-argon-blue' : 'border-transparent hover:border-slate-200'
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-argon-blue/10 text-sm font-bold text-argon-blue">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-slate-800 leading-tight">{empresa.nome}</p>
            {empresa.segmento && (
              <span className="text-xs text-slate-500">{empresa.segmento}</span>
            )}
          </div>
        </div>
        {isAtiva && (
          <span className="rounded-full bg-argon-blue/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-argon-blue">
            Selecionada
          </span>
        )}
      </div>

      {empresa.cnpj && (
        <p className="text-xs text-slate-400 mb-0.5">CNPJ: {empresa.cnpj}</p>
      )}
      {empresa.responsavel && (
        <p className="text-xs text-slate-400 mb-0.5">Resp.: {empresa.responsavel}</p>
      )}
      {empresa.email && (
        <p className="text-xs text-slate-400 mb-0.5">{empresa.email}</p>
      )}

      <div className="mt-4 flex items-center gap-2">
        {empresa.ativo && !isAtiva && (
          <button
            onClick={onSelect}
            className="flex-1 rounded-lg bg-argon-blue/10 py-1.5 text-xs font-semibold text-argon-blue hover:bg-argon-blue/20 transition-colors"
          >
            Selecionar
          </button>
        )}
        <button
          onClick={onEdit}
          className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Pencil className="h-3 w-3" /> Editar
        </button>
        <button
          onClick={onToggle}
          title={empresa.ativo ? 'Desativar' : 'Reativar'}
          className={clsx(
            'flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
            empresa.ativo
              ? 'border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
              : 'border border-emerald-200 text-emerald-600 hover:bg-emerald-50'
          )}
        >
          {empresa.ativo ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
          {empresa.ativo ? 'Ativa' : 'Reativar'}
        </button>
      </div>
    </div>
  );
}

export default function EmpresasPage() {
  return (
    <AppShell>
      <EmpresasContent />
    </AppShell>
  );
}
