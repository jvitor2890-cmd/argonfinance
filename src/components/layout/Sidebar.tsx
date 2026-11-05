'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  BarChart3,
  TrendingUp,
  Building2,
  Zap,
  LogOut,
  ChevronDown,
  Landmark,
} from 'lucide-react';
import clsx from 'clsx';
import { createClient } from '@/lib/supabase/client';
import { useEmpresa } from '@/contexts/EmpresaContext';

const navItems = [
  { href: '/dashboard',    label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/empresas',     label: 'Empresas',       icon: Building2 },
  { href: '/lancamentos',  label: 'Lançamentos',    icon: Receipt },
  { href: '/contas',       label: 'Contas a P/R',   icon: CreditCard },
  { href: '/conciliacao',  label: 'Conciliação',    icon: Landmark },
  { href: '/dre',          label: 'DRE Gerencial',  icon: BarChart3 },
  { href: '/simulador',    label: 'Simulador',      icon: TrendingUp },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { empresas, empresaAtiva, setEmpresaAtiva } = useEmpresa();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null);
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <aside className="flex h-screen w-64 flex-shrink-0 flex-col bg-argon-navy select-none">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-argon-navy-700">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-argon-blue">
          <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <span className="block text-lg font-bold tracking-widest text-white">ARGON</span>
          <span className="block text-[10px] font-medium uppercase tracking-widest text-argon-muted">
            BPO Financeiro
          </span>
        </div>
      </div>

      {/* Empresa selector */}
      {userEmail && empresas.length > 0 && (
        <div className="px-3 py-3 border-b border-argon-navy-700">
          <p className="px-1 mb-1 text-[9px] font-semibold uppercase tracking-widest text-argon-muted">Empresa ativa</p>
          <div className="relative">
            <select
              value={empresaAtiva?.id ?? ''}
              onChange={e => {
                const emp = empresas.find(em => em.id === e.target.value);
                if (emp) setEmpresaAtiva(emp);
              }}
              className="w-full appearance-none rounded-lg bg-argon-navy-700 border border-argon-navy-600 px-3 py-2 text-xs font-medium text-white focus:border-argon-blue focus:outline-none pr-7"
            >
              {empresas.map(e => (
                <option key={e.id} value={e.id}>{e.nome}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-argon-muted pointer-events-none" />
          </div>
        </div>
      )}

      {userEmail && empresas.length === 0 && (
        <div className="px-3 py-3 border-b border-argon-navy-700">
          <Link
            href="/empresas"
            className="block rounded-lg border border-dashed border-argon-navy-600 px-3 py-2 text-center text-[11px] text-argon-muted hover:border-argon-blue hover:text-white transition-colors"
          >
            + Cadastrar primeira empresa
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-argon-muted">Menu</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-argon-blue text-white shadow-md'
                  : 'text-slate-400 hover:bg-argon-navy-700 hover:text-white'
              )}
            >
              <Icon
                className={clsx('h-4 w-4 shrink-0', active ? 'text-white' : 'text-slate-500 group-hover:text-white')}
                strokeWidth={active ? 2.5 : 2}
              />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Operador */}
      <div className="border-t border-argon-navy-700 px-4 py-4">
        {userEmail ? (
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-argon-muted">Operador</p>
              <p className="mt-0.5 text-[11px] text-slate-300 truncate" title={userEmail}>{userEmail}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sair"
              className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">⚠ Modo Demonstração</p>
            <p className="mt-0.5 text-[10px] text-amber-400/70">Dados fictícios para apresentação</p>
          </div>
        )}
      </div>
    </aside>
  );
}
