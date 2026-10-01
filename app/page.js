import RsvpForm from "../components/RsvpForm";
import GiftList from "../components/GiftList";

export default function Home() {
  return (
    <main>
      {/* ===== HERO ===== */}
      {/* Edite os textos abaixo (nomes, data, local) com as informações reais do seu chá */}
      <section className="hero">
        <div className="container">
          <span className="hero__etiqueta">Chá Bar</span>
          <h1 className="hero__titulo">
            Grazi <em>&</em> Matheus
          </h1>
          <p className="hero__subtitulo">
          Estamos prestes a dar mais um passo muito importante na nossa história e não
          poderíamos viver esse momento sem as pessoas que fazem parte dela.
          Para comemorar a conquista do nosso primeiro apartamento, preparamos um <em>Chá Bar</em> e será uma alegria ter você com a gente nesse dia tão especial.
          </p>

          <div className="hero__detalhes">
            <span className="hero__detalhe">📅 Sábado, 07/11/2026</span>
            <span className="hero__detalhe">🕒 Começa às 15h00</span>
            <span className="hero__detalhe">📍 R. José Bonifácio Filho, 226 - Jardim Sao Benedito, São Paulo - SP, 04813-060, Brasil</span>
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
          <h2 className="secao__titulo">Um presente ajuda a construir nosso lar</h2>

          <div className="passos">
            <div className="passo">
              <div className="passo__numero">1</div>
              <p className="passo__titulo">Escolha como quer participar</p>
              <p className="passo__texto">
                Você pode presentear um item específico da nossa lista ou contribuir com alguma etapa da reforma.
              </p>
            </div>
            <div className="passo">
              <div className="passo__numero">2</div>
              <p className="passo__titulo">Contribua do seu jeito.</p>
              <p className="passo__texto">
                Alguns presentes possuem valor fixo. Já as etapas da reforma aceitam contribuições a partir de R$ 50 até atingir a meta. Podendo ser pago via PIX ou Cartão.
              </p>
            </div>
            <div className="passo">
              <div className="passo__numero">3</div>
              <p className="passo__titulo">Pronto!</p>
              <p className="passo__texto">
                O pagamento é realizado de forma segura pelo Mercado Pago e o progresso da lista é atualizado automaticamente
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
          <p className="hero__subtitulo">Confirma até 15/10/2026 pra gente se organizar direitinho.</p>
          <RsvpForm />
        </div>
      </section>

      {/* ===== PRESENTES ===== */}
      <section className="secao-clara" id="presentes">
        <div className="container">
          <span className="secao__eyebrow">Lista de presentes</span>
          <h2 className="secao__titulo">A sua presença é o nosso maior presente!</h2>
          <p className="secao__texto">
            Mas, se também quiser nos presentear, preparamos uma lista com contribuições para a reforma e alguns itens que ainda
            faltam para o nosso novo lar. Por isso, não faremos uma lista de presentes tradicionais. Assim, 
            não será necessário levar presente no dia do evento, pois toda a nossa lista foi pensada para reunir exatamente aquilo de que ainda precisamos.
          </p>
          <GiftList />
        </div>
      </section>

      <footer className="footer">Feito com carinho por Grazi &amp; Matheus 💛</footer>
    </main>
  );
}
