import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase";
import { confirmarPagamentoInfinitePay } from "../../../lib/infinitepay";
import { marcarContribuicaoPaga } from "../../../lib/gifts";

export const maxDuration = 30;

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ erro: "Payload inválido." }, { status: 400 });
  }

  const orderNsu = payload?.order_nsu;
  const transactionNsu = payload?.transaction_nsu;
  const slug = payload?.invoice_slug || payload?.slug;
  if (!orderNsu || !transactionNsu || !slug) {
    return NextResponse.json({ erro: "Dados de pagamento incompletos." }, { status: 400 });
  }

  try {
    const { data: contribution, error } = await supabaseAdmin
      .from("contributions")
      .select("id, gift_id, valor, status, payment_provider")
      .eq("id", orderNsu)
      .eq("payment_provider", "infinitepay")
      .single();

    if (error || !contribution) {
      return NextResponse.json({ erro: "Contribuição não encontrada." }, { status: 404 });
    }
    if (contribution.status === "pago") return NextResponse.json({ ok: true });

    // O webhook só informa que houve pagamento. Confirmamos o status e o valor
    // diretamente com a InfinitePay antes de creditar a contribuição.
    const pagamento = await confirmarPagamentoInfinitePay({ orderNsu, transactionNsu, slug });
    const valorEsperado = Math.round(Number(contribution.valor) * 100);
    if (!pagamento.success || !pagamento.paid || Number(pagamento.amount) !== valorEsperado) {
      return NextResponse.json({ erro: "Pagamento ainda não confirmado ou valor divergente." }, { status: 400 });
    }

    await marcarContribuicaoPaga(supabaseAdmin, {
      contributionId: contribution.id,
      giftId: contribution.gift_id,
      paymentId: transactionNsu,
      provedor: "infinitepay",
    });

    await supabaseAdmin
      .from("contributions")
      .update({ infinitepay_slug: String(slug) })
      .eq("id", contribution.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro no webhook da InfinitePay:", err);
    return NextResponse.json({ erro: "Não foi possível confirmar o pagamento." }, { status: 500 });
  }
}
