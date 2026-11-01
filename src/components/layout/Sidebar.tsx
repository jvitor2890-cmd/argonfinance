'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  BarChart3,
  TrendingUp,
  Zap,
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { href: '/dashboard',   label: 'Dashboard',         icon: LayoutDashboard, ready: true  },
  { href: '/lancamentos', label: 'Lançamentos',        icon: Receipt,         ready: true  },
  { href: '/contas',      label: 'Contas a P/R',       icon: CreditCard,      ready: true  },
  { href: '/dre',         label: 'DRE Gerencial',      icon: BarChart3,       ready: true  },
  { href: '/simulador',   label: 'Simulador',          icon: TrendingUp,      ready: true  },
];

export function Sidebar() {
  const pathname = usePathname();

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
            Dashboard Financeiro
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-argon-muted">
          Menu
        </p>
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
              {!item.ready && (
                <span className="rounded-full bg-argon-navy-700 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-argon-muted">
                  Em breve
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Demo Badge */}
      <div className="border-t border-argon-navy-700 px-4 py-4">
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
            ⚠ Modo Demonstração
          </p>
          <p className="mt-0.5 text-[10px] text-amber-400/70">
            Dados fictícios para apresentação
          </p>
        </div>
      </div>
    </aside>
  );
}
