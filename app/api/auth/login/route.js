import { NextResponse } from "next/server";
import {
  senhaCorreta,
  criarSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "../../../../lib/auth";

export async function POST(request) {
  const { senha } = await request.json();

  if (!senha || !senhaCorreta(senha)) {
    return NextResponse.json({ erro: "Senha incorreta" }, { status: 401 });
  }

  const token = await criarSessionToken();

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return response;
}
