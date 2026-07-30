import "./globals.css";

export const metadata = {
  title: "Chá de Panela — Matheus & [Nome dela]",
  description: "Confirme sua presença e nos ajude a montar a nossa casa nova.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
