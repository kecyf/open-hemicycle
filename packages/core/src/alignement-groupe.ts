/**
 * Cohérence avec la ligne de groupe (docs/METHODOLOGY.md §4.a).
 *
 * Mesure factuelle : part des votes exprimés d'un·e député·e qui correspondent
 * à la position majoritaire de son groupe sur le même scrutin.
 *
 * Ce n'est pas un jugement de loyauté ou de moralité — un taux d'alignement
 * élevé ou bas est un fait statistique, affichable avec contexte et sources.
 */

import type { Decompte, PositionVote } from "./participation.ts";
import { votesExprimes } from "./participation.ts";

export type { PositionVote };

/** Ventilation nominative d'un groupe sur un scrutin. */
export interface VentilationGroupe {
  pour: number;
  contre: number;
  abstention: number;
  nonVotant: number;
}

/** Vote exprimé d'un·e député·e sur un scrutin du périmètre (ex. un thème). */
export interface VoteDeputeScrutin {
  position: PositionVote;
  ventilationGroupe: VentilationGroupe;
}

export interface TauxAlignementGroupe {
  /** Votes exprimés pris en compte (hors non-votant député·e). */
  nbVotesExprimes: number;
  /** Votes alignés sur la position majoritaire du groupe. */
  nbAlignes: number;
  /** nbAlignes / nbVotesExprimes ; `null` si aucun vote exprimé. */
  taux: number | null;
  /** Scrutins exclus (égalité au sein du groupe, pas de majorité claire). */
  nbScrutinsSansMajorite: number;
}

const POSITIONS_EXPRIMEES: PositionVote[] = ["pour", "contre", "abstention"];

function decompteGroupeExprime(v: VentilationGroupe): Decompte {
  return {
    pour: v.pour,
    contre: v.contre,
    abstention: v.abstention,
    nonVotant: 0,
  };
}

/**
 * Position majoritaire du groupe = modalité la plus fréquente parmi les votes
 * exprimés nominatifs du groupe. En cas d'égalité stricte → `null` (prudence).
 */
export function positionMajoritaireGroupe(
  ventilation: VentilationGroupe,
): PositionVote | null {
  const counts: { position: PositionVote; n: number }[] = [
    { position: "pour", n: ventilation.pour },
    { position: "contre", n: ventilation.contre },
    { position: "abstention", n: ventilation.abstention },
  ];
  const exprimes = votesExprimes(decompteGroupeExprime(ventilation));
  if (exprimes === 0) return null;

  const max = Math.max(...counts.map((c) => c.n));
  const leaders = counts.filter((c) => c.n === max && c.n > 0);
  if (leaders.length !== 1) return null;
  return leaders[0]!.position;
}

/** `true` si le vote exprimé du·de la député·e suit la majorité du groupe. */
export function voteAligneSurGroupe(
  positionDepute: PositionVote,
  ventilationGroupe: VentilationGroupe,
): boolean | null {
  if (!POSITIONS_EXPRIMEES.includes(positionDepute)) return null;
  const majorite = positionMajoritaireGroupe(ventilationGroupe);
  if (majorite == null) return null;
  return positionDepute === majorite;
}

/**
 * Taux d'alignement sur un ensemble de scrutins (typiquement un thème).
 *
 * Seuls les scrutins où le·la député·e a une position exprimée comptent.
 * Les scrutins sans majorité claire au sein du groupe sont exclus du dénominateur.
 */
export function computeTauxAlignementGroupe(
  votes: readonly VoteDeputeScrutin[],
): TauxAlignementGroupe {
  let nbVotesExprimes = 0;
  let nbAlignes = 0;
  let nbScrutinsSansMajorite = 0;

  for (const v of votes) {
    if (!POSITIONS_EXPRIMEES.includes(v.position)) continue;
    const aligne = voteAligneSurGroupe(v.position, v.ventilationGroupe);
    if (aligne == null) {
      nbScrutinsSansMajorite += 1;
      continue;
    }
    nbVotesExprimes += 1;
    if (aligne) nbAlignes += 1;
  }

  return {
    nbVotesExprimes,
    nbAlignes,
    taux: nbVotesExprimes > 0 ? nbAlignes / nbVotesExprimes : null,
    nbScrutinsSansMajorite,
  };
}
