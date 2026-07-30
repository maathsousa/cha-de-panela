const MP_BASE_URL = "https://api.mercadopago.com";

function getAccessToken() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("MP_ACCESS_TOKEN não configurado no .env");
  return token;
}

// Cria uma "preference" (uma cobrança) no Mercado Pago pra uma contribuição
// específica dentro da vaquinha de um presente. externalReference = id da
// contribution no nosso banco (não do presente, já que várias contributions
// podem apontar pro mesmo presente), pra sabermos qual creditar quando o
// webhook chegar.
export async function criarPreferencia({ gift, valor, compradorNome, contributionId }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const body = {
    items: [
      {
        title: gift.nome,
        description: gift.descricao || undefined,
        quantity: 1,
        unit_price: Number(valor),
        currency_id: "BRL",
      },
    ],
    metadata: {
      gift_id: gift.id,
      contribution_id: contributionId,
      comprador_nome: compradorNome || "Convidado",
    },
    external_reference: contributionId,
    back_urls: {
      success: `${siteUrl}/?presente=obrigado`,
      pending: `${siteUrl}/?presente=pendente`,
      failure: `${siteUrl}/?presente=falhou`,
    },
    auto_return: "approved",
    notification_url: `${siteUrl}/api/webhook`,
  };

  const res = await fetch(`${MP_BASE_URL}/checkout/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const erro = await res.text();
    throw new Error(`Erro ao criar preferência no Mercado Pago: ${erro}`);
  }

  return res.json(); // contém .id e .init_point
}

// Busca os detalhes de um pagamento específico (usado no webhook pra confirmar status)
export async function buscarPagamento(paymentId) {
  const res = await fetch(`${MP_BASE_URL}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });

  if (!res.ok) {
    const erro = await res.text();
    throw new Error(`Erro ao buscar pagamento no Mercado Pago: ${erro}`);
  }

  return res.json();
}

// Busca pagamentos por preference_id via merchant_orders (usado na
// sincronização manual, pra quando o webhook não entrega a notificação)
export async function buscarPagamentosPorPreferencia(preferenceId) {
  const res = await fetch(
    `${MP_BASE_URL}/merchant_orders/search?preference_id=${preferenceId}`,
    { headers: { Authorization: `Bearer ${getAccessToken()}` } }
  );
  if (!res.ok) {
    const erro = await res.text();
    throw new Error(`Erro ao buscar merchant_order: ${erro}`);
  }
  const data = await res.json();
  // cada merchant_order tem um array "payments" com os pagamentos daquela cobrança
  const todosPagamentos = (data.elements || []).flatMap((order) => order.payments || []);
  return todosPagamentos;
}
