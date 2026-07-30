"use client";

import { useState } from "react";

export default function RsvpForm() {
  const [nome, setNome] = useState("");
  const [acompanhantes, setAcompanhantes] = useState(0);
  const [confirmado, setConfirmado] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [status, setStatus] = useState(null); // { tipo: "sucesso" | "erro", texto }

  async function enviar(e) {
    e.preventDefault();

    if (!nome.trim() || confirmado === null) {
      setStatus({ tipo: "erro", texto: "Preenche seu nome e diz pra gente se vai poder vir 🙂" });
      return;
    }

    setEnviando(true);
    setStatus(null);

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, acompanhantes, confirmado, mensagem }),
      });

      if (!res.ok) throw new Error();

      setStatus({
        tipo: "sucesso",
        texto: confirmado
          ? "Confirmado! Vai ser muito bom ter você com a gente 💛"
          : "Poxa, vamos sentir sua falta — obrigado por avisar!",
      });
      setNome("");
      setAcompanhantes(0);
      setMensagem("");
      setConfirmado(null);
    } catch {
      setStatus({ tipo: "erro", texto: "Algo deu errado. Tenta de novo em instantes." });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="rsvp ficha" onSubmit={enviar}>
      <span className="ficha__rotulo">Confirmação de presença</span>

      <div className="campo" style={{ marginTop: 16 }}>
        <label htmlFor="nome">Seu nome</label>
        <input
          id="nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Como você se chama?"
          maxLength={120}
        />
      </div>

      <div className="campo">
        <label>Você vai poder vir?</label>
        <div className="presenca-toggle" role="group" aria-label="Confirmar presença">
          <button
            type="button"
            aria-pressed={confirmado === true}
            onClick={() => setConfirmado(true)}
          >
            Vou estar lá!
          </button>
          <button
            type="button"
            aria-pressed={confirmado === false}
            onClick={() => setConfirmado(false)}
          >
            Não vou conseguir
          </button>
        </div>
      </div>

      {confirmado && (
        <div className="campo">
          <label htmlFor="acompanhantes">Quantos acompanhantes você leva? (além de você)</label>
          <input
            id="acompanhantes"
            type="number"
            min={0}
            max={10}
            value={acompanhantes}
            onChange={(e) => setAcompanhantes(e.target.value)}
          />
        </div>
      )}

      <div className="campo">
        <label htmlFor="mensagem">Recado pra gente (opcional)</label>
        <textarea
          id="mensagem"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Deixe um carinho, uma dica de tempero, o que quiser :)"
          maxLength={500}
        />
      </div>

      <button type="submit" className="botao botao--latao" disabled={enviando} style={{ width: "100%", justifyContent: "center" }}>
        {enviando ? "Enviando..." : "Confirmar"}
      </button>

      {status && (
        <p className={`mensagem-status mensagem-status--${status.tipo}`}>{status.texto}</p>
      )}
    </form>
  );
}
