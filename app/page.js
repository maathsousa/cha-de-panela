import RsvpForm from "../components/RsvpForm";
import GiftList from "../components/GiftList";

export default function Home() {
  return (
    <main>
      {/* ===== HERO ===== */}
      {/* Edite os textos abaixo (nomes, data, local) com as informações reais do seu chá */}
      <section className="hero">
        <div className="container">
          <span className="hero__etiqueta">Chá de Panela</span>
          <h1 className="hero__titulo">
            Matheus <em>&</em> [Nome dela]
          </h1>
          <p className="hero__subtitulo">
            A gente está montando a nossa casa nova e queria muito ter você com a gente
            nesse dia. Confirme presença e, se quiser, nos ajude com um presentinho.
          </p>

          <div className="hero__detalhes">
            <span className="hero__detalhe">📅 [Dia da semana], [data]</span>
            <span className="hero__detalhe">🕒 [horário]</span>
            <span className="hero__detalhe">📍 [local / endereço]</span>
          </div>

          <div className="hero__cta">
            <a href="#confirmar" className="botao botao--latao">
              Confirmar presença
            </a>
            <a href="#presentes" className="botao botao--contorno">
              Ver lista de presentes
            </a>
          </div>
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section className="secao-clara">
        <div className="container">
          <span className="secao__eyebrow">Como funciona</span>
          <h2 className="secao__titulo">Presentear é simples</h2>

          <div className="passos">
            <div className="passo">
              <div className="passo__numero">1</div>
              <p className="passo__titulo">Escolha um presente</p>
              <p className="passo__texto">
                Separamos uma listinha do que vai nos ajudar a montar a casa nova.
              </p>
            </div>
            <div className="passo">
              <div className="passo__numero">2</div>
              <p className="passo__titulo">Pague com Pix ou cartão</p>
              <p className="passo__texto">
                O pagamento é feito direto pelo Mercado Pago, de forma segura.
              </p>
            </div>
            <div className="passo">
              <div className="passo__numero">3</div>
              <p className="passo__titulo">Pronto!</p>
              <p className="passo__texto">
                O presente sai da lista na hora, pra ninguém repetir sem querer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== RSVP ===== */}
      <section className="hero" id="confirmar" style={{ padding: "88px 24px" }}>
        <div className="container">
          <span className="hero__etiqueta">RSVP</span>
          <h2 className="hero__titulo" style={{ fontSize: "clamp(30px, 5vw, 44px)", marginTop: 20 }}>
            Você vem?
          </h2>
          <p className="hero__subtitulo">Confirma até [data limite] pra gente se organizar direitinho.</p>
          <RsvpForm />
        </div>
      </section>

      {/* ===== PRESENTES ===== */}
      <section className="secao-clara" id="presentes">
        <div className="container">
          <span className="secao__eyebrow">Lista de presentes</span>
          <h2 className="secao__titulo">Uma ajudinha pra casa nova</h2>
          <p className="secao__texto">
            Nada de presente repetido: quando alguém presenteia, o item sai da lista na hora.
          </p>
          <GiftList />
        </div>
      </section>

      <footer className="footer">Feito com carinho por Matheus &amp; [Nome dela] 💛</footer>
    </main>
  );
}
