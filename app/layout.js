import "./globals.css";

export const metadata = {
  title: "Edivano – Familienurlaub. Clever geplant.",
  description: "KI-gestützte Familienreiseplanung, passend zu Kindern, Budget und Alltag."
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
