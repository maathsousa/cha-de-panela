// Autenticação simples do dashboard via cookie assinado (HMAC).
// Usa Web Crypto API (crypto.subtle) em vez do módulo "crypto" do Node,
// porque este arquivo também é usado pelo middleware.js, que roda no
// Edge Runtime da Vercel (não suporta o módulo "crypto" do Node).

const COOKIE_NAME = "cha_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET não configurado no .env");
  return secret;
}

async function getKey() {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

function bufferToHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function assinar(valor) {
  const key = await getKey();
  const encoder = new TextEncoder();
  const assinatura = await crypto.subtle.sign("HMAC", key, encoder.encode(valor));
  return bufferToHex(assinatura);
}

// Gera um token "timestamp.assinatura" - não precisa de banco de sessões.
export async function criarSessionToken() {
  const timestamp = Date.now().toString();
  const assinatura = await assinar(timestamp);
  return `${timestamp}.${assinatura}`;
}

export async function tokenValido(token) {
  if (!token || !token.includes(".")) return false;
  const [timestamp, assinatura] = token.split(".");
  if (!timestamp || !assinatura) return false;

  const assinaturaEsperada = await assinar(timestamp);
  if (assinatura.length !== assinaturaEsperada.length) return false;
  if (assinatura !== assinaturaEsperada) return false;

  const idade = Date.now() - Number(timestamp);
  return idade >= 0 && idade <= SESSION_DURATION_MS;
}

// Comparação em tempo constante pra evitar timing attack na senha
export function senhaCorreta(senhaDigitada) {
  const senhaReal = process.env.DASHBOARD_PASSWORD;
  if (!senhaReal) throw new Error("DASHBOARD_PASSWORD não configurado no .env");
  if (senhaDigitada.length !== senhaReal.length) return false;
  let diff = 0;
  for (let i = 0; i < senhaReal.length; i++) {
    diff |= senhaDigitada.charCodeAt(i) ^ senhaReal.charCodeAt(i);
  }
  return diff === 0;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_MAX_AGE_SECONDS = SESSION_DURATION_MS / 1000;
