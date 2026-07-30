import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Cliente com permissões restritas (RLS ativo) - seguro pra usar em rotas
// que lidam com o público (RSVP, listar presentes).
export const supabasePublic = createClient(url, anonKey);

// Cliente com permissões totais (ignora RLS) - USE SOMENTE em rotas server-side
// de confiança (webhook do Mercado Pago, checkout, dashboard). Nunca exponha
// SUPABASE_SERVICE_ROLE_KEY para o navegador.
export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});
