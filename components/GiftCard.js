"use client";

const formatador = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function GiftCard({ presente, indice, onPresentear }) {
  const dado = presente.status === "pago";
  const pendente = presente.status === "pendente";
  // leve rotação alternada, só pra dar aquele ar de fichário de receitas
  const tilt = indice % 2 === 0 ? "-0.6deg" : "0.6deg";

  return (
    <div className="ficha presente" style={{ "--tilt": tilt }}>
      <span className="ficha__rotulo">Presente</span>
      <p className="presente__nome">{presente.nome}</p>
      {presente.descricao && <p className="presente__descricao">{presente.descricao}</p>}
      <p className="presente__valor">{formatador.format(presente.valor)}</p>

      <div className="presente__acao">
        {dado ? (
          <span className="selo-dado">✓ Já foi dado, obrigado!</span>
        ) : (
          <button
            type="button"
            className="botao botao--latao"
            onClick={() => onPresentear(presente)}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {pendente ? "Reservado — presentear mesmo assim" : "Presentear"}
          </button>
        )}
      </div>
    </div>
  );
}
