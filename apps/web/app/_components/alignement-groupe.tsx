import type { TauxAlignementGroupe } from "@open-hemicycle/core";
import Link from "next/link";

function formatTaux(taux: number | null): string {
  if (taux == null) return "—";
  return `${(taux * 100).toFixed(1)} %`;
}

export interface AlignementGroupeProps {
  taux: TauxAlignementGroupe;
  /** Libellé du périmètre (ex. thème pilote ou « tous les scrutins »). */
  perimetreLabel: string;
  groupeNom: string | null;
  groupeSigle: string | null;
}

/**
 * Affiche le taux d'alignement sur la ligne de groupe (METHODOLOGY §4.a).
 *
 * Composant préparé pour la fiche député·e — publication nominative soumise à
 * relecture humaine (cf. docs/legal-guardrails.md §7).
 */
export function AlignementGroupe({
  taux,
  perimetreLabel,
  groupeNom,
  groupeSigle,
}: AlignementGroupeProps) {
  const groupeLabel =
    groupeNom != null
      ? `${groupeNom}${groupeSigle ? ` (${groupeSigle})` : ""}`
      : "groupe parlementaire";

  return (
    <section className="space-y-3" aria-labelledby="alignement-heading">
      <div>
        <h2 id="alignement-heading" className="text-lg font-semibold">
          Alignement sur la ligne de groupe
        </h2>
        <p className="mt-1 text-sm text-muted">
          Part des votes <strong className="font-medium text-foreground">exprimés</strong> du·de
          la député·e qui correspondent à la position majoritaire de {groupeLabel} sur le même
          scrutin — périmètre : {perimetreLabel}. Ce n&apos;est pas un jugement de loyauté ni une
          note de moralité ; un taux élevé ou bas est un fait statistique sourcé.
        </p>
      </div>

      <article className="rounded-xl border border-border bg-card p-4">
        <p className="text-2xl font-semibold tabular-nums">{formatTaux(taux.taux)}</p>
        <p className="mt-1 text-xs text-muted">
          {taux.nbAlignes.toLocaleString("fr-FR")} vote
          {taux.nbAlignes > 1 ? "s" : ""} aligné{taux.nbAlignes > 1 ? "s" : ""} sur{" "}
          {taux.nbVotesExprimes.toLocaleString("fr-FR")} vote
          {taux.nbVotesExprimes > 1 ? "s" : ""} exprimé{taux.nbVotesExprimes > 1 ? "s" : ""}{" "}
          (positions nominatives enregistrées).
        </p>
        {taux.nbScrutinsSansMajorite > 0 ? (
          <p className="mt-2 text-xs text-muted">
            {taux.nbScrutinsSansMajorite.toLocaleString("fr-FR")} scrutin
            {taux.nbScrutinsSansMajorite > 1 ? "s" : ""} exclu
            {taux.nbScrutinsSansMajorite > 1 ? "s" : ""} : égalité au sein du groupe (pas de
            majorité claire).
          </p>
        ) : null}
      </article>

      <p className="text-xs leading-relaxed text-muted">
        La ventilation par groupe utilise l&apos;affiliation <strong className="font-medium">courante</strong>{" "}
        (pas celle à la date de chaque scrutin). Voir la{" "}
        <Link href="/methodologie" className="text-accent hover:underline">
          méthodologie
        </Link>{" "}
        pour le détail du calcul et les limites des données.
      </p>
    </section>
  );
}
