const principes = [
  {
    titre: "Des faits, pas des jugements",
    texte:
      "Chaque information est sourcée : fait, date, et lien vers le scrutin officiel. Aucun adjectif, aucune note de moralité. Le citoyen tire ses propres conclusions.",
  },
  {
    titre: "Symétrie totale",
    texte:
      "Tous les groupes politiques, la même grille. Un observatoire n'est utile que s'il est impartial.",
  },
  {
    titre: "Méthodologie ouverte",
    texte:
      "Le code et la méthode de calcul sont publics et critiquables. Un droit de réponse permet de signaler toute erreur.",
  },
];

import Link from "next/link";
import { getGlobalCounts } from "../lib/queries";
import { DataNotice } from "./_components/data-notice";

export const dynamic = "force-dynamic";

const chantiers = [
  { label: "Annuaire + activité de vote des député·es", etat: "En ligne", href: "/deputes" },
  { label: "Explorateur de scrutins (votes par groupe)", etat: "En ligne", href: "/scrutins" },
  { label: "Indice de cohérence factuel par thème", etat: "À venir", href: null },
];

export default async function Home() {
  const counts = await getGlobalCounts().catch(() => null);
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-16 px-6 py-20">
      <header className="flex flex-col gap-6">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted">
          <span className="size-2 rounded-full bg-accent" aria-hidden />
          Projet en amorçage · open source · open data
        </span>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Open Hémicycle
        </h1>
        <p className="text-balance text-xl text-muted">
          Voir ce que votre député·e <strong className="text-foreground">fait vraiment</strong>,
          pas ce qu'il·elle dit.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-muted">
          Un observatoire citoyen, ouvert et symétrique, de l'activité parlementaire
          française. Il agrège les données publiques de l'Assemblée nationale pour rendre
          lisible, en quelques secondes, le travail réel des élu·es : leurs votes, leur
          activité, et la cohérence entre leurs positions affichées et leurs actes.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/deputes"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Explorer les député·es
          </Link>
          <Link
            href="/scrutins"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
          >
            Explorer les scrutins
          </Link>
          <a
            href="https://github.com/kecyf/open-hemicycle"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
          >
            Voir le code sur GitHub
          </a>
        </div>

        {counts && (
          <dl className="mt-2 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div className="flex items-baseline gap-2">
              <dt className="text-muted">Député·es</dt>
              <dd className="font-semibold tabular-nums">{counts.deputes.toLocaleString("fr-FR")}</dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="text-muted">Scrutins</dt>
              <dd className="font-semibold tabular-nums">{counts.scrutins.toLocaleString("fr-FR")}</dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="text-muted">Votes nominatifs</dt>
              <dd className="font-semibold tabular-nums">{counts.votes.toLocaleString("fr-FR")}</dd>
            </div>
          </dl>
        )}
      </header>

      <DataNotice />

      <section className="flex flex-col gap-6" aria-labelledby="principes-titre">
        <h2 id="principes-titre" className="text-sm font-semibold uppercase tracking-wider text-muted">
          Nos principes
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {principes.map((p) => (
            <li key={p.titre} className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-2 text-base font-medium">{p.titre}</h3>
              <p className="text-sm leading-relaxed text-muted">{p.texte}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-6" aria-labelledby="chantiers-titre">
        <h2 id="chantiers-titre" className="text-sm font-semibold uppercase tracking-wider text-muted">
          Ce qui arrive
        </h2>
        <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {chantiers.map((c) => {
            const live = c.etat === "En ligne";
            return (
              <li key={c.label} className="flex items-center justify-between gap-4 px-5 py-4">
                {live && c.href ? (
                  <Link href={c.href} className="text-sm hover:text-accent">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-sm">{c.label}</span>
                )}
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs ${
                    live ? "border-accent/40 bg-accent/10 text-accent" : "border-border text-muted"
                  }`}
                >
                  {c.etat}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section
        className="rounded-xl border border-border bg-card p-5 text-sm leading-relaxed text-muted"
        aria-label="Note importante sur les données"
      >
        <strong className="text-foreground">Une précision honnête.</strong> L'Assemblée
        nationale ne tient aucun relevé officiel de présence physique en séance. Ce que nous
        affichons est une <em>activité parlementaire détectée</em> (votes, amendements,
        questions, interventions, commissions) — jamais une « présence » au sens strict.
      </section>
    </main>
  );
}
