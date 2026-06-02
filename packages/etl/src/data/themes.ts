/**
 * Classification thématique des dossiers législatifs — SOURCE DE VÉRITÉ AUDITABLE.
 *
 * Principe (cf. docs/METHODOLOGY.md) :
 * - Classification MANUELLE, au niveau du dossier législatif (un scrutin hérite
 *   du thème de son dossier).
 * - Règle CONSERVATRICE : un dossier n'entre dans un thème que si son TITRE
 *   OFFICIEL (verbatim, repris de l'Assemblée nationale) concerne sans ambiguïté
 *   le cœur du thème. En cas de doute, on n'inclut pas.
 * - Pilote : 2 thèmes seulement. La liste est versionnée ; toute modification
 *   passe par une PR (traçable). Un dossier peut n'avoir aucun thème.
 *
 * `dossiersUid` = identifiants AN des dossiers (DLR5L17N*). Le commentaire
 * rappelle le titre officiel qui justifie le rattachement.
 */

export interface ThemeSeed {
  slug: string;
  nom: string;
  description: string;
  /** Dossiers (uid AN) rattachés — justifiés par leur titre officiel. */
  dossiersUid: string[];
}

export const THEMES: ThemeSeed[] = [
  {
    slug: "budget-finances",
    nom: "Budget & finances publiques",
    description:
      "Lois de finances, fiscalité, contrôle et responsabilité financière de l'État.",
    dossiersUid: [
      "DLR5L17N52985", // Projet de loi relatif à la lutte contre les fraudes sociales et fiscales
      "DLR5L17N53720", // Renforcer le contrôle, la gouvernance et la responsabilité financière des agences et opérateurs de l'État
    ],
  },
  {
    slug: "securite-immigration",
    nom: "Sécurité & immigration",
    description:
      "Sécurité intérieure, ordre public, rétention administrative, lutte antiterroriste.",
    dossiersUid: [
      "DLR5L17N53284", // Renforcer la sécurité, la rétention administrative et la prévention des risques d'attentat
    ],
  },
];
