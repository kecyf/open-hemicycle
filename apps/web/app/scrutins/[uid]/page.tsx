import Link from "next/link";
import { notFound } from "next/navigation";
import { GroupeVentilationBar } from "../../_components/groupe-ventilation-bar";
import { getScrutinDetail } from "../../../lib/queries";
import { DataNotice } from "../../_components/data-notice";
import {
  POSITION_COLORS,
  capitalize,
  dateFr,
  sortBadge,
  typeLabel,
  urlScrutinOfficiel,
} from "../../../lib/scrutin-format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = await params;
  const s = await getScrutinDetail(uid);
  if (!s) return { title: "Scrutin introuvable — Open Hémicycle" };
  return {
    title: `Scrutin n°${s.numero} — Open Hémicycle`,
    description: capitalize(s.objet).slice(0, 160),
  };
}

export default async function ScrutinPage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = await params;
  const scrutin = await getScrutinDetail(uid);
  if (!scrutin) notFound();

  const urlOfficiel = urlScrutinOfficiel(scrutin.numero);
  const badge = sortBadge(scrutin.sort);
  const synthese = [
    { label: "Pour", value: scrutin.nbPour ?? 0, color: POSITION_COLORS.pour },
    { label: "Contre", value: scrutin.nbContre ?? 0, color: POSITION_COLORS.contre },
    { label: "Abstention", value: scrutin.nbAbstention ?? 0, color: POSITION_COLORS.abstention },
  ];

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-10 px-6 py-16">
      <Link href="/scrutins" className="w-fit text-sm text-muted hover:text-foreground">
        ← Scrutins
      </Link>

      <header className="flex flex-col gap-3">
        <span className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <span className="rounded-full border border-border px-2.5 py-0.5 text-xs">
            {typeLabel(scrutin.typeScrutin)}
          </span>
          <span>Scrutin n°{scrutin.numero}</span>
          <span>{dateFr(scrutin.dateScrutin)}</span>
          {badge && (
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.classes}`}>
              {badge.label}
            </span>
          )}
        </span>
        <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
          {capitalize(scrutin.objet)}
        </h1>
        {scrutin.themes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {scrutin.themes.map((t) => (
              <Link
                key={t.slug}
                href={`/themes/${t.slug}`}
                className="inline-flex items-center rounded-full border border-accent bg-accent/10 px-2.5 py-0.5 text-xs text-foreground transition-colors hover:bg-accent/20"
              >
                {t.nom}
              </Link>
            ))}
          </div>
        )}
        {scrutin.dossier && (
          <p className="text-sm text-muted">
            Dossier législatif :{" "}
            {scrutin.dossier.urlAn ? (
              <a
                href={scrutin.dossier.urlAn}
                className="text-accent hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {scrutin.dossier.titre} ↗
              </a>
            ) : (
              <span className="text-foreground">{scrutin.dossier.titre}</span>
            )}
            {scrutin.dossier.procedure ? ` · ${scrutin.dossier.procedure}` : ""}
          </p>
        )}
        {urlOfficiel && (
          <a
            href={urlOfficiel}
            className="w-fit text-sm text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Analyse officielle sur assemblee-nationale.fr ↗
          </a>
        )}
      </header>

      <section className="flex flex-col gap-4" aria-labelledby="synthese-titre">
        <h2 id="synthese-titre" className="text-sm font-semibold uppercase tracking-wider text-muted">
          Synthèse officielle du scrutin
        </h2>
        <ul className="grid grid-cols-3 gap-3">
          {synthese.map((s) => (
            <li key={s.label} className="rounded-xl border border-border bg-card p-4">
              <span className="flex items-center gap-2 text-xs text-muted">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} aria-hidden />
                {s.label}
              </span>
              <span className="mt-1 block text-2xl font-semibold tabular-nums">
                {s.value.toLocaleString("fr-FR")}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs leading-relaxed text-muted">
          Décompte et résultat ({scrutin.sort ?? "—"}) tels que publiés par l'Assemblée
          nationale. Les règles de majorité applicables figurent sur la page source liée
          ci-dessus.
        </p>
      </section>

      <section className="flex flex-col gap-5" aria-labelledby="groupes-titre">
        <div className="flex items-baseline justify-between">
          <h2 id="groupes-titre" className="text-sm font-semibold uppercase tracking-wider text-muted">
            Votes par groupe
          </h2>
          <span className="text-sm text-muted">
            {scrutin.totalNominatif.toLocaleString("fr-FR")} position
            {scrutin.totalNominatif > 1 ? "s" : ""} nominative
            {scrutin.totalNominatif > 1 ? "s" : ""}
          </span>
        </div>

        {scrutin.groupes.length === 0 ? (
          <p className="text-sm text-muted">
            Aucun vote nominatif n'a été enregistré pour ce scrutin dans nos données.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {scrutin.groupes.map((g) => (
              <li key={g.groupeId ?? g.sigle ?? "x"}>
                <GroupeVentilationBar g={g} />
              </li>
            ))}
          </ul>
        )}

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs leading-relaxed text-muted">
          <p>
            <strong className="text-amber-300">Lecture.</strong> La ventilation est calculée
            à partir des votes nominatifs publiés, rattachés au groupe{" "}
            <em>actuel</em> de chaque député·e (et non à celui de la date du scrutin —
            limite connue pour les rares changements de groupe). Pour les scrutins
            ordinaires, l'Assemblée ne liste nominativement que les votant·es exprimé·es et
            quelques non-votant·es : l'absence d'un nom <strong className="text-foreground">n'est
            pas</strong> un relevé d'absence physique.
          </p>
        </div>
      </section>

      <DataNotice />
    </main>
  );
}
