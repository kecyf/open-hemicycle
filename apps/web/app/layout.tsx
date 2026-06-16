import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "./_components/site-footer";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Open Hémicycle — l'activité parlementaire, lisible par tous",
  description:
    "Observatoire citoyen, ouvert et symétrique, de l'activité parlementaire française : votes, activité et cohérence des député·es, en open data.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={cn("dark font-sans", geist.variable)}>
      <body>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
