# Chá de Panela — Matheus & [Nome dela]

Site com confirmação de presença (RSVP), lista de presentes com pagamento via
Mercado Pago (Pix + cartão) e um dashboard privado pra acompanhar tudo.

## Stack

- **Next.js 14** (App Router) — frontend + rotas de API
- **Supabase** (Postgres grátis) — banco de dados
- **Mercado Pago** (Checkout Pro) — recebimento via Pix/cartão
- **Vercel** — hospedagem gratuita

---

## 1. Rodando localmente

```bash
npm install
cp .env.example .env.local
```

Preencha o `.env.local` com as chaves que você vai pegar nos passos abaixo.

```bash
npm run dev
```

Abra `http://localhost:3000`.

---

## 2. Configurando o Supabase (banco de dados)

1. Crie uma conta grátis em [supabase.com](https://supabase.com) e um novo projeto.
2. Vá em **SQL Editor**, cole o conteúdo do arquivo `supabase/schema.sql` e rode.
   Isso cria as tabelas `rsvps` e `gifts`, já populando a lista de presentes
   com alguns exemplos (edite os valores/nomes direto no SQL antes de rodar,
   ou depois pela aba **Table Editor**).
3. Em **Project Settings → API**, copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ nunca exponha essa
     chave no frontend — ela só é usada nas rotas de servidor)

---

## 3. Configurando o Mercado Pago

1. Entre em [mercadopago.com.br/developers/panel](https://www.mercadopago.com.br/developers/panel)
   com a sua conta (a mesma onde você quer **receber** o dinheiro).
2. Crie uma aplicação e pegue as **credenciais de produção**:
   - `Access Token` → `MP_ACCESS_TOKEN`
3. Em produção, o Mercado Pago vai chamar automaticamente
   `https://SEU-SITE.vercel.app/api/webhook` toda vez que um pagamento mudar de
   status — não precisa configurar nada manualmente pra isso, o código já
   manda esse endereço (`notification_url`) em cada cobrança criada.
4. **Testando localmente**: o Mercado Pago não consegue chamar `localhost`.
   Se quiser testar o webhook rodando na sua máquina, use algo como
   [ngrok](https://ngrok.com) pra gerar uma URL pública temporária e coloque
   ela em `NEXT_PUBLIC_SITE_URL` durante o teste.

---

## 4. Editando o conteúdo do site

- **Textos do convite** (nomes, data, local, horário): edite diretamente em
  `app/page.js` — procure pelos textos entre colchetes `[assim]`.
- **Lista de presentes**: edite direto na tabela `gifts` do Supabase (aba
  **Table Editor**) — nome, descrição, valor e (opcional) `imagem_url` com o
  link de uma foto do produto.
- **Cores/fontes**: estão centralizadas em `app/globals.css`, no bloco
  `:root` no topo do arquivo.
- **Senha do dashboard**: variável `DASHBOARD_PASSWORD` no `.env`.

---

## 5. Publicando no GitHub + Vercel

```bash
git init
git add .
git commit -m "chá de panela"
```

1. Crie um repositório novo no GitHub e suba o código:
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/cha-de-panela.git
   git push -u origin main
   ```
2. Entre em [vercel.com](https://vercel.com), clique em **Add New → Project**
   e importe esse repositório.
3. Em **Environment Variables**, adicione todas as variáveis do `.env.example`
   com os valores reais (Supabase + Mercado Pago + senha do dashboard).
   - `NEXT_PUBLIC_SITE_URL` deve ser a URL final da Vercel, ex:
     `https://cha-de-panela.vercel.app`
4. Clique em **Deploy**. Pronto — seu site está no ar.

Depois do primeiro deploy, se você mudar `NEXT_PUBLIC_SITE_URL`, precisa
fazer um novo deploy pra variável entrar em vigor.

---

## 6. Acessando o dashboard

Vá em `https://SEU-SITE.vercel.app/dashboard` e entre com a senha definida em
`DASHBOARD_PASSWORD`. Lá você vê:

- Quantas pessoas confirmaram presença (e quantas não vão)
- Os recados deixados por cada convidado
- O status de cada presente (disponível / pendente / pago) e quanto já foi
  arrecadado

---

## Observações importantes

- **Presente "pendente"**: quando alguém clica em "Presentear", o item fica
  marcado como pendente até o pagamento ser confirmado pelo webhook. Se a
  pessoa desistir no meio do caminho, o Mercado Pago avisa e o presente volta
  a ficar disponível automaticamente. Enquanto isso, o card mostra
  "Reservado — presentear mesmo assim", então ninguém fica travado esperando.
- **Segurança**: a `service_role key` do Supabase e o `Access Token` do
  Mercado Pago só são usados em rotas de servidor (`app/api/*`), nunca no
  código que roda no navegador do convidado.
- **Ideias de próximos passos** (não implementado, mas dá pra evoluir): enviar
  um e-mail/WhatsApp automático de agradecimento após o pagamento, permitir
  "cotas" parciais em presentes mais caros, exportar a lista de confirmados
  em CSV pelo dashboard.
