import Link from "next/link";
import { notFound } from "next/navigation";
import { GroupeVentilationBar } from "../../_components/groupe-ventilation-bar";
import { DataNotice } from "../../_components/data-notice";
import { getThemeAtlas } from "../../../lib/queries";
import { capitalize, dateFr, sortBadge, typeLabel } from "../../../lib/scrutin-format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const atlas = await getThemeAtlas(slug);
  if (!atlas) return { title: "Thème introuvable — Open Hémicycle" };
  return {
    title: `${atlas.theme.nom} — Atlas thématique — Open Hémicycle`,
    description:
      atlas.theme.description ??
      `Positionnements par groupe politique sur le thème « ${atlas.theme.nom} » (scrutins sourcés, Assemblée nationale).`,
  };
}

export default async function ThemeAtlasPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const atlas = await getThemeAtlas(slug);
  if (!atlas) notFound();

  const { theme, groupes, scrutinsRecents, totalScrutins } = atlas;
  const groupesAvecVotes = groupes.filter((g) => g.total > 0);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-4">
        <Link href="/themes" className="w-fit text-sm text-muted hover:text-foreground">
          ← Thèmes
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{theme.nom}</h1>
        {theme.description && (
          <p className="max-w-2xl text-base text-muted">{theme.description}</p>
        )}
        <p className="text-sm text-muted">
          <span className="font-medium text-foreground">
            {totalScrutins.toLocaleString("fr-FR")} scrutin{totalScrutins > 1 ? "s" : ""}
          </span>{" "}
          rattaché{totalScrutins > 1 ? "s" : ""} à ce thème via les dossiers législatifs
          officiels. Données : votes nominatifs publiés par l&apos;Assemblée nationale (17ᵉ
          législature).
        </p>
        <Link
          href={`/scrutins?theme=${theme.slug}`}
          className="w-fit text-sm text-accent hover:underline"
        >
          Voir tous les scrutins de ce thème →
        </Link>
      </header>

      <section className="flex flex-col gap-5" aria-labelledby="positionnements-titre">
        <div className="flex flex-col gap-2">
          <h2
            id="positionnements-titre"
            className="text-sm font-semibold uppercase tracking-wider text-muted"
          >
            Positionnements par groupe
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            Ventilation agrégée des votes nominatifs publiés, rattachés au groupe{" "}
            <em>actuel</em> de chaque député·e. Chaque groupe est traité de la même façon
            (symétrie). Ce n&apos;est pas un jugement de loyauté ou de moralité — uniquement
            des faits sourcés. Voir la{" "}
            <Link href="/methodologie" className="text-accent hover:underline">
              méthodologie
            </Link>
            .
          </p>
        </div>

        {groupesAvecVotes.length === 0 ? (
          <p className="text-sm text-muted">
            Aucun vote nominatif n&apos;a été enregistré pour les scrutins de ce thème dans nos
            données.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {groupes.map((g) => (
              <li key={g.groupeId ?? g.sigle ?? "x"} className="flex flex-col gap-2">
                <GroupeVentilationBar g={g} />
                <p className="px-1 text-xs leading-relaxed text-muted">{g.phrase}</p>
              </li>
            ))}
          </ul>
        )}

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs leading-relaxed text-muted">
          <p>
            <strong className="text-amber-300">Lecture.</strong> La ventilation utilise
            l&apos;affiliation de groupe <em>courante</em> (et non celle à la date de chaque
            scrutin). Pour les scrutins ordinaires, l&apos;Assemblée ne liste nominativement que
            les votant·es exprimé·es et quelques non-votant·es : l&apos;absence d&apos;un nom{" "}
            <strong className="text-foreground">n&apos;est pas</strong> un relevé d&apos;absence
            physique. La « position majoritaire » d&apos;un groupe sur un scrutin est la modalité
            la plus fréquente parmi ses votes exprimés ; en cas d&apos;égalité, le scrutin est
            exclu de ce décompte (prudence).
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="scrutins-titre">
        <h2
          id="scrutins-titre"
          className="text-sm font-semibold uppercase tracking-wider text-muted"
        >
          Scrutins récents
        </h2>
        {scrutinsRecents.length === 0 ? (
          <p className="text-sm text-muted">Aucun scrutin rattaché.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {scrutinsRecents.map((s) => {
              const badge = sortBadge(s.sort);
              return (
                <li key={s.uidAn}>
                  <Link
                    href={`/scrutins/${s.uidAn}`}
                    className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-border/30"
                  >
                    <span className="flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span className="rounded-full border border-border px-2 py-0.5">
                        {typeLabel(s.typeScrutin)}
                      </span>
                      <span>Scrutin n°{s.numero}</span>
                      <span>{dateFr(s.dateScrutin)}</span>
                      {badge && (
                        <span
                          className={`rounded-full border px-2 py-0.5 font-medium ${badge.classes}`}
                        >
                          {badge.label}
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-medium leading-snug">
                      {capitalize(s.objet)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {totalScrutins > scrutinsRecents.length && (
          <Link
            href={`/scrutins?theme=${theme.slug}`}
            className="w-fit text-sm text-accent hover:underline"
          >
            Voir les {totalScrutins.toLocaleString("fr-FR")} scrutins →
          </Link>
        )}
      </section>

      <DataNotice />
    </main>
  );
}
