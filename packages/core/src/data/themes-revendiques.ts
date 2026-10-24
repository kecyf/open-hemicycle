/**
 * Revendications thématiques publiques des député·es — SOURCE DE VÉRITÉ AUDITABLE.
 *
 * Principe (cf. docs/METHODOLOGY.md §4.c) :
 * - Chaque entrée = une déclaration publique vérifiable (URL + date).
 * - Le calcul compare la participation aux scrutins du thème revendiqué
 *   au taux global — sans qualificatif moral.
 * - Pilote : liste vide jusqu'à validation superviseur des premières sources.
 * - Toute modification passe par une PR (traçable).
 */

import { resolveThemeSlugForDb } from "../theme-slug-resolution.ts";

export interface ThemeRevendiqueClaim {
  /** Slug du thème (cohérent avec `themes.slug` en base). */
  themeSlug: string;
  /** Source publique de la revendication (URL). */
  sourceUrl: string;
  /** Date de la déclaration ou du document (ISO 8601, jour). */
  sourceDate: string;
  /** Description neutre de la revendication (verbatim ou paraphrase sourcée). */
  libelle: string;
}

export interface DeputeThemesRevendiques {
  /** Slug URL du·de la député·e (cohérent avec `deputes.slug`). */
  deputeSlug: string;
  themes: ThemeRevendiqueClaim[];
}

/** Revendications validées (pilotage progressif, entrées ajoutées par PR). */
export const REVENDICATIONS_THEMATIQUES: DeputeThemesRevendiques[] = [
  {
    deputeSlug: "julien-dive-12015",
    themes: [
      {
        themeSlug: "affaires-economiques",
        sourceUrl:
          "https://questions.assemblee-nationale.fr/dyn/17/rapports/cion-eco/l17b2765_rapport-fond.pdf",
        sourceDate: "2026-05-07",
        libelle:
          "Rapporteur désigné sur le projet de loi d'urgence pour la protection et la souveraineté agricoles (n° 2632), commission des affaires économiques.",
      },
    ],
  },
  {
    deputeSlug: "jean-louis-thieriot-43089",
    themes: [
      {
        themeSlug: "defense-forces-armees",
        sourceUrl:
          "https://www.assemblee-nationale.fr/dyn/17/textes/l17b2695_texte-adopte-commission",
        sourceDate: "2026-04-23",
        libelle:
          "Rapporteur désigné sur le projet de loi actualisant la programmation militaire 2024–2030 (n° 2630), commission de la défense nationale et des forces armées.",
      },
    ],
  },
];

/** Revendications thématiques sourcées pour un·e député·e. */
export function getThemesRevendiques(deputeSlug: string): ThemeRevendiqueClaim[] {
  return REVENDICATIONS_THEMATIQUES.find((d) => d.deputeSlug === deputeSlug)?.themes ?? [];
}

/** `true` si le·la député·e revendique publiquement ce thème (source validée). */
export function hasThemeRevendique(deputeSlug: string, themeSlug: string): boolean {
  const dbSlug = resolveThemeSlugForDb(themeSlug);
  return getThemesRevendiques(deputeSlug).some(
    (t) => resolveThemeSlugForDb(t.themeSlug) === dbSlug,
  );
}
