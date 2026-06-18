/**
 * Positionnement par groupe sur un thème (atlas — niveau groupe, non nominatif).
 *
 * Agrège les votes nominatifs publiés par l'AN sur l'ensemble des scrutins
 * rattachés à un thème. Voir docs/METHODOLOGY.md §5 (atlas thématique).
 */

import {
  positionMajoritaireGroupe,
  type VentilationGroupe,
} from "./alignement-groupe.ts";
import type { PositionVote } from "./participation.ts";

/** Ventilation agrégée d'un groupe sur tous les scrutins d'un thème. */
export interface VentilationGroupeTheme extends VentilationGroupe {
  total: number;
}

/** Comptes de position majoritaire du groupe, scrutin par scrutin. */
export interface ComptesMajoriteGroupeTheme {
  pour: number;
  contre: number;
  abstention: number;
  sansMajorite: number;
  /** Scrutins où le groupe a au moins une position nominative. */
  nbScrutinsAvecVotes: number;
}

/** Ventilation d'un groupe sur un seul scrutin (entrée intermédiaire). */
export interface VentilationGroupeScrutin {
  scrutinId: string;
  ventilation: VentilationGroupe;
}

/**
 * Compte, scrutin par scrutin, la position majoritaire du groupe parmi les
 * votes exprimés nominatifs (même règle que METHODOLOGY §4.a).
 */
export function computeComptesMajoriteGroupeTheme(
  parScrutin: readonly VentilationGroupeScrutin[],
): ComptesMajoriteGroupeTheme {
  const counts: ComptesMajoriteGroupeTheme = {
    pour: 0,
    contre: 0,
    abstention: 0,
    sansMajorite: 0,
    nbScrutinsAvecVotes: 0,
  };

  for (const { ventilation } of parScrutin) {
    const total =
      ventilation.pour +
      ventilation.contre +
      ventilation.abstention +
      ventilation.nonVotant;
    if (total === 0) continue;

    counts.nbScrutinsAvecVotes += 1;
    const majorite = positionMajoritaireGroupe(ventilation);
    if (majorite === "pour") counts.pour += 1;
    else if (majorite === "contre") counts.contre += 1;
    else if (majorite === "abstention") counts.abstention += 1;
    else counts.sansMajorite += 1;
  }

  return counts;
}

function pct(part: number, total: number): number | null {
  if (total === 0) return null;
  return Math.round((part / total) * 1000) / 10;
}

const LABEL_POSITION: Record<PositionVote, string> = {
  pour: "pour",
  contre: "contre",
  abstention: "abstention",
  "non-votant": "non-votant",
};

/**
 * Phrase factuelle neutre sur le positionnement d'un groupe sur un thème.
 * Aucun jugement — faits + effectifs uniquement.
 */
export function phrasePositionnementGroupe(params: {
  sigle: string | null;
  nom: string | null;
  ventilation: VentilationGroupeTheme;
  comptesMajorite: ComptesMajoriteGroupeTheme;
}): string {
  const libelle = params.sigle ?? params.nom ?? "Ce groupe";
  const { ventilation, comptesMajorite } = params;
  const exprimes = ventilation.pour + ventilation.contre + ventilation.abstention;

  if (ventilation.total === 0) {
    return `${libelle} : aucune position nominative enregistrée sur les scrutins de ce thème dans nos données.`;
  }

  const parts: string[] = [];
  parts.push(
    `${libelle} : ${ventilation.total.toLocaleString("fr-FR")} position${ventilation.total > 1 ? "s" : ""} nominative${ventilation.total > 1 ? "s" : ""} sur ${comptesMajorite.nbScrutinsAvecVotes} scrutin${comptesMajorite.nbScrutinsAvecVotes > 1 ? "s" : ""} de ce thème`,
  );

  if (exprimes > 0) {
    const pPour = pct(ventilation.pour, exprimes);
    const pContre = pct(ventilation.contre, exprimes);
    const pAbst = pct(ventilation.abstention, exprimes);
    const detail = [
      pPour != null ? `${pPour} % pour` : null,
      pContre != null ? `${pContre} % contre` : null,
      pAbst != null ? `${pAbst} % abstention` : null,
    ]
      .filter(Boolean)
      .join(", ");
    parts.push(`dont ${detail} (votes exprimés)`);
  }

  const majorites: string[] = [];
  if (comptesMajorite.pour > 0) {
    majorites.push(
      `« ${LABEL_POSITION.pour} » sur ${comptesMajorite.pour} scrutin${comptesMajorite.pour > 1 ? "s" : ""}`,
    );
  }
  if (comptesMajorite.contre > 0) {
    majorites.push(
      `« ${LABEL_POSITION.contre} » sur ${comptesMajorite.contre} scrutin${comptesMajorite.contre > 1 ? "s" : ""}`,
    );
  }
  if (comptesMajorite.abstention > 0) {
    majorites.push(
      `« ${LABEL_POSITION.abstention} » sur ${comptesMajorite.abstention} scrutin${comptesMajorite.abstention > 1 ? "s" : ""}`,
    );
  }
  if (majorites.length > 0) {
    parts.push(`position majoritaire du groupe : ${majorites.join(", ")}`);
  }
  if (comptesMajorite.sansMajorite > 0) {
    parts.push(
      `${comptesMajorite.sansMajorite} scrutin${comptesMajorite.sansMajorite > 1 ? "s" : ""} sans majorité claire au sein du groupe`,
    );
  }

  return `${parts[0]}${parts.length > 1 ? ` ; ${parts.slice(1).join(" ; ")}` : ""}.`;
}
