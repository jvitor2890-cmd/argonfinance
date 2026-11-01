'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Email ou senha incorretos. Verifique suas credenciais.');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-argon-navy flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-argon-blue mb-4 shadow-lg">
            <Zap className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-widest text-white">ARGON</h1>
          <p className="mt-1 text-xs font-medium uppercase tracking-widest text-argon-muted">
            BPO Financeiro
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-8 backdrop-blur-sm">
          <h2 className="text-base font-semibold text-white mb-1">Acesso do Operador</h2>
          <p className="text-xs text-argon-muted mb-6">
            Entre com suas credenciais para acessar o sistema.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="operador@argon.com.br"
                className="w-full rounded-lg bg-white/10 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-argon-blue focus:ring-2 focus:ring-argon-blue/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-lg bg-white/10 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-argon-blue focus:ring-2 focus:ring-argon-blue/30 transition-all"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3.5 py-3">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-argon-blue px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-argon-blue/90 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando…
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] text-argon-muted">
          Acesso restrito a operadores autorizados
        </p>
      </div>
    </div>
  );
}
