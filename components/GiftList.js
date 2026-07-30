"use client";

import { useEffect, useState } from "react";
import GiftCard from "./GiftCard";

export default function GiftList() {
  const [presentes, setPresentes] = useState(null);
  const [erro, setErro] = useState(null);
  const [selecionado, setSelecionado] = useState(null);
  const [nomeComprador, setNomeComprador] = useState("");
  const [redirecionando, setRedirecionando] = useState(false);
  const [erroModal, setErroModal] = useState(null);

  useEffect(() => {
    carregarPresentes();
  }, []);

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
    setSelecionado(presente);
    setNomeComprador("");
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

    setRedirecionando(true);
    setErroModal(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giftId: selecionado.id, compradorNome: nomeComprador }),
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

      {selecionado && (
        <div className="modal-fundo" onClick={fecharModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <span className="ficha__rotulo">Presentear</span>
            <h3 style={{ marginTop: 8 }}>{selecionado.nome}</h3>
            <p style={{ fontSize: 14, color: "rgba(35,40,31,0.65)", marginTop: 6 }}>
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
        </div>
      )}
    </>
  );
}
