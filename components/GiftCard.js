"use client";

const formatador = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function GiftCard({ presente, indice, onPresentear }) {
  const completo = presente.status === "pago";
  const arrecadado = Number(presente.arrecadado || 0);
  const percentual = Math.min(100, (arrecadado / Number(presente.valor)) * 100);
  // leve rotação alternada, só pra dar aquele ar de fichário de receitas
  const tilt = indice % 2 === 0 ? "-0.6deg" : "0.6deg";

  return (
    <div className="ficha presente" style={{ "--tilt": tilt }}>
      <span className="ficha__rotulo">Presente</span>
      <p className="presente__nome">{presente.nome}</p>
      {presente.descricao && <p className="presente__descricao">{presente.descricao}</p>}
      <p className="presente__valor">{formatador.format(presente.valor)}</p>

      {!completo && (
        <div className="progresso">
          <div className="progresso__barra">
            <div className="progresso__preenchimento" style={{ width: `${percentual}%` }} />
          </div>
          <span className="progresso__texto">
            {formatador.format(arrecadado)} de {formatador.format(presente.valor)} arrecadados
          </span>
        </div>
      )}

      <div className="presente__acao">
        {completo ? (
          <span className="selo-dado">✓ Já foi dado, obrigado!</span>
        ) : (
          <button
            type="button"
            className="botao botao--latao"
            onClick={() => onPresentear(presente)}
            style={{ width: "100%", justifyContent: "center" }}
          >
            Contribuir
          </button>
        )}
      </div>
    </div>
  );
}
