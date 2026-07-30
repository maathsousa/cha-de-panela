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

alter table rsvps enable row level security;
alter table gifts enable row level security;

-- Qualquer visitante pode confirmar presença (insert), mas não pode ler a lista de convidados
create policy "insert_rsvp_publico"
  on rsvps for insert
  with check (true);

-- Qualquer visitante pode ver a lista de presentes disponíveis
create policy "select_gifts_publico"
  on gifts for select
  using (true);

-- Atualizações de gifts (status pago/pendente) e leitura de rsvps só acontecem
-- via service_role key (usada nas rotas /api/checkout, /api/webhook e /api/dashboard-data),
-- que ignora RLS. Não é preciso policy de update/select adicional para isso.

-- Exemplo de como popular sua lista de presentes (edite valores e nomes):
insert into gifts (nome, descricao, valor, imagem_url) values
  ('Jogo de panelas', 'Um conjunto de panelas antiaderentes pra estrear a cozinha', 350.00, null),
  ('Liquidificador', 'Pra vitaminas e sucos de fim de semana', 220.00, null),
  ('Jogo de toalhas', 'Toalhas de banho macias pra casa nova', 150.00, null),
  ('Air fryer', 'A queridinha da cozinha moderna', 400.00, null),
  ('Kit de temperos', 'Especiarias pra deixar tudo com mais sabor', 90.00, null),
  ('Ajuda com o sofá', 'Uma cota pra ajudar no sofá da sala', 500.00, null);
