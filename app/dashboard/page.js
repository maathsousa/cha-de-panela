"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const formatador = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function Dashboard() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const router = useRouter();

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      const res = await fetch("/api/dashboard-data");
      if (res.status === 401) {
        router.push("/dashboard/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);
      setDados(data);
    } catch {
      setErro("Não consegui carregar os dados.");
    }
  }

  async function sair() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/dashboard/login");
  }

  if (erro) return <div className="dash">{erro}</div>;
  if (!dados) return <div className="dash">Carregando...</div>;

  const confirmados = dados.rsvps.filter((r) => r.confirmado);
  const naoVao = dados.rsvps.filter((r) => !r.confirmado);
  const totalPessoas = confirmados.reduce((soma, r) => soma + 1 + (r.acompanhantes || 0), 0);

  const arrecadado = dados.contributions
    .filter((c) => c.status === "pago")
    .reduce((soma, c) => soma + Number(c.valor), 0);

  const contribuicoesPorGift = {};
  for (const c of dados.contributions) {
    (contribuicoesPorGift[c.gift_id] ||= []).push(c);
  }

  const rotuloStatusContribuicao = { pago: "✅ Paga", pendente: "⏳ Pendente", cancelado: "❌ Cancelada" };

  return (
    <div className="dash">
      <div className="dash__header">
        <h1 style={{ fontFamily: "var(--fonte-display)", color: "var(--verde-profundo)" }}>
          Dashboard do chá
        </h1>
        <button className="botao botao--contorno" onClick={sair} style={{ borderColor: "rgba(35,40,31,0.2)", color: "var(--verde-profundo)" }}>
          Sair
        </button>
      </div>

      <div className="dash__conteudo">
        <div className="dash-card">
          <div className="dash-metricas">
            <div>
              <div className="metrica__numero">{confirmados.length}</div>
              <div className="metrica__rotulo">Confirmações (grupos)</div>
            </div>
            <div>
              <div className="metrica__numero">{totalPessoas}</div>
              <div className="metrica__rotulo">Pessoas confirmadas</div>
            </div>
            <div>
              <div className="metrica__numero">{naoVao.length}</div>
              <div className="metrica__rotulo">Não vão poder ir</div>
            </div>
            <div>
              <div className="metrica__numero">{formatador.format(arrecadado)}</div>
              <div className="metrica__rotulo">Arrecadado em presentes</div>
            </div>
          </div>
        </div>

        <div className="dash-card">
          <h3 style={{ color: "var(--verde-profundo)", marginBottom: 16 }}>Confirmações de presença</h3>
          {dados.rsvps.length === 0 ? (
            <p style={{ color: "rgba(35,40,31,0.6)", fontSize: 14 }}>Ninguém confirmou ainda.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Vai?</th>
                  <th>Acompanhantes</th>
                  <th>Recado</th>
                  <th>Quando confirmou</th>
                </tr>
              </thead>
              <tbody>
                {dados.rsvps.map((r) => (
                  <tr key={r.id}>
                    <td>{r.nome}</td>
                    <td>{r.confirmado ? "✅ Sim" : "❌ Não"}</td>
                    <td>{r.confirmado ? r.acompanhantes : "—"}</td>
                    <td>{r.mensagem || "—"}</td>
                    <td>{new Date(r.created_at).toLocaleString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="dash-card">
          <h3 style={{ color: "var(--verde-profundo)", marginBottom: 16 }}>Lista de presentes</h3>
          <table>
            <thead>
              <tr>
                <th>Presente</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Contribuições</th>
              </tr>
            </thead>
            <tbody>
              {dados.gifts.map((g) => {
                const contribuicoes = contribuicoesPorGift[g.id] || [];
                return (
                  <tr key={g.id}>
                    <td>{g.nome}</td>
                    <td>{formatador.format(g.valor)}</td>
                    <td>{g.status === "pago" ? "✅ Completo" : "◻️ Disponível"}</td>
                    <td>
                      {contribuicoes.length === 0 ? (
                        "—"
                      ) : (
                        <ul style={{ margin: 0, paddingLeft: 18, listStyle: "none" }}>
                          {contribuicoes.map((c) => (
                            <li key={c.id} style={{ fontSize: 13 }}>
                              {c.nome} — {formatador.format(c.valor)} ({rotuloStatusContribuicao[c.status]})
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
