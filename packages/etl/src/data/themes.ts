/**
 * Classification thématique des dossiers législatifs — SOURCE DE VÉRITÉ AUDITABLE.
 *
 * Principe (cf. docs/METHODOLOGY.md, docs/theme-taxonomy.md) :
 * - Nomenclature = 8 commissions permanentes AN (slugs taxonomie).
 * - Classification MANUELLE, au niveau du dossier législatif (un scrutin hérite
 *   du thème de son dossier).
 * - Règle CONSERVATRICE : un dossier n'entre dans un thème que si son TITRE
 *   OFFICIEL (verbatim, repris de l'Assemblée nationale) concerne sans ambiguïté
 *   le cœur du thème. En cas de doute, on n'inclut pas.
 * - Les dossiers pilotes sont progressivement étendus ; toute modification passe
 *   par une PR (traçable). Un dossier peut n'avoir aucun thème.
 *
 * `dossiersUid` = identifiants AN des dossiers (DLR5L17N*). Le commentaire
 * rappelle le titre officiel qui justifie le rattachement.
 */

import {
  THEMES_TAXONOMIE,
  type ThemeSlugTaxonomie,
} from "@open-hemicycle/core";

export interface ThemeSeed {
  slug: string;
  nom: string;
  description: string;
  /** Dossiers (uid AN) rattachés — justifiés par leur titre officiel. */
  dossiersUid: string[];
}

/** Dossiers rattachés par slug taxonomie (héritage pilote → taxonomie, cf. §4 theme-taxonomy.md). */
const DOSSIERS_PAR_SLUG: Partial<Record<ThemeSlugTaxonomie, readonly string[]>> = {
  "finances-controle-budgetaire": [
    "DLR5L17N52985", // Projet de loi relatif à la lutte contre les fraudes sociales et fiscales
    "DLR5L17N53720", // Renforcer le contrôle, la gouvernance et la responsabilité financière des agences et opérateurs de l'État
    "DLR5L17N54196", // Projet de loi relative aux résultats de la gestion et portant approbation des comptes de l'année 2025
    "DLR5L17N54373", // Projet de loi portant approbation des comptes de la sécurité sociale de l'année 2025
  ],
  "lois-constitutionnelles-legislation": [
    "DLR5L17N53284", // Renforcer la sécurité, la rétention administrative et la prévention des risques d'attentat
  ],
  "affaires-economiques": [
    "DLR5L17N54085", // Projet de loi d'urgence pour la protection et la souveraineté agricoles
  ],
  "defense-forces-armees": [
    "DLR5L17N54083", // Projet de loi actualisant la programmation militaire pour les années 2024 à 2030 et portant diverses dispositions intéressant la défense
  ],
};

/** Les 8 thèmes taxonomie — libellés institutionnels, dossiers selon règle conservatrice. */
export const THEMES: ThemeSeed[] = THEMES_TAXONOMIE.map((t) => ({
  slug: t.slug,
  nom: t.nom,
  description: t.description,
  dossiersUid: [...(DOSSIERS_PAR_SLUG[t.slug as ThemeSlugTaxonomie] ?? [])],
}));
