# Chá de Panela — Convite & Lista de Presentes Online

Aplicação web full-stack para eventos de chá de panela/casa nova: os convidados confirmam presença e escolhem presentes de uma lista, pagando via Pix ou cartão através do Mercado Pago. O anfitrião acompanha tudo em um dashboard privado, em tempo real.

Projeto pessoal desenvolvido para aprofundar integração de pagamentos, autenticação simples sem dependências pesadas, e Row Level Security no Postgres.

## Funcionalidades

- **Landing page responsiva** com identidade visual própria (paleta e tipografia customizadas via CSS, sem UI kit genérico)
- **RSVP** — formulário de confirmação de presença, com acompanhantes e recado opcional
- **Lista de presentes dinâmica** — busca em tempo real do banco, com estado (`disponível` / `pendente` / `pago`)
- **Checkout integrado** — geração de cobrança via Mercado Pago (Checkout Pro), suportando Pix e cartão
- **Webhook de pagamento** — confirmação assíncrona do status do pagamento, atualizando o presente automaticamente sem intervenção manual
- **Dashboard administrativo** — protegido por autenticação própria (cookie assinado via HMAC), exibe métricas de confirmações e arrecadação

## Stack técnica

| Camada | Tecnologia |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router, Route Handlers) |
| Banco de dados | [Supabase](https://supabase.com/) (Postgres + Row Level Security) |
| Pagamentos | [Mercado Pago](https://www.mercadopago.com.br/developers) (Checkout Pro API) |
| Autenticação do painel | Cookie de sessão assinado via HMAC-SHA256 (Web Crypto API — compatível com Edge Runtime), sem dependência externa |
| Hospedagem | [Vercel](https://vercel.com/) |

## Arquitetura

```
Convidado                          Servidor (Next.js / Vercel)              Serviços externos
─────────                          ────────────────────────────             ─────────────────
Landing page  ── RSVP ──────────►  /api/rsvp ──────────────────────────►    Supabase (insert)
              ── vê presentes ──►  /api/gifts ─────────────────────────►    Supabase (select, RLS)
              ── "Presentear" ──►  /api/checkout ───────────────────────►   Mercado Pago (cria preferência)
                                   marca gift como "pendente"

Mercado Pago  ── webhook ───────►  /api/webhook ────────────────────────►   Supabase (update: pago/liberado)
                                   busca pagamento, valida status

Anfitrião     ── login ─────────►  /api/auth/login (valida senha, cookie)
              ── /dashboard ────►  /api/dashboard-data (protegido por middleware) ──► Supabase (service_role)
```

**Decisões de design relevantes:**

- **RLS no Postgres** garante que o cliente só consegue inserir RSVPs e ler presentes — nunca ler outros convidados nem alterar status de pagamento. Rotas sensíveis (`checkout`, `webhook`, `dashboard-data`) usam a `service_role key`, isolada em código server-side.
- **Autenticação sem NextAuth/biblioteca externa**: sessão é um token `timestamp.assinatura` verificado via HMAC, compatível tanto com rotas Node quanto com o Edge Runtime do middleware — evita dependência extra para um caso de uso simples (senha única de admin).
- **Reconciliação de pagamento via webhook**, não via redirect do usuário: o status "pago" só é confirmado no servidor, consultando a API do Mercado Pago diretamente — o browser nunca é fonte de verdade sobre um pagamento aprovado.

## Rodando localmente

```bash
npm install
cp .env.example .env.local
# preencha o .env.local com suas credenciais (Supabase + Mercado Pago)
npm run dev
```

Veja `.env.example` para a lista completa de variáveis necessárias (Supabase URL/keys, Mercado Pago Access Token, e segredos de sessão do dashboard).

### Banco de dados

O schema (tabelas `rsvps` e `gifts`, com as policies de RLS) está em [`supabase/schema.sql`](./supabase/schema.sql) — basta rodar no SQL Editor de um projeto Supabase novo.

### Deploy

Projeto pronto para deploy direto na Vercel (zero configuração além das variáveis de ambiente). O webhook do Mercado Pago é configurado automaticamente a cada cobrança criada, apontando para `NEXT_PUBLIC_SITE_URL/api/webhook`.

## Estrutura

```
app/
  page.js              → landing page
  dashboard/           → painel admin (protegido por middleware)
  api/
    rsvp/               → confirmação de presença
    gifts/               → listagem pública de presentes
    checkout/            → criação de cobrança Mercado Pago
    webhook/              → confirmação assíncrona de pagamento
    auth/                 → login/logout do dashboard
    dashboard-data/        → dados agregados do painel
components/            → RsvpForm, GiftList, GiftCard (client components)
lib/                    → clientes Supabase, integração Mercado Pago, auth por HMAC
middleware.js           → proteção das rotas /dashboard
supabase/schema.sql      → schema + RLS policies
```

---

Projeto pessoal, não afiliado ao Mercado Pago ou Supabase.
