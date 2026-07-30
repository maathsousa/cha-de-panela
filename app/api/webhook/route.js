import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase";
import { buscarPagamento } from "../../../lib/mercadopago";

// O Mercado Pago chama essa rota automaticamente quando o status de um
// pagamento muda. Documentação: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/notifications/webhooks
export async function POST(request) {
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
    const pagamento = await buscarPagamento(paymentId);
    const giftId = pagamento.external_reference;

    if (!giftId) {
      return NextResponse.json({ ok: true });
    }

    if (pagamento.status === "approved") {
      await supabaseAdmin
        .from("gifts")
        .update({
          status: "pago",
          mp_payment_id: String(paymentId),
          comprador_nome: pagamento.metadata?.comprador_nome || "Convidado",
        })
        .eq("id", giftId);
    } else if (["rejected", "cancelled"].includes(pagamento.status)) {
      // Libera o presente de novo pra outra pessoa poder presentear
      await supabaseAdmin
        .from("gifts")
        .update({ status: "disponivel", mp_preference_id: null })
        .eq("id", giftId)
        .eq("status", "pendente");
    }
    // status "pending" (ex: boleto/pix aguardando) a gente só espera a próxima notificação

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro no webhook do Mercado Pago:", err);
    // Retorna 200 mesmo assim pra evitar retentativas agressivas do MP em loop;
    // o erro já foi logado pra você investigar.
    return NextResponse.json({ ok: true });
  }
}
