-- Rode esse script inteiro no SQL Editor do seu projeto Supabase.

create extension if not exists "pgcrypto";

create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  acompanhantes int not null default 0,
  confirmado boolean not null,
  mensagem text,
  created_at timestamptz not null default now()
);

create table if not exists gifts (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  valor numeric(10,2) not null,
  imagem_url text,
  status text not null default 'disponivel' check (status in ('disponivel','pendente','pago')),
  comprador_nome text,
  mp_payment_id text,
  mp_preference_id text,
  created_at timestamptz not null default now()
);

create table if not exists contributions (
  id uuid primary key default gen_random_uuid(),
  gift_id uuid not null references gifts(id) on delete cascade,
  nome text not null,
  valor numeric(10,2) not null,
  status text not null default 'pendente' check (status in ('pendente','pago','cancelado')),
  mp_payment_id text,
  mp_preference_id text,
  created_at timestamptz not null default now()
);

alter table rsvps enable row level security;
alter table gifts enable row level security;
alter table contributions enable row level security;

-- Qualquer visitante pode confirmar presença (insert), mas não pode ler a lista de convidados
create policy "insert_rsvp_publico"
  on rsvps for insert
  with check (true);

-- Qualquer visitante pode ver a lista de presentes disponíveis
create policy "select_gifts_publico"
  on gifts for select
  using (true);

-- Qualquer visitante pode ver quanto já foi arrecadado (só contribuições pagas)
create policy "select_contributions_pagas_publico"
  on contributions for select
  using (status = 'pago');

-- Atualizações de gifts (status pago/disponivel), inserts/updates de contributions
-- e leitura de rsvps só acontecem via service_role key (usada nas rotas /api/checkout,
-- /api/webhook e /api/dashboard-data), que ignora RLS. Não é preciso policy adicional para isso.

-- Exemplo de como popular sua lista de presentes (edite valores e nomes):

