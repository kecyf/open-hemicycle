/**
 * Validation du fichier seed `packages/etl/src/data/themes.ts` (sans DB).
 */

import {
  THEMES_TAXONOMIE,
  isThemeSlugTaxonomie,
  type ThemeSlugTaxonomie,
} from "@open-hemicycle/core";
import { THEMES } from "../data/themes.ts";

export function validateThemesSeed(): void {
  const issues: string[] = [];

  if (THEMES.length !== THEMES_TAXONOMIE.length) {
    issues.push(
      `attendu ${THEMES_TAXONOMIE.length} thèmes taxonomie, trouvé ${THEMES.length}`,
    );
  }

  const expectedSlugs = new Set(THEMES_TAXONOMIE.map((t) => t.slug));
  for (const t of THEMES) {
    if (!isThemeSlugTaxonomie(t.slug)) {
      issues.push(`slug non taxonomie : « ${t.slug} »`);
    }
    if (!expectedSlugs.has(t.slug)) {
      issues.push(`slug inconnu : « ${t.slug} »`);
    }
    const tax = THEMES_TAXONOMIE.find((x) => x.slug === t.slug);
    if (tax && (t.nom !== tax.nom || t.description !== tax.description)) {
      issues.push(`libellés désynchronisés pour « ${t.slug} » (doivent suivre THEMES_TAXONOMIE)`);
    }
    for (const uid of t.dossiersUid) {
      if (!/^DLR5L17N\d+$/.test(uid)) {
        issues.push(`uid dossier invalide dans ${t.slug} : ${uid}`);
      }
    }
  }

  const slugsWithDossiers = new Set(
    THEMES.filter((t) => t.dossiersUid.length > 0).map((t) => t.slug),
  );
  const expectedWithDossiers: ThemeSlugTaxonomie[] = [
    "finances-controle-budgetaire",
    "lois-constitutionnelles-legislation",
    "affaires-economiques",
    "defense-forces-armees",
  ];
  for (const slug of expectedWithDossiers) {
    if (!slugsWithDossiers.has(slug)) {
      issues.push(`thème pilote migré sans dossiers : ${slug}`);
    }
  }

  if (issues.length === 0) {
    console.log(
      `\n[validate:themes] OK — ${THEMES.length} thème(s) taxonomie, ${slugsWithDossiers.size} avec dossiers\n`,
    );
    return;
  }

  console.error(`\n[validate:themes] ${issues.length} problème(s) :\n`);
  for (const i of issues) {
    console.error(`  • ${i}`);
  }
  console.error("");
  process.exit(1);
}
