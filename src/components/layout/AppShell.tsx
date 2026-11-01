'use client';

import { Sidebar } from './Sidebar';
import { EmpresaProvider } from '@/contexts/EmpresaContext';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <EmpresaProvider>
      <div className="flex h-screen overflow-hidden bg-argon-surface">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </EmpresaProvider>
  );
}
