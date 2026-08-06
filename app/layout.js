import "./globals.css";

export const metadata = {
  title: "Chá Bar - Grazi e Matheus",
  description: "Confirme sua presença e nos ajude a montar a nossa casa nova.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
