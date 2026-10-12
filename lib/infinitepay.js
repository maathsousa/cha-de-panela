const INFINITEPAY_BASE_URL = "https://api.checkout.infinitepay.io";

function getHandle() {
  const handle = process.env.INFINITEPAY_HANDLE;
  if (!handle) throw new Error("INFINITEPAY_HANDLE não configurado.");
  return handle.replace(/^\$/, "");
}

function getSiteUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) throw new Error("NEXT_PUBLIC_SITE_URL não configurado.");
  return siteUrl.replace(/\/$/, "");
}

export async function criarLinkInfinitePay({ gift, valor, compradorNome, contributionId }) {
  const siteUrl = getSiteUrl();
  const body = {
    handle: getHandle(),
    items: [
      {
        quantity: 1,
        price: Math.round(Number(valor) * 100),
        description: gift.nome,
      },
    ],
    order_nsu: contributionId,
    redirect_url: `${siteUrl}/?presente=retorno&provedor=infinitepay`,
    webhook_url: `${siteUrl}/api/webhook-infinitepay`,
  };

  if (compradorNome?.trim()) {
    body.customer = { name: compradorNome.trim() };
  }

  const res = await fetch(`${INFINITEPAY_BASE_URL}/links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Erro ao criar checkout InfinitePay: ${data.message || res.statusText}`);
  }

  // A documentação publica mais de um nome para o campo do link.
  const checkoutUrl = data.checkout_url || data.url || data.link;
  if (!checkoutUrl) throw new Error("A InfinitePay não retornou o link de checkout.");

  const parsedUrl = new URL(checkoutUrl);
  const hostPermitido =
    parsedUrl.hostname.endsWith(".infinitepay.io") ||
    parsedUrl.hostname.endsWith(".infinitepay.com.br");
  if (parsedUrl.protocol !== "https:" || !hostPermitido) {
    throw new Error("A InfinitePay retornou um link de checkout inválido.");
  }

  return checkoutUrl;
}

export async function confirmarPagamentoInfinitePay({ orderNsu, transactionNsu, slug }) {
  const res = await fetch(`${INFINITEPAY_BASE_URL}/payment_check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      handle: getHandle(),
      order_nsu: orderNsu,
      transaction_nsu: transactionNsu,
      slug,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Erro ao confirmar pagamento InfinitePay: ${data.message || res.statusText}`);
  }
  return data;
}
