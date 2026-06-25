/**
 * Validation structurelle des revendications thématiques sourcées.
 * Ne juge pas le fond éditorial — vérifie cohérence technique et traçabilité minimale.
 */

import type { DeputeThemesRevendiques, ThemeRevendiqueClaim } from "../data/themes-revendiques.ts";
import { isKnownThemeSlug } from "../theme-slug-resolution.ts";

export interface RevendicationValidationIssue {
  path: string;
  message: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Valide une revendication thématique unitaire. */
export function validateThemeRevendiqueClaim(
  claim: ThemeRevendiqueClaim,
  path: string,
): RevendicationValidationIssue[] {
  const issues: RevendicationValidationIssue[] = [];

  if (!isKnownThemeSlug(claim.themeSlug)) {
    issues.push({
      path: `${path}.themeSlug`,
      message: `slug thème inconnu : « ${claim.themeSlug} » (attendu : taxonomie ou pilote déprécié)`,
    });
  }

  if (!claim.sourceUrl.trim() || !isHttpUrl(claim.sourceUrl)) {
    issues.push({
      path: `${path}.sourceUrl`,
      message: "URL source HTTP(S) requise",
    });
  }

  if (!ISO_DATE.test(claim.sourceDate)) {
    issues.push({
      path: `${path}.sourceDate`,
      message: "date ISO 8601 requise (YYYY-MM-DD)",
    });
  }

  if (!claim.libelle.trim()) {
    issues.push({
      path: `${path}.libelle`,
      message: "libellé neutre requis",
    });
  }

  return issues;
}

/** Valide l'ensemble des revendications (unicité député×thème, slugs, sources). */
export function validateRevendicationsThematiques(
  rows: DeputeThemesRevendiques[],
): RevendicationValidationIssue[] {
  const issues: RevendicationValidationIssue[] = [];
  const seen = new Set<string>();

  for (const [i, row] of rows.entries()) {
    const base = `[${i}]`;
    if (!row.deputeSlug.trim()) {
      issues.push({ path: `${base}.deputeSlug`, message: "slug député requis" });
      continue;
    }

    for (const [j, claim] of row.themes.entries()) {
      const claimPath = `${base}.themes[${j}]`;
      issues.push(...validateThemeRevendiqueClaim(claim, claimPath));

      const key = `${row.deputeSlug}::${claim.themeSlug}`;
      if (seen.has(key)) {
        issues.push({
          path: claimPath,
          message: `doublon député×thème : ${key}`,
        });
      }
      seen.add(key);
    }
  }

  return issues;
}
