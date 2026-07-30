import { NextResponse } from "next/server";
import { supabasePublic } from "../../../lib/supabase";

export async function POST(request) {
  const body = await request.json();
  const { nome, acompanhantes, confirmado, mensagem } = body;

  if (!nome || typeof confirmado !== "boolean") {
    return NextResponse.json(
      { erro: "Preencha o nome e confirme se vai comparecer." },
      { status: 400 }
    );
  }

  const { error } = await supabasePublic.from("rsvps").insert({
    nome: nome.trim().slice(0, 120),
    acompanhantes: Number(acompanhantes) || 0,
    confirmado,
    mensagem: mensagem ? mensagem.trim().slice(0, 500) : null,
  });

  if (error) {
    console.error(error);
    return NextResponse.json(
      { erro: "Não consegui salvar sua confirmação. Tenta de novo em instantes." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
