import { notFound } from "next/navigation";
import { getActiviteJournaliere, getDeputeBySlug, getVoteStats } from "../../../lib/queries";
import { ActivityDisclaimer, DataNotice } from "../../_components/data-notice";
import { ActivityHeatmap } from "../../_components/activity-heatmap";
import { SiteFooter, SiteHeader } from "../../_components/site-chrome";

export const dynamic = "force-dynamic";

function groupColor(hex: string | null): string {
  return hex && /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#8b93a7";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = await getDeputeBySlug(slug);
  if (!d) return { title: "Député·e introuvable — Open Hémicycle" };
  return {
    title: `${d.prenom} ${d.nom} — Open Hémicycle`,
    description: `Activité de vote de ${d.prenom} ${d.nom} (${d.groupeSigle ?? "sans groupe"}), 17ᵉ législature.`,
  };
}

const POSITIONS = [
  { key: "pour", label: "Pour", color: "#4ade80" },
  { key: "contre", label: "Contre", color: "#f87171" },
  { key: "abstention", label: "Abstention", color: "#fbbf24" },
  { key: "nonVotant", label: "Non-votant", color: "#64748b" },
] as const;

export default async function DeputePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const depute = await getDeputeBySlug(slug);
  if (!depute) notFound();

  const [stats, activite] = await Promise.all([
    getVoteStats(depute.id),
    getActiviteJournaliere(depute.id),
  ]);
  const color = groupColor(depute.couleurHex);
  const segments = [
    { ...POSITIONS[0], value: stats.pour },
    { ...POSITIONS[1], value: stats.contre },
    { ...POSITIONS[2], value: stats.abstention },
    { ...POSITIONS[3], value: stats.nonVotant },
  ];

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-10 px-6 py-16">
      <SiteHeader backHref="/deputes" backLabel="Annuaire" />

      <header className="flex flex-col gap-3">
        <span className="flex items-center gap-2 text-sm text-muted">
          <span
            className="size-3 rounded-full"
            style={{ backgroundColor: color }}
            aria-hidden
          />
          {depute.groupeNom ?? "Sans groupe"}
          {depute.groupeSigle ? ` (${depute.groupeSigle})` : ""}
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {depute.prenom} {depute.nom}
        </h1>
        <p className="text-sm text-muted">
          {[depute.departement, depute.circonscription && `circonscription ${depute.circonscription}`]
            .filter(Boolean)
            .join(" · ") || "17ᵉ législature"}
        </p>
        {depute.urlAn && (
          <a
            href={depute.urlAn}
            className="w-fit text-sm text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Fiche officielle sur assemblee-nationale.fr ↗
          </a>
        )}
      </header>

      <section className="flex flex-col gap-4" aria-labelledby="activite-titre">
        <h2 id="activite-titre" className="text-sm font-semibold uppercase tracking-wider text-muted">
          Activité détectée (votes)
        </h2>
        {activite.length === 0 ? (
          <p className="text-sm text-muted">Aucune activité de vote enregistrée sur la période.</p>
        ) : (
          <ActivityHeatmap data={activite} />
        )}
        <p className="text-xs leading-relaxed text-muted">
          Chaque case = un jour ; l'intensité reflète le nombre de votes exprimés, sur une
          échelle commune à tou·te·s les député·es (quantiles de population). En v1, seuls les
          votes sont comptés — amendements, questions et interventions viendront enrichir le score.
        </p>
      </section>

      <section className="flex flex-col gap-5" aria-labelledby="votes-titre">
        <div className="flex items-baseline justify-between">
          <h2 id="votes-titre" className="text-sm font-semibold uppercase tracking-wider text-muted">
            Positions de vote enregistrées
          </h2>
          <span className="text-sm text-muted">{stats.total.toLocaleString("fr-FR")} scrutins</span>
        </div>

        {stats.total === 0 ? (
          <p className="text-sm text-muted">
            Aucune position de vote enregistrée à ce jour pour ce·tte député·e dans nos données.
          </p>
        ) : (
          <>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-border" role="img" aria-label="Répartition des positions de vote">
              {segments.map((s) =>
                s.value > 0 ? (
                  <span
                    key={s.key}
                    style={{
                      width: `${(s.value / stats.total) * 100}%`,
                      backgroundColor: s.color,
                    }}
                    title={`${s.label} : ${s.value}`}
                  />
                ) : null,
              )}
            </div>

            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {segments.map((s) => (
                <li key={s.key} className="rounded-xl border border-border bg-card p-4">
                  <span className="flex items-center gap-2 text-xs text-muted">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} aria-hidden />
                    {s.label}
                  </span>
                  <span className="mt-1 block text-2xl font-semibold tabular-nums">
                    {s.value.toLocaleString("fr-FR")}
                  </span>
                  <span className="text-xs text-muted">
                    {((s.value / stats.total) * 100).toFixed(1)} %
                  </span>
                </li>
              ))}
            </ul>

            <div className="rounded-xl border border-border bg-card p-4 text-sm">
              <span className="text-muted">Votes exprimés (pour + contre + abstention) : </span>
              <strong className="tabular-nums">
                {stats.tauxExpression != null ? `${(stats.tauxExpression * 100).toFixed(1)} %` : "—"}
              </strong>
              <span className="text-muted">
                {" "}des {stats.total.toLocaleString("fr-FR")} positions enregistrées.
              </span>
            </div>
          </>
        )}

        <ActivityDisclaimer />
      </section>

      <DataNotice />

      <SiteFooter />
    </main>
  );
}
