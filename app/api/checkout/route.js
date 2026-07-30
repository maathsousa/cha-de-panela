import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase";
import { criarPreferencia } from "../../../lib/mercadopago";

export async function POST(request) {
  const { giftId, compradorNome, valor } = await request.json();

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
    return NextResponse.json({ erro: "Esse presente já foi totalmente arrecadado." }, { status: 409 });
  }

  const { data: pagas } = await supabaseAdmin
    .from("contributions")
    .select("valor")
    .eq("gift_id", giftId)
    .eq("status", "pago");

  const arrecadado = (pagas || []).reduce((soma, c) => soma + Number(c.valor), 0);
  const falta = Number(gift.valor) - arrecadado;

  const valorContribuicao = Number(valor);
  if (!Number.isFinite(valorContribuicao) || valorContribuicao <= 0) {
    return NextResponse.json({ erro: "Informe um valor de contribuição válido." }, { status: 400 });
  }
  if (valorContribuicao > falta + 0.01) {
    return NextResponse.json(
      { erro: "Esse valor é maior do que ainda falta arrecadar pra esse presente." },
      { status: 400 }
    );
  }

  try {
    const { data: contribution, error: erroContribution } = await supabaseAdmin
      .from("contributions")
      .insert({
        gift_id: giftId,
        nome: compradorNome || "Convidado",
        valor: valorContribuicao,
        status: "pendente",
      })
      .select()
      .single();

    if (erroContribution || !contribution) {
      throw erroContribution || new Error("Falha ao criar contribuição.");
    }

    const preferencia = await criarPreferencia({
      gift,
      valor: valorContribuicao,
      compradorNome,
      contributionId: contribution.id,
    });

    await supabaseAdmin
      .from("contributions")
      .update({ mp_preference_id: preferencia.id })
      .eq("id", contribution.id);

    return NextResponse.json({ initPoint: preferencia.init_point });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { erro: "Não consegui criar o pagamento agora. Tenta de novo em instantes." },
      { status: 500 }
    );
  }
}
