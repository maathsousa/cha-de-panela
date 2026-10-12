# Chá de Panela — Convite & Lista de Presentes Online

Aplicação web full-stack para eventos de chá de panela/casa nova: os convidados confirmam presença e escolhem presentes de uma lista, pagando via Mercado Pago ou InfinitePay. O anfitrião acompanha tudo em um dashboard privado, em tempo real.

Projeto pessoal desenvolvido para aprofundar integração de pagamentos, autenticação simples sem dependências pesadas, e Row Level Security no Postgres.

## Funcionalidades

- **Landing page responsiva** com identidade visual própria (paleta e tipografia customizadas via CSS, sem UI kit genérico)
- **RSVP** — formulário de confirmação de presença, com acompanhantes e recado opcional
- **Lista de presentes dinâmica** — busca em tempo real do banco, com estado (`disponível` / `pendente` / `pago`)
- **Checkout integrado** — botão Pix pelo Mercado Pago e botão de cartão pela InfinitePay
- **Webhooks de pagamento** — confirmação do status no servidor e atualização automática do presente
- **Dashboard administrativo** — protegido por autenticação própria (cookie assinado via HMAC), exibe métricas de confirmações e arrecadação

## Stack técnica

| Camada | Tecnologia |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router, Route Handlers) |
| Banco de dados | [Supabase](https://supabase.com/) (Postgres + Row Level Security) |
| Pagamentos | [Mercado Pago](https://www.mercadopago.com.br/developers) (Checkout Pro) e [InfinitePay](https://www.infinitepay.io/checkout-documentacao) (Checkout Integrado) |
| Autenticação do painel | Cookie de sessão assinado via HMAC-SHA256 (Web Crypto API — compatível com Edge Runtime), sem dependência externa |
| Hospedagem | [Vercel](https://vercel.com/) |

## Arquitetura

```
Convidado                          Servidor (Next.js / Vercel)              Serviços externos
─────────                          ────────────────────────────             ─────────────────
Landing page  ── RSVP ──────────►  /api/rsvp ──────────────────────────►    Supabase (insert)
              ── vê presentes ──►  /api/gifts ─────────────────────────►    Supabase (select, RLS)
              ── Pix ────────────►  /api/checkout ───────────────────────►   Mercado Pago (Pix)
              ── Cartão ─────────►  /api/checkout ───────────────────────►   InfinitePay (checkout)
                                   cria contribuição pendente e checkout

Mercado Pago  ── webhook ───────►  /api/webhook ────────────────────────►   Supabase (update: pago)
InfinitePay   ── webhook ───────►  /api/webhook-infinitepay ────────────►   confirma via API e atualiza Supabase

Anfitrião     ── login ─────────►  /api/auth/login (valida senha, cookie)
              ── /dashboard ────►  /api/dashboard-data (protegido por middleware) ──► Supabase (service_role)
```

**Decisões de design relevantes:**

- **RLS no Postgres** garante que o cliente só consegue inserir RSVPs e ler presentes — nunca ler outros convidados nem alterar status de pagamento. Rotas sensíveis (`checkout`, `webhook`, `dashboard-data`) usam a `service_role key`, isolada em código server-side.
- **Autenticação sem NextAuth/biblioteca externa**: sessão é um token `timestamp.assinatura` verificado via HMAC, compatível tanto com rotas Node quanto com o Edge Runtime do middleware — evita dependência extra para um caso de uso simples (senha única de admin).
- **Reconciliação de pagamento via webhook**, não via redirect do usuário: os status são confirmados no servidor consultando a API do provedor — o browser nunca é fonte de verdade sobre um pagamento aprovado.

## Rodando localmente

```bash
npm install
cp .env.example .env.local
# preencha o .env.local com suas credenciais (Supabase + Mercado Pago)
npm run dev
```

Veja `.env.example` para a lista completa de variáveis necessárias. Configure `INFINITEPAY_HANDLE` com sua InfiniteTag, sem o `$` inicial.

### Banco de dados

O schema (tabelas `rsvps`, `gifts` e `contributions`, com as policies de RLS) está em [`supabase/schema.sql`](./supabase/schema.sql) — basta rodar no SQL Editor de um projeto Supabase novo. Para um banco que já existe, rode [`supabase/migrations/20261012_add_infinitepay.sql`](./supabase/migrations/20261012_add_infinitepay.sql) antes do deploy.

### Deploy

Na Vercel, configure `INFINITEPAY_HANDLE` e mantenha `NEXT_PUBLIC_SITE_URL` apontando para o domínio público. Os webhooks são configurados automaticamente nos checkouts: `/api/webhook` para o Mercado Pago e `/api/webhook-infinitepay` para a InfinitePay.

## Estrutura

```
app/
  page.js              → landing page
  dashboard/           → painel admin (protegido por middleware)
  api/
    rsvp/               → confirmação de presença
    gifts/               → listagem pública de presentes
    checkout/            → criação de cobrança Mercado Pago
    webhook/              → confirmação assíncrona Mercado Pago
    webhook-infinitepay/  → confirmação assíncrona InfinitePay
    auth/                 → login/logout do dashboard
    dashboard-data/        → dados agregados do painel
components/            → RsvpForm, GiftList, GiftCard (client components)
lib/                    → clientes Supabase, integração Mercado Pago, auth por HMAC
middleware.js           → proteção das rotas /dashboard
supabase/schema.sql      → schema + RLS policies
```

---

Projeto pessoal, não afiliado ao Mercado Pago ou Supabase.
