-- ============================================================
-- ARGON BPO Financeiro — Schema inicial
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- ─── EMPRESAS ────────────────────────────────────────────────
create table if not exists public.empresas (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  operador_id   uuid not null references auth.users(id) on delete cascade,
  nome          text not null,
  cnpj          text,
  responsavel   text,
  segmento      text,
  email         text,
  telefone      text,
  ativo         boolean not null default true
);

alter table public.empresas enable row level security;

create policy "Operador vê apenas suas empresas"
  on public.empresas for all
  using (auth.uid() = operador_id)
  with check (auth.uid() = operador_id);

-- ─── LANÇAMENTOS ─────────────────────────────────────────────
create table if not exists public.lancamentos (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  operador_id     uuid not null references auth.users(id) on delete cascade,
  empresa_id      uuid not null references public.empresas(id) on delete cascade,
  data            date not null,
  descricao       text not null,
  categoria       text not null,
  tipo            text not null check (tipo in ('receita', 'despesa')),
  valor           numeric(14, 2) not null check (valor > 0),
  forma_pagamento text,
  centro_custo    text,
  situacao        text not null default 'realizado'
                    check (situacao in ('realizado', 'previsto', 'cancelado')),
  competencia     text,           -- YYYY-MM (mês de competência)
  observacoes     text
);

alter table public.lancamentos enable row level security;

create policy "Operador vê apenas seus lançamentos"
  on public.lancamentos for all
  using (auth.uid() = operador_id)
  with check (auth.uid() = operador_id);

-- ─── COMPROMISSOS ─────────────────────────────────────────────
create table if not exists public.compromissos (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  operador_id   uuid not null references auth.users(id) on delete cascade,
  empresa_id    uuid not null references public.empresas(id) on delete cascade,
  descricao     text not null,
  vencimento    date not null,
  valor         numeric(14, 2) not null check (valor > 0),
  tipo          text not null check (tipo in ('pagar', 'receber')),
  status        text not null default 'pendente'
                  check (status in ('pendente', 'pago', 'recebido', 'atrasado')),
  categoria     text,
  observacoes   text
);

alter table public.compromissos enable row level security;

create policy "Operador vê apenas seus compromissos"
  on public.compromissos for all
  using (auth.uid() = operador_id)
  with check (auth.uid() = operador_id);

-- ─── ÍNDICES ─────────────────────────────────────────────────
create index if not exists lancamentos_empresa_id_idx  on public.lancamentos(empresa_id);
create index if not exists lancamentos_operador_id_idx on public.lancamentos(operador_id);
create index if not exists lancamentos_data_idx        on public.lancamentos(data);
create index if not exists lancamentos_competencia_idx on public.lancamentos(competencia);

create index if not exists compromissos_empresa_id_idx  on public.compromissos(empresa_id);
create index if not exists compromissos_operador_id_idx on public.compromissos(operador_id);
create index if not exists compromissos_vencimento_idx  on public.compromissos(vencimento);

create index if not exists empresas_operador_id_idx on public.empresas(operador_id);
