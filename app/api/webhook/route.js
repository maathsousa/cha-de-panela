import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase";
import { buscarPagamento } from "../../../lib/mercadopago";

export const maxDuration = 30;

// O Mercado Pago chama essa rota automaticamente quando o status de um
// pagamento muda. Documentação: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/notifications/webhooks
export async function POST(request) {
  console.log("Webhook recebido:", new Date().toISOString());

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: true }); // corpo vazio ou inválido, ignora
  }

  const paymentId = payload?.data?.id;
  const tipo = payload?.type;

  // Só nos importa notificação de pagamento
  if (tipo !== "payment" || !paymentId) {
    return NextResponse.json({ ok: true });
  }

  try {
    console.log("Buscando pagamento:", paymentId);
    const pagamento = await buscarPagamento(paymentId);
    console.log(
      "Pagamento retornado:",
      JSON.stringify({ status: pagamento.status, external_reference: pagamento.external_reference })
    );
    console.log("Status do pagamento:", pagamento.status);
    const contributionId = pagamento.external_reference;

    if (!contributionId) {
      return NextResponse.json({ ok: true });
    }

    console.log("Buscando contribution:", contributionId);
    const { data: contribution } = await supabaseAdmin
      .from("contributions")
      .select("id, gift_id")
      .eq("id", contributionId)
      .single();
    console.log("Contribution encontrada:", JSON.stringify(contribution));

    if (!contribution) {
      return NextResponse.json({ ok: true });
    }

    if (pagamento.status === "approved") {
      await supabaseAdmin
        .from("contributions")
        .update({ status: "pago", mp_payment_id: String(paymentId) })
        .eq("id", contributionId)
        .eq("status", "pendente");

      const [{ data: gift }, { data: pagas }] = await Promise.all([
        supabaseAdmin.from("gifts").select("valor").eq("id", contribution.gift_id).single(),
        supabaseAdmin.from("contributions").select("valor").eq("gift_id", contribution.gift_id).eq("status", "pago"),
      ]);

      const arrecadado = (pagas || []).reduce((soma, c) => soma + Number(c.valor), 0);

      if (gift && arrecadado >= Number(gift.valor)) {
        await supabaseAdmin.from("gifts").update({ status: "pago" }).eq("id", contribution.gift_id);
      }
    } else if (["rejected", "cancelled", "expired"].includes(pagamento.status)) {
      // Libera essa contribuição, sem afetar outras contribuições pendentes do mesmo presente
      await supabaseAdmin
        .from("contributions")
        .update({ status: "cancelado" })
        .eq("id", contributionId)
        .eq("status", "pendente");
    }
    // status "pending" (ex: boleto/pix aguardando) a gente só espera a próxima notificação

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro no webhook do Mercado Pago:", err);
    console.error("Stack:", err.stack);
    console.error("Mensagem:", err.message);
    // Retorna 200 mesmo assim pra evitar retentativas agressivas do MP em loop;
    // o erro já foi logado pra você investigar.
    return NextResponse.json({ ok: true });
  }
}
