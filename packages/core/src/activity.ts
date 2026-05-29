/**
 * Fonctions de calcul de l'« activité parlementaire détectée » (heatmap).
 *
 * Référence : docs/METHODOLOGY.md §2. Ce sont des fonctions PURES (aucune
 * dépendance base/réseau) afin d'être testables et réutilisées par l'ETL
 * (job d'agrégation) comme par le web.
 *
 * Rappel méthodo : ce n'est PAS une présence physique. En v1, seuls les votes
 * sont disponibles ; les autres composantes (amendements, questions, etc.)
 * restent à 0 tant que leurs sources ne sont pas ingérées.
 */

/** Poids des actes parlementaires dans le score journalier (v0, METHODOLOGY §2). */
export const POIDS_ACTIVITE = {
  vote: 1,
  amendement: 2,
  question: 1,
  intervention: 3,
  presenceCommission: 2,
} as const;

export interface ActiviteJour {
  nbVotes?: number;
  nbAmendements?: number;
  nbQuestions?: number;
  nbInterventions?: number;
  nbPresencesCommission?: number;
}

/** Score d'activité d'une journée (combinaison pondérée des actes détectés). */
export function scoreJour(a: ActiviteJour): number {
  return (
    POIDS_ACTIVITE.vote * (a.nbVotes ?? 0) +
    POIDS_ACTIVITE.amendement * (a.nbAmendements ?? 0) +
    POIDS_ACTIVITE.question * (a.nbQuestions ?? 0) +
    POIDS_ACTIVITE.intervention * (a.nbInterventions ?? 0) +
    POIDS_ACTIVITE.presenceCommission * (a.nbPresencesCommission ?? 0)
  );
}

/** Niveau de couleur de la heatmap (0 = aucune activité, 1–4 par intensité). */
export type Niveau = 0 | 1 | 2 | 3 | 4;

/** Trois bornes de quantiles (25 / 50 / 75 %) définissant les niveaux 1–4. */
export type SeuilsNiveaux = [number, number, number];

/** Quantile (interpolation linéaire) d'un tableau **trié croissant** non vide. */
function quantileTrie(sorted: number[], q: number): number {
  const n = sorted.length;
  if (n === 0) return 0;
  if (n === 1) return sorted[0] as number;
  const pos = (n - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const lo = sorted[base] as number;
  const hi = sorted[base + 1];
  return hi === undefined ? lo : lo + rest * (hi - lo);
}

/**
 * Calcule les seuils de niveaux à partir de la distribution **de la population**
 * (tous les scores journaliers > 0 de tous·tes les député·es). Cela rend les
 * couleurs comparables d'une fiche à l'autre, contrairement à une échelle
 * recalculée par individu.
 */
export function computeSeuilsNiveaux(populationScores: number[]): SeuilsNiveaux {
  const positifs = populationScores.filter((s) => s > 0).sort((a, b) => a - b);
  if (positifs.length === 0) return [1, 1, 1];
  return [
    quantileTrie(positifs, 0.25),
    quantileTrie(positifs, 0.5),
    quantileTrie(positifs, 0.75),
  ];
}

/** Niveau (0–4) d'un score donné, selon les seuils de population. */
export function niveauPourScore(score: number, seuils: SeuilsNiveaux): Niveau {
  if (score <= 0) return 0;
  const [t1, t2, t3] = seuils;
  if (score <= t1) return 1;
  if (score <= t2) return 2;
  if (score <= t3) return 3;
  return 4;
}
