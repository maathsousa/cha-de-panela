import { NextResponse } from "next/server";
import { supabasePublic } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const [gifts, contributions] = await Promise.all([
    supabasePublic
      .from("gifts")
      .select("id, nome, descricao, valor, imagem_url, status")
      .order("valor", { ascending: true }),
    supabasePublic.from("contributions").select("gift_id, valor").eq("status", "pago"),
  ]);

  if (gifts.error) {
    console.error(gifts.error);
    return NextResponse.json({ erro: "Não consegui carregar os presentes." }, { status: 500 });
  }

  const arrecadadoPorGift = {};
  for (const c of contributions.data || []) {
    arrecadadoPorGift[c.gift_id] = (arrecadadoPorGift[c.gift_id] || 0) + Number(c.valor);
  }

  const presentes = gifts.data.map((g) => ({
    ...g,
    arrecadado: arrecadadoPorGift[g.id] || 0,
  }));

  return NextResponse.json({ presentes });
}
