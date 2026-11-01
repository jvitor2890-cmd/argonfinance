'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Empresa {
  id: string;
  nome: string;
  cnpj: string | null;
  responsavel: string | null;
  segmento: string | null;
  email: string | null;
  telefone: string | null;
  ativo: boolean;
  operador_id: string;
}

interface EmpresaContextValue {
  empresas: Empresa[];
  empresaAtiva: Empresa | null;
  setEmpresaAtiva: (e: Empresa | null) => void;
  loading: boolean;
  refresh: () => Promise<void>;
}

const EmpresaContext = createContext<EmpresaContextValue | null>(null);

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaAtiva, _setEmpresaAtiva] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setEmpresas([]);
      _setEmpresaAtiva(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('empresas')
      .select('*')
      .eq('ativo', true)
      .order('nome');
    const lista: Empresa[] = data ?? [];
    setEmpresas(lista);

    let savedId: string | null = null;
    try { savedId = localStorage.getItem('argon_empresa_ativa'); } catch {}

    const found = savedId ? lista.find(e => e.id === savedId) ?? null : null;
    const active = found ?? lista[0] ?? null;
    _setEmpresaAtiva(active);
    if (active) {
      try { localStorage.setItem('argon_empresa_ativa', active.id); } catch {}
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  function setEmpresaAtiva(e: Empresa | null) {
    _setEmpresaAtiva(e);
    try {
      if (e) localStorage.setItem('argon_empresa_ativa', e.id);
      else localStorage.removeItem('argon_empresa_ativa');
    } catch {}
  }

  return (
    <EmpresaContext.Provider value={{ empresas, empresaAtiva, setEmpresaAtiva, loading, refresh }}>
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa() {
  const ctx = useContext(EmpresaContext);
  if (!ctx) throw new Error('useEmpresa must be inside EmpresaProvider');
  return ctx;
}
