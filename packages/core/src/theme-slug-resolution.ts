/**
 * Résolution des slugs thématiques — migration progressive pilote → taxonomie.
 *
 * Tant que la projection DB utilise encore les slugs pilotes (`budget-finances`, …),
 * les URLs canoniques pointent vers la taxonomie commissions (`finances-controle-budgetaire`, …).
 * Voir `docs/theme-taxonomy.md` §4.
 */

import {
  getThemeTaxonomieBySlug,
  isThemeSlugTaxonomie,
  PILOT_TO_TAXONOMIE_SLUG,
  type ThemeSlugTaxonomie,
} from "./data/theme-taxonomie.ts";
import { isThemeSlugPilote, type ThemeSlugPilote } from "./data/theme-slugs.ts";

/** Inverse de `PILOT_TO_TAXONOMIE_SLUG` (taxonomie → pilote en base). */
export const TAXONOMIE_TO_PILOT_SLUG = Object.fromEntries(
  Object.entries(PILOT_TO_TAXONOMIE_SLUG).map(([pilot, tax]) => [tax, pilot]),
) as Record<ThemeSlugTaxonomie, ThemeSlugPilote>;

export interface ThemeDisplayRow {
  slug: string;
  nom: string;
  description: string | null;
  nbScrutins?: number;
}

/** Slug URL canonique (taxonomie si pilote, sinon inchangé). */
export function getCanonicalThemeSlug(slug: string): string {
  if (isThemeSlugPilote(slug)) {
    return PILOT_TO_TAXONOMIE_SLUG[slug];
  }
  return slug;
}

/**
 * Slug à utiliser pour interroger la base tant que `seed:themes` n'a pas basculé
 * sur les slugs taxonomie.
 */
export function resolveThemeSlugForDb(slug: string): string {
  if (isThemeSlugTaxonomie(slug) && slug in TAXONOMIE_TO_PILOT_SLUG) {
    return TAXONOMIE_TO_PILOT_SLUG[slug as ThemeSlugTaxonomie];
  }
  return slug;
}

/** `true` si le slug pilote a une URL canonique taxonomie distincte. */
export function isDeprecatedPilotThemeSlug(slug: string): boolean {
  return isThemeSlugPilote(slug);
}

/** Enrichit une ligne issue de la DB avec le slug et les libellés taxonomie. */
export function enrichThemeRowForDisplay(row: ThemeDisplayRow): ThemeDisplayRow {
  const canonical = getCanonicalThemeSlug(row.slug);
  const tax = getThemeTaxonomieBySlug(canonical);
  if (tax) {
    return {
      slug: canonical,
      nom: tax.nom,
      description: tax.description,
      nbScrutins: row.nbScrutins,
    };
  }
  return { ...row, slug: canonical };
}
