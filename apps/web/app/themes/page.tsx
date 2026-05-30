import Link from "next/link";
import { listThemes } from "../../lib/queries";
import { DataNotice } from "../_components/data-notice";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Thèmes — Open Hémicycle",
  description:
    "Explorez les scrutins regroupés par thème (classification éditoriale, manuelle et auditable).",
};

export default async function ThemesPage() {
  const themes = await listThemes();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-4">
        <Link href="/" className="w-fit text-sm text-muted hover:text-foreground">
          ← Open Hémicycle
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Thèmes</h1>
        <p className="max-w-2xl text-base text-muted">
          Regroupement des scrutins par grand sujet, pour suivre un texte de bout en bout.
          La classification est <strong className="text-foreground">manuelle, conservatrice
          et auditable</strong>, faite au niveau du dossier législatif — voir la{" "}
          <Link href="/methodologie" className="text-accent hover:underline">
            méthodologie
          </Link>
          . Phase pilote : la liste s'étoffera progressivement.
        </p>
      </header>

      <DataNotice />

      <ul className="flex flex-col gap-3">
        {themes.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/scrutins?theme=${t.slug}`}
              className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-border/30"
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-lg font-semibold">{t.nom}</span>
                <span className="shrink-0 text-sm text-muted tabular-nums">
                  {t.nbScrutins.toLocaleString("fr-FR")} scrutin{t.nbScrutins > 1 ? "s" : ""}
                </span>
              </span>
              {t.description && (
                <span className="text-sm text-muted">{t.description}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      {themes.length === 0 && (
        <p className="text-sm text-muted">Aucun thème pour l'instant.</p>
      )}
    </main>
  );
}
