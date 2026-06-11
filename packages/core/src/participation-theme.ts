/**
 * Cohérence participation / thème revendiqué (docs/METHODOLOGY.md §4.c).
 *
 * Compare le taux de participation aux scrutins d'un thème T au taux
 * de participation global du·de la député·e. Un écart négatif marqué
 * (présent en général, absent sur le thème) est un fait affichable,
 * sans qualificatif moral.
 */

import type { Decompte } from "./participation.ts";
import { votesExprimes } from "./participation.ts";
import type { EnregistrementVote } from "./taux-participation.ts";
import { decompteDepuisEnregistrements } from "./taux-participation.ts";

export interface ComparaisonParticipationTheme {
  /** Scrutins du thème avec position nominative enregistrée. */
  nbScrutinsTheme: number;
  decompteTheme: Decompte;
  /** Votes exprimés / nbScrutinsTheme ; `null` si périmètre thème vide. */
  tauxParticipationTheme: number | null;
  /** Tous les scrutins publics avec position nominative enregistrée. */
  nbScrutinsGlobal: number;
  decompteGlobal: Decompte;
  /** Votes exprimés / nbScrutinsGlobal ; `null` si aucun scrutin. */
  tauxParticipationGlobal: number | null;
  /** taux_theme − taux_global ; négatif = participation moindre sur le thème. */
  ecartParticipation: number | null;
}

function tauxParticipation(nbScrutins: number, decompte: Decompte): number | null {
  if (nbScrutins === 0) return null;
  return votesExprimes(decompte) / nbScrutins;
}

/**
 * Compare la participation sur un thème au taux global.
 *
 * Les deux tableaux contiennent une entrée par scrutin avec position
 * nominative enregistrée à la source (cf. METHODOLOGY §3).
 */
export function computeComparaisonParticipationTheme(
  enregistrementsTheme: readonly EnregistrementVote[],
  enregistrementsGlobal: readonly EnregistrementVote[],
): ComparaisonParticipationTheme {
  const nbScrutinsTheme = enregistrementsTheme.length;
  const decompteTheme = decompteDepuisEnregistrements(enregistrementsTheme);
  const tauxParticipationTheme = tauxParticipation(nbScrutinsTheme, decompteTheme);

  const nbScrutinsGlobal = enregistrementsGlobal.length;
  const decompteGlobal = decompteDepuisEnregistrements(enregistrementsGlobal);
  const tauxParticipationGlobal = tauxParticipation(nbScrutinsGlobal, decompteGlobal);

  let ecartParticipation: number | null = null;
  if (tauxParticipationTheme != null && tauxParticipationGlobal != null) {
    ecartParticipation = tauxParticipationTheme - tauxParticipationGlobal;
  }

  return {
    nbScrutinsTheme,
    decompteTheme,
    tauxParticipationTheme,
    nbScrutinsGlobal,
    decompteGlobal,
    tauxParticipationGlobal,
    ecartParticipation,
  };
}
