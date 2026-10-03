"use client";

import { useEffect, useState } from "react";
import GiftCard from "./GiftCard";
import { VALOR_MINIMO_CONTRIBUICAO, CHAVE_PIX } from "../lib/config";

const formatador = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function GiftList() {
  const [presentes, setPresentes] = useState(null);
  const [erro, setErro] = useState(null);
  const [selecionado, setSelecionado] = useState(null);
  const [nomeComprador, setNomeComprador] = useState("");
  const [valorContribuicao, setValorContribuicao] = useState("");
  const [redirecionando, setRedirecionando] = useState(false);
  const [erroModal, setErroModal] = useState(null);
  const [pixCopiado, setPixCopiado] = useState(false);

async function copiarChavePix() {
  try {
    await navigator.clipboard.writeText(CHAVE_PIX);
    setPixCopiado(true);
    setTimeout(() => setPixCopiado(false), 2000);
  } catch {
    setPixCopiado(false);
  }
}

  useEffect(() => {
    carregarPresentes();
  }, []);

  useEffect(() => {
  if (selecionado) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [selecionado]);

  async function carregarPresentes() {
    try {
      const res = await fetch("/api/gifts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);
      setPresentes(data.presentes);
    } catch {
      setErro("Não consegui carregar a lista de presentes agora.");
    }
  }

  function abrirModal(presente) {
    const falta = Number(presente.valor) - Number(presente.arrecadado || 0);
    setSelecionado(presente);
    setNomeComprador("");
    setValorContribuicao(falta > 0 ? falta.toFixed(2) : "0");
    setErroModal(null);
  }

  function fecharModal() {
    setSelecionado(null);
  }

  async function confirmarPagamento(e) {
    e.preventDefault();
    if (!nomeComprador.trim()) {
      setErroModal("Escreve seu nome pra gente saber quem foi o presente 🙂");
      return;
    }

    const falta = Number(selecionado.valor) - Number(selecionado.arrecadado || 0);
    const valor = Number(valorContribuicao.replace(",", "."));
    if (!Number.isFinite(valor) || valor <= 0) {
      setErroModal("Informa um valor de contribuição válido.");
      return;
    }
    if (valor > falta + 0.01) {
      setErroModal(`O valor não pode passar de ${formatador.format(falta)}, que é o que falta pra completar.`);
      return;
    }

    if (!selecionado.pagamento_unico) {
      const minimo = Math.min(VALOR_MINIMO_CONTRIBUICAO, falta);
      if (valor < minimo - 0.01) {
        setErroModal(`Contribua com pelo menos ${formatador.format(minimo)} (ou o valor que falta, se for menor).`);
        return;
      }
    }

    setRedirecionando(true);
    setErroModal(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giftId: selecionado.id, compradorNome: nomeComprador, valor }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || "Erro ao iniciar pagamento");

      window.location.href = data.initPoint;
    } catch (err) {
      setErroModal(err.message || "Não consegui iniciar o pagamento. Tenta de novo.");
      setRedirecionando(false);
    }
  }

  if (erro) return <p className="secao__texto">{erro}</p>;
  if (!presentes) return <p className="secao__texto">Carregando presentes...</p>;

  return (
    <>
      <div className="presentes-grid">
        {presentes.map((presente, i) => (
          <GiftCard key={presente.id} presente={presente} indice={i} onPresentear={abrirModal} />
        ))}
      </div>

      {selecionado && (() => {
        const falta = Math.max(0, Number(selecionado.valor) - Number(selecionado.arrecadado || 0));
        const minimo = Math.min(VALOR_MINIMO_CONTRIBUICAO, falta);
        return (
        <div className="modal-fundo" onClick={fecharModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__colunas">
              <div className="modal__coluna-form">
                <span className="ficha__rotulo">Contribuir</span>
                <h3 style={{ marginTop: 8 }}>{selecionado.nome}</h3>
                <p style={{ fontSize: 14, color: "rgba(0,48,73,0.65)", marginTop: 6 }}>
                  {selecionado.pagamento_unico
                    ? `Esse presente é só em pagamento único, no valor cheio de ${formatador.format(falta)}.`
                    : `Falta ${formatador.format(falta)} pra completar esse presente. Contribua com pelo menos ${formatador.format(minimo)} (ou o valor que falta, o que for menor).`}{" "}
                  Você será levado(a) ao pagamento seguro do Mercado Pago (Pix ou cartão).
                </p>

                <form onSubmit={confirmarPagamento} style={{ marginTop: 16 }}>
                  <div className="campo">
                    <label htmlFor="nomeComprador">Seu nome</label>
                    <input
                      id="nomeComprador"
                      type="text"
                      value={nomeComprador}
                      onChange={(e) => setNomeComprador(e.target.value)}
                      placeholder="Pra sabermos quem presenteou"
                      maxLength={120}
                    />
                  </div>

                  <div className="campo">
                      <label htmlFor="valorContribuicao">
                        {selecionado.pagamento_unico ? "Valor (pagamento único)" : "Quanto você quer contribuir?"}
                      </label>
                      <input
                        id="valorContribuicao"
                        type="number"
                        step="0.01"
                        min={minimo}
                        max={falta}
                        value={valorContribuicao}
                        readOnly={selecionado.pagamento_unico}
                        onChange={(e) => setValorContribuicao(e.target.value)}
                      />
                  </div>

                  {erroModal && <p className="mensagem-status mensagem-status--erro">{erroModal}</p>}

                  <button
                    type="submit"
                    className="botao botao--latao"
                    disabled={redirecionando}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    {redirecionando ? "Abrindo pagamento..." : "Ir para o pagamento"}
                  </button>
                  <button type="button" className="modal__fechar" onClick={fecharModal}>
                    Cancelar
                  </button>
                </form>
              </div>
              <div className="chave-pix">
              <img src="https://wlnfyonywlonyacrxmnk.supabase.co/storage/v1/object/public/presentes/pix-n.png" alt="Ajude via Pix" className="modal__imagem-pix" />
                <span className="chave-pix__texto">
                  Chave Pix: <strong>{CHAVE_PIX}</strong>
                </span>
                <button type="button" className="chave-pix__botao" onClick={copiarChavePix}>
                  {pixCopiado ? "Copiado! ✓" : "Copiar"}
                </button>
              </div>
            </div>
          </div>
        </div>
        );
      })()}
    </>
  );
}
