import { Construction } from 'lucide-react';
import { AppShell } from './AppShell';

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <AppShell>
      <div className="flex h-full min-h-[calc(100vh-1px)] items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-argon-navy">
            <Construction className="h-8 w-8 text-argon-blue-light" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <p className="mt-2 text-sm text-gray-400 leading-relaxed">{description}</p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-argon-blue/10 px-4 py-2 text-xs font-semibold text-argon-blue">
            Disponível na próxima etapa
          </div>
        </div>
      </div>
    </AppShell>
  );
}
