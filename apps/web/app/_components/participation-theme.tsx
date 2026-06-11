import type { ComparaisonParticipationTheme, ThemeRevendiqueClaim } from "@open-hemicycle/core";
import Link from "next/link";

function formatTaux(taux: number | null): string {
  if (taux == null) return "—";
  return `${(taux * 100).toFixed(1)} %`;
}

function formatEcart(ecart: number | null): string {
  if (ecart == null) return "—";
  const pts = ecart * 100;
  const sign = pts > 0 ? "+" : "";
  return `${sign}${pts.toFixed(1)} pt`;
}

export interface ParticipationThemeProps {
  comparaison: ComparaisonParticipationTheme;
  themeNom: string;
  /** Revendication sourcée (obligatoire pour l'affichage nominatif). */
  revendication: ThemeRevendiqueClaim;
}

/**
 * Compare la participation sur un thème revendiqué au taux global (METHODOLOGY §4.c).
 *
 * Composant préparé pour la fiche député·e — publication nominative soumise à
 * relecture humaine (cf. docs/legal-guardrails.md §7).
 */
export function ParticipationTheme({
  comparaison,
  themeNom,
  revendication,
}: ParticipationThemeProps) {
  return (
    <section className="space-y-3" aria-labelledby="participation-theme-heading">
      <div>
        <h2 id="participation-theme-heading" className="text-lg font-semibold">
          Participation sur un thème revendiqué
        </h2>
        <p className="mt-1 text-sm text-muted">
          Comparaison du taux de participation aux scrutins du thème « {themeNom} » avec le
          taux global du·de la député·e — positions nominatives enregistrées à la source, pas une
          mesure de présence physique. Ce n&apos;est pas un jugement moral ; un écart négatif est un
          fait statistique sourcé.
        </p>
      </div>

      <article className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted">Thème « {themeNom} »</p>
            <p className="text-xl font-semibold tabular-nums">
              {formatTaux(comparaison.tauxParticipationTheme)}
            </p>
            <p className="text-xs text-muted">
              {comparaison.nbScrutinsTheme.toLocaleString("fr-FR")} scrutin
              {comparaison.nbScrutinsTheme > 1 ? "s" : ""}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Tous les scrutins</p>
            <p className="text-xl font-semibold tabular-nums">
              {formatTaux(comparaison.tauxParticipationGlobal)}
            </p>
            <p className="text-xs text-muted">
              {comparaison.nbScrutinsGlobal.toLocaleString("fr-FR")} scrutin
              {comparaison.nbScrutinsGlobal > 1 ? "s" : ""}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Écart (thème − global)</p>
            <p className="text-xl font-semibold tabular-nums">
              {formatEcart(comparaison.ecartParticipation)}
            </p>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-muted border-t border-border pt-3">
          Revendication sourcée ({revendication.sourceDate}) : {revendication.libelle}{" "}
          <a
            href={revendication.sourceUrl}
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            source
          </a>
          .
        </p>
      </article>

      <p className="text-xs leading-relaxed text-muted">
        Un non-vote n&apos;est jamais assimilé à une opposition — voir le décompte pour / contre /
        abstention / non-votant dans la{" "}
        <Link href="/methodologie" className="text-accent hover:underline">
          méthodologie
        </Link>
        .
      </p>
    </section>
  );
}
