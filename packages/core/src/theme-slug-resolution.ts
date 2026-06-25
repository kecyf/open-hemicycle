/**
 * Résolution des slugs thématiques — migration progressive pilote → taxonomie.
 *
 * La projection DB (`seed:themes`) utilise les slugs taxonomie ; les URLs pilotes
 * restent redirigées vers les slugs canoniques. Voir `docs/theme-taxonomy.md` §4.
 */

import {
  getThemeTaxonomieBySlug,
  isThemeSlugTaxonomie,
  PILOT_TO_TAXONOMIE_SLUG,
} from "./data/theme-taxonomie.ts";
import { isThemeSlugPilote } from "./data/theme-slugs.ts";

/** Slug thème reconnu (taxonomie ou pilote déprécié). */
export function isKnownThemeSlug(slug: string): boolean {
  return isThemeSlugTaxonomie(slug) || isThemeSlugPilote(slug);
}

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

/** Slug à utiliser pour interroger la base (pilote déprécié → taxonomie). */
export function resolveThemeSlugForDb(slug: string): string {
  if (isThemeSlugPilote(slug)) {
    return PILOT_TO_TAXONOMIE_SLUG[slug];
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
