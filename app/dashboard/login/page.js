"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginDashboard() {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  async function entrar(e) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      });

      if (!res.ok) {
        setErro("Senha incorreta.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setErro("Algo deu errado. Tenta de novo.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="dash">
      <form className="login-box ficha" onSubmit={entrar}>
        <span className="ficha__rotulo">Área restrita</span>
        <h2 style={{ marginTop: 10, color: "var(--verde-profundo)" }}>Dashboard do chá</h2>

        <div className="campo" style={{ marginTop: 20 }}>
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoFocus
          />
        </div>

        {erro && <p className="mensagem-status mensagem-status--erro">{erro}</p>}

        <button
          type="submit"
          className="botao botao--latao"
          disabled={carregando}
          style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
