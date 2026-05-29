import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Open Hémicycle — l'activité parlementaire, lisible par tous",
  description:
    "Observatoire citoyen, ouvert et symétrique, de l'activité parlementaire française : votes, activité et cohérence des député·es, en open data.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
