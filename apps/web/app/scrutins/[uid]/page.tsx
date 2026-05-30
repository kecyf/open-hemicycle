import Link from "next/link";
import { notFound } from "next/navigation";
import { getScrutinDetail, type GroupeVentilation } from "../../../lib/queries";
import { DataNotice } from "../../_components/data-notice";
import {
  POSITION_COLORS,
  capitalize,
  dateFr,
  groupColor,
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

const POSITIONS = [
  { key: "pour", label: "Pour", color: POSITION_COLORS.pour },
  { key: "contre", label: "Contre", color: POSITION_COLORS.contre },
  { key: "abstention", label: "Abstention", color: POSITION_COLORS.abstention },
  { key: "nonVotant", label: "Non-votant", color: POSITION_COLORS.nonVotant },
] as const;

export default async function ScrutinPage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = await params;
  const scrutin = await getScrutinDetail(uid);
  if (!scrutin) notFound();

  const urlOfficiel = urlScrutinOfficiel(scrutin.numero);
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
        </span>
        <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
          {capitalize(scrutin.objet)}
        </h1>
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
          Décompte tel que publié par l'Assemblée nationale. Le résultat officiel
          (adoption ou rejet) et les règles de majorité figurent sur la page source liée
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
              <GroupeRow key={g.groupeId ?? g.sigle ?? "x"} g={g} />
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

function GroupeRow({ g }: { g: GroupeVentilation }) {
  const color = groupColor(g.couleurHex);
  const segments = [
    { key: "pour", value: g.pour, color: POSITIONS[0].color },
    { key: "contre", value: g.contre, color: POSITIONS[1].color },
    { key: "abstention", value: g.abstention, color: POSITIONS[2].color },
    { key: "nonVotant", value: g.nonVotant, color: POSITIONS[3].color },
  ];
  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium">
          <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
          {g.sigle ?? g.nom ?? "Sans groupe"}
        </span>
        <span className="text-xs text-muted">
          {g.total} vote{g.total > 1 ? "s" : ""}
        </span>
      </div>
      <div
        className="flex h-2.5 w-full overflow-hidden rounded-full bg-border"
        role="img"
        aria-label={`${g.sigle ?? "groupe"} : ${g.pour} pour, ${g.contre} contre, ${g.abstention} abstention, ${g.nonVotant} non-votant`}
      >
        {segments.map((s) =>
          s.value > 0 ? (
            <span
              key={s.key}
              style={{ width: `${(s.value / g.total) * 100}%`, backgroundColor: s.color }}
              title={`${s.key} : ${s.value}`}
            />
          ) : null,
        )}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums text-muted">
        {segments.map((s) =>
          s.value > 0 ? (
            <li key={s.key} className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} aria-hidden />
              {POSITIONS.find((p) => p.key === s.key)?.label} {s.value}
            </li>
          ) : null,
        )}
      </ul>
    </li>
  );
}
