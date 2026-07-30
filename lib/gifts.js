// Credita uma contribution como paga e, se isso completar o valor total do
// presente, marca o gift como pago. Usado tanto pelo webhook do Mercado Pago
// quanto pela sincronização manual de pagamentos pendentes.
// Retorna true se a contribution foi de fato atualizada agora (idempotente:
// se já estava paga, retorna false e não mexe em nada).
export async function marcarContribuicaoPaga(supabaseAdmin, { contributionId, giftId, paymentId }) {
  const { data: atualizadas } = await supabaseAdmin
    .from("contributions")
    .update({ status: "pago", mp_payment_id: String(paymentId) })
    .eq("id", contributionId)
    .eq("status", "pendente")
    .select("id");

  if (!atualizadas || atualizadas.length === 0) {
    return false;
  }

  const [{ data: gift }, { data: pagas }] = await Promise.all([
    supabaseAdmin.from("gifts").select("valor").eq("id", giftId).single(),
    supabaseAdmin.from("contributions").select("valor").eq("gift_id", giftId).eq("status", "pago"),
  ]);

  const arrecadado = (pagas || []).reduce((soma, c) => soma + Number(c.valor), 0);

  if (gift && arrecadado >= Number(gift.valor)) {
    await supabaseAdmin.from("gifts").update({ status: "pago" }).eq("id", giftId);
  }

  return true;
}
