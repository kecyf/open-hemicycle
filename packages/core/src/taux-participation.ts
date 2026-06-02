/**
 * Trois taux de participation aux votes (docs/METHODOLOGY.md §3).
 *
 * Périmètres : solennels, commission du·de la député·e, tous les scrutins publics.
 * Formule : votes exprimés / scrutins du périmètre (positions nominatives enregistrées).
 *
 * Règle d'or : un non-vote n'est jamais assimilé à une opposition — on affiche
 * toujours le décompte pour / contre / abstention / non-votant et les trois taux
 * ensemble, jamais un seul isolé.
 */

import {
  type Decompte,
  totalPositions,
  votesExprimes,
} from "./participation.ts";

/** Libellé AN exact des scrutins solennels (17ᵉ lég.). */
export const TYPE_SCRUTIN_SOLENNEL = "scrutin public solennel";

export type PerimetreParticipation = "solennel" | "commission" | "tous";

export type PositionVote = "pour" | "contre" | "abstention" | "non-votant";

/** Une position nominative enregistrée pour un scrutin. */
export interface EnregistrementVote {
  typeScrutin: string | null;
  /** UID AN de la commission liée au scrutin (PO*), si connu. */
  commissionUidAn?: string | null;
  position: PositionVote;
}

export interface TauxParticipationPérimètre {
  perimetre: PerimetreParticipation;
  label: string;
  /** Nombre de scrutins du périmètre avec position nominative enregistrée. */
  nbScrutins: number;
  decompte: Decompte;
  /** Votes exprimés / nbScrutins ; `null` si périmètre vide. */
  taux: number | null;
}

export interface TauxParticipationTriple {
  solennel: TauxParticipationPérimètre;
  commission: TauxParticipationPérimètre;
  tous: TauxParticipationPérimètre;
}

const LABELS: Record<PerimetreParticipation, string> = {
  solennel: "Scrutins solennels",
  commission: "Scrutins liés à la commission",
  tous: "Tous les scrutins publics",
};

export function isScrutinSolennel(typeScrutin: string | null): boolean {
  return typeScrutin === TYPE_SCRUTIN_SOLENNEL;
}

/** Scrutin rattaché à une commission dont le·la député·e est membre. */
export function isScrutinCommission(
  commissionUidAn: string | null | undefined,
  commissionsDuDepute: readonly string[],
): boolean {
  if (!commissionUidAn || commissionsDuDepute.length === 0) return false;
  return commissionsDuDepute.includes(commissionUidAn);
}

function positionVersDecompte(position: PositionVote): Decompte {
  return {
    pour: position === "pour" ? 1 : 0,
    contre: position === "contre" ? 1 : 0,
    abstention: position === "abstention" ? 1 : 0,
    nonVotant: position === "non-votant" ? 1 : 0,
  };
}

function fusionnerDecomptes(a: Decompte, b: Decompte): Decompte {
  return {
    pour: a.pour + b.pour,
    contre: a.contre + b.contre,
    abstention: a.abstention + b.abstention,
    nonVotant: a.nonVotant + b.nonVotant,
  };
}

function decompteVide(): Decompte {
  return { pour: 0, contre: 0, abstention: 0, nonVotant: 0 };
}

function filtrerParPerimetre(
  enregistrements: readonly EnregistrementVote[],
  perimetre: PerimetreParticipation,
  commissionsDuDepute: readonly string[],
): EnregistrementVote[] {
  switch (perimetre) {
    case "solennel":
      return enregistrements.filter((e) => isScrutinSolennel(e.typeScrutin));
    case "commission":
      return enregistrements.filter((e) =>
        isScrutinCommission(e.commissionUidAn, commissionsDuDepute),
      );
    case "tous":
      return [...enregistrements];
  }
}

/**
 * Calcule les trois taux de participation pour un·e député·e.
 *
 * @param commissionsDuDepute — UID AN (PO*) des commissions ; vide tant que l'ETL
 *   n'ingère pas les mandats commission (le taux « commission » restera à 0).
 */
export function computeTauxParticipationTriple(
  enregistrements: readonly EnregistrementVote[],
  commissionsDuDepute: readonly string[] = [],
): TauxParticipationTriple {
  const perimetres: PerimetreParticipation[] = ["solennel", "commission", "tous"];
  const result = {} as TauxParticipationTriple;

  for (const perimetre of perimetres) {
    const subset = filtrerParPerimetre(enregistrements, perimetre, commissionsDuDepute);
    let decompte = decompteVide();
    for (const e of subset) {
      decompte = fusionnerDecomptes(decompte, positionVersDecompte(e.position));
    }
    const nbScrutins = subset.length;
    const exprimes = votesExprimes(decompte);
    result[perimetre] = {
      perimetre,
      label: LABELS[perimetre],
      nbScrutins,
      decompte,
      taux: nbScrutins > 0 ? exprimes / nbScrutins : null,
    };
  }

  return result;
}

/** Agrège un décompte à partir d'enregistrements (utilitaire ETL / requêtes). */
export function decompteDepuisEnregistrements(
  enregistrements: readonly EnregistrementVote[],
): Decompte {
  return enregistrements.reduce(
    (acc, e) => fusionnerDecomptes(acc, positionVersDecompte(e.position)),
    decompteVide(),
  );
}

/** Vérifie la cohérence interne d'un taux (exprimés ≤ scrutins). */
export function tauxParticipationCoherent(t: TauxParticipationPérimètre): boolean {
  const exprimes = votesExprimes(t.decompte);
  const total = totalPositions(t.decompte);
  return t.nbScrutins === total && exprimes <= t.nbScrutins;
}
