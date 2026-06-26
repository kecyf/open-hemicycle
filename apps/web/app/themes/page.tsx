import Link from "next/link";
import { listThemes } from "../../lib/queries";
import { DataNotice } from "../_components/data-notice";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Thèmes — Open Hémicycle",
  description:
    "Explorez les scrutins regroupés par thème (8 commissions AN, classification auditable et symétrique).",
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
          Regroupement des scrutins par grand sujet (8 commissions permanentes de l&apos;Assemblée
          nationale). Pour chaque thème, l&apos;atlas affiche le positionnement agrégé de chaque
          groupe politique (votes nominatifs sourcés, symétrie entre groupes). Rattachement
          dossier prioritaire ; classification assistée pour les scrutins sans dossier — voir la{" "}
          <Link href="/methodologie" className="text-accent hover:underline">
            méthodologie
          </Link>
          .
        </p>
      </header>

      <DataNotice />

      <ul className="flex flex-col gap-3">
        {themes.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/themes/${t.slug}`}
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
