/**
 * Calculs de participation aux votes (docs/METHODOLOGY.md §3).
 *
 * Règle d'or : un non-vote n'est JAMAIS assimilé à une opposition. On distingue
 * toujours pour / contre / abstention / non-votant, et on ne publie pas un taux
 * isolé sans son périmètre.
 */

export interface Decompte {
  pour: number;
  contre: number;
  abstention: number;
  nonVotant: number;
}

/** Position nominative enregistrée par l'AN (libellés exacts). */
export type PositionVote = "pour" | "contre" | "abstention" | "non-votant";

/** Votes exprimés = pour + contre + abstention (le non-votant n'est pas exprimé). */
export function votesExprimes(d: Decompte): number {
  return d.pour + d.contre + d.abstention;
}

/** Total des positions enregistrées (exprimées + non-votant). */
export function totalPositions(d: Decompte): number {
  return votesExprimes(d) + d.nonVotant;
}

/**
 * Taux d'expression = exprimés / total enregistré, dans [0, 1].
 * `null` si aucune position enregistrée (évite de fabriquer un 0 trompeur).
 */
export function tauxExpression(d: Decompte): number | null {
  const total = totalPositions(d);
  return total > 0 ? votesExprimes(d) / total : null;
}
