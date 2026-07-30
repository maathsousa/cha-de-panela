import { NextResponse } from "next/server";
import { supabasePublic } from "../../../lib/supabase";

export async function GET() {
  const { data, error } = await supabasePublic
    .from("gifts")
    .select("id, nome, descricao, valor, imagem_url, status")
    .order("valor", { ascending: true });

  if (error) {
    console.error(error);
    return NextResponse.json({ erro: "Não consegui carregar os presentes." }, { status: 500 });
  }

  return NextResponse.json({ presentes: data });
}
