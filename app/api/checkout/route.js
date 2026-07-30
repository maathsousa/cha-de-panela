import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase";
import { criarPreferencia } from "../../../lib/mercadopago";

export async function POST(request) {
  const { giftId, compradorNome } = await request.json();

  if (!giftId) {
    return NextResponse.json({ erro: "Presente não informado." }, { status: 400 });
  }

  const { data: gift, error: erroBusca } = await supabaseAdmin
    .from("gifts")
    .select("*")
    .eq("id", giftId)
    .single();

  if (erroBusca || !gift) {
    return NextResponse.json({ erro: "Presente não encontrado." }, { status: 404 });
  }

  if (gift.status === "pago") {
    return NextResponse.json({ erro: "Esse presente já foi dado por alguém." }, { status: 409 });
  }

  try {
    const preferencia = await criarPreferencia({ gift, compradorNome });

    // Marca como "pendente" e guarda o id da preferência + o nome de quem está presenteando,
    // pra já aparecer reservado na lista enquanto o pagamento é confirmado.
    await supabaseAdmin
      .from("gifts")
      .update({
        status: "pendente",
        mp_preference_id: preferencia.id,
        comprador_nome: compradorNome || "Convidado",
      })
      .eq("id", giftId);

    return NextResponse.json({ initPoint: preferencia.init_point });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { erro: "Não consegui criar o pagamento agora. Tenta de novo em instantes." },
      { status: 500 }
    );
  }
}
