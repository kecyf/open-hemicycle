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
export const REVENDICATIONS_THEMATIQUES: DeputeThemesRevendiques[] = [];

/** Revendications thématiques sourcées pour un·e député·e. */
export function getThemesRevendiques(deputeSlug: string): ThemeRevendiqueClaim[] {
  return REVENDICATIONS_THEMATIQUES.find((d) => d.deputeSlug === deputeSlug)?.themes ?? [];
}

/** `true` si le·la député·e revendique publiquement ce thème (source validée). */
export function hasThemeRevendique(deputeSlug: string, themeSlug: string): boolean {
  return getThemesRevendiques(deputeSlug).some((t) => t.themeSlug === themeSlug);
}
