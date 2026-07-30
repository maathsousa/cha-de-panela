import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase";
import { tokenValido, SESSION_COOKIE_NAME } from "../../../lib/auth";
import { buscarPagamentosPorPreferencia } from "../../../lib/mercadopago";
import { marcarContribuicaoPaga } from "../../../lib/gifts";

export const maxDuration = 30;

// Sincronização manual pra quando o webhook do Mercado Pago não entrega a
// notificação: varre as contributions pendentes e consulta a API do MP
// diretamente por preference_id (via merchant_orders), creditando as que já
// foram aprovadas.
export async function POST(request) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!(await tokenValido(token))) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const { data: pendentes, error } = await supabaseAdmin
    .from("contributions")
    .select("id, gift_id, mp_preference_id")
    .eq("status", "pendente");

  if (error) {
    console.error(error);
    return NextResponse.json({ erro: "Erro ao buscar contribuições pendentes." }, { status: 500 });
  }

  let atualizadas = 0;
  let falharam = 0;

  for (const contribution of pendentes || []) {
    if (!contribution.mp_preference_id) continue;

    try {
      const pagamentos = await buscarPagamentosPorPreferencia(contribution.mp_preference_id);
      const aprovado = pagamentos.find((p) => p.status === "approved");

      if (aprovado) {
        const foiAtualizada = await marcarContribuicaoPaga(supabaseAdmin, {
          contributionId: contribution.id,
          giftId: contribution.gift_id,
          paymentId: aprovado.id,
        });
        if (foiAtualizada) atualizadas++;
      }
    } catch (err) {
      falharam++;
      console.error(`Erro ao sincronizar contribution ${contribution.id}:`, err);
    }
  }

  return NextResponse.json({ atualizadas, falharam, verificadas: (pendentes || []).length });
}
