/**
 * Validation structurelle de la taxonomie thématique.
 * Vérifie l'exhaustivité, l'unicité et la traçabilité des entrées.
 */

import {
  THEMES_TAXONOMIE,
  THEME_SLUGS_TAXONOMIE,
  PILOT_TO_TAXONOMIE_SLUG,
  type ThemeTaxonomieEntry,
} from "../data/theme-taxonomie.ts";
import { THEME_SLUGS_PILOTE } from "../data/theme-slugs.ts";

export interface TaxonomieValidationIssue {
  path: string;
  message: string;
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const COMMISSION_UID_PATTERN = /^PO\d+$/;
const EXPECTED_COMMISSION_COUNT = 8;

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function validateEntry(
  entry: ThemeTaxonomieEntry,
  path: string,
): TaxonomieValidationIssue[] {
  const issues: TaxonomieValidationIssue[] = [];

  if (!SLUG_PATTERN.test(entry.slug)) {
    issues.push({
      path: `${path}.slug`,
      message: `slug invalide : « ${entry.slug} »`,
    });
  }

  if (!entry.nom.trim()) {
    issues.push({ path: `${path}.nom`, message: "nom requis" });
  }

  if (!entry.description.trim()) {
    issues.push({ path: `${path}.description`, message: "description requise" });
  }

  if (!COMMISSION_UID_PATTERN.test(entry.commissionUidAn)) {
    issues.push({
      path: `${path}.commissionUidAn`,
      message: `UID commission invalide : « ${entry.commissionUidAn} »`,
    });
  }

  if (!entry.libelleCommissionAn.trim()) {
    issues.push({
      path: `${path}.libelleCommissionAn`,
      message: "libellé commission AN requis",
    });
  }

  if (entry.ordreReglement < 1 || entry.ordreReglement > EXPECTED_COMMISSION_COUNT) {
    issues.push({
      path: `${path}.ordreReglement`,
      message: `ordre hors plage 1–${EXPECTED_COMMISSION_COUNT}`,
    });
  }

  if (!isHttpUrl(entry.sourceUrl)) {
    issues.push({
      path: `${path}.sourceUrl`,
      message: "URL source HTTP(S) requise",
    });
  }

  return issues;
}

/** Valide la taxonomie complète (structure, unicité, correspondance pilote). */
export function validateThemeTaxonomie(): TaxonomieValidationIssue[] {
  const issues: TaxonomieValidationIssue[] = [];

  if (THEMES_TAXONOMIE.length !== EXPECTED_COMMISSION_COUNT) {
    issues.push({
      path: "THEMES_TAXONOMIE",
      message: `attendu ${EXPECTED_COMMISSION_COUNT} thèmes (commissions permanentes), trouvé ${THEMES_TAXONOMIE.length}`,
    });
  }

  const slugs = new Set<string>();
  const commissions = new Set<string>();
  const ordres = new Set<number>();

  for (const [i, entry] of THEMES_TAXONOMIE.entries()) {
    const path = `THEMES_TAXONOMIE[${i}]`;
    issues.push(...validateEntry(entry, path));

    if (slugs.has(entry.slug)) {
      issues.push({ path: `${path}.slug`, message: `slug dupliqué : ${entry.slug}` });
    }
    slugs.add(entry.slug);

    if (commissions.has(entry.commissionUidAn)) {
      issues.push({
        path: `${path}.commissionUidAn`,
        message: `commission dupliquée : ${entry.commissionUidAn}`,
      });
    }
    commissions.add(entry.commissionUidAn);

    if (ordres.has(entry.ordreReglement)) {
      issues.push({
        path: `${path}.ordreReglement`,
        message: `ordre dupliqué : ${entry.ordreReglement}`,
      });
    }
    ordres.add(entry.ordreReglement);
  }

  const slugList = THEMES_TAXONOMIE.map((t) => t.slug);
  if (slugList.join(",") !== THEME_SLUGS_TAXONOMIE.join(",")) {
    issues.push({
      path: "THEME_SLUGS_TAXONOMIE",
      message: "THEME_SLUGS_TAXONOMIE désynchronisé de THEMES_TAXONOMIE",
    });
  }

  for (const pilotSlug of THEME_SLUGS_PILOTE) {
    if (!(pilotSlug in PILOT_TO_TAXONOMIE_SLUG)) {
      issues.push({
        path: "PILOT_TO_TAXONOMIE_SLUG",
        message: `slug pilote sans correspondance taxonomie : ${pilotSlug}`,
      });
    }
  }

  return issues;
}
