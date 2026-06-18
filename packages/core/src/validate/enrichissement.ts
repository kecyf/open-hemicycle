/**
 * Validation structurelle de l'échantillon-or et des prédictions de classification.
 */

import { CLASSIFICATION_GOLD_SAMPLE } from "../data/classification-gold-sample.ts";
import {
  computeClassificationMetrics,
  type ClassificationPrediction,
  type GoldSampleEntry,
} from "../classification-scrutin.ts";
import { isThemeSlugTaxonomie } from "../data/theme-taxonomie.ts";

export interface EnrichissementValidationIssue {
  path: string;
  message: string;
}

const SCRUTIN_UID_PATTERN = /^VTANR5L17V\d+-GOLD\d+$/;

function validateGoldEntry(
  entry: GoldSampleEntry,
  path: string,
): EnrichissementValidationIssue[] {
  const issues: EnrichissementValidationIssue[] = [];

  if (!SCRUTIN_UID_PATTERN.test(entry.uidAn)) {
    issues.push({
      path: `${path}.uidAn`,
      message: `uid scrutin gold invalide : ${entry.uidAn}`,
    });
  }

  if (!entry.titre.trim()) {
    issues.push({ path: `${path}.titre`, message: "titre requis" });
  }

  if (
    entry.expectedThemeSlug !== null &&
    !isThemeSlugTaxonomie(entry.expectedThemeSlug)
  ) {
    issues.push({
      path: `${path}.expectedThemeSlug`,
      message: `slug hors taxonomie : ${entry.expectedThemeSlug}`,
    });
  }

  if (!entry.annotationNote.trim()) {
    issues.push({ path: `${path}.annotationNote`, message: "annotationNote requise" });
  }

  return issues;
}

/** Valide la structure de l'échantillon-or. */
export function validateClassificationGoldSample(): EnrichissementValidationIssue[] {
  const issues: EnrichissementValidationIssue[] = [];

  if (CLASSIFICATION_GOLD_SAMPLE.length < 10) {
    issues.push({
      path: "CLASSIFICATION_GOLD_SAMPLE",
      message: "échantillon-or trop petit (< 10 entrées)",
    });
  }

  const uids = new Set<string>();
  for (const [i, entry] of CLASSIFICATION_GOLD_SAMPLE.entries()) {
    const path = `CLASSIFICATION_GOLD_SAMPLE[${i}]`;
    issues.push(...validateGoldEntry(entry, path));
    if (uids.has(entry.uidAn)) {
      issues.push({ path: `${path}.uidAn`, message: `uid dupliqué : ${entry.uidAn}` });
    }
    uids.add(entry.uidAn);
  }

  const nonClasse = CLASSIFICATION_GOLD_SAMPLE.filter((e) => e.expectedThemeSlug === null);
  if (nonClasse.length < 2) {
    issues.push({
      path: "CLASSIFICATION_GOLD_SAMPLE",
      message: "au moins 2 entrées « non classé » attendues (cas ambigus)",
    });
  }

  return issues;
}

/** Valide que les prédictions couvrent l'échantillon-or. */
export function validateClassificationPredictions(
  predictions: ClassificationPrediction[],
): EnrichissementValidationIssue[] {
  const issues: EnrichissementValidationIssue[] = [];
  const goldUids = new Set(CLASSIFICATION_GOLD_SAMPLE.map((e) => e.uidAn));
  const seen = new Set<string>();

  for (const [i, p] of predictions.entries()) {
    const path = `predictions[${i}]`;
    if (!goldUids.has(p.uidAn)) {
      issues.push({
        path: `${path}.uidAn`,
        message: `uid absent de l'échantillon-or : ${p.uidAn}`,
      });
    }
    if (seen.has(p.uidAn)) {
      issues.push({ path: `${path}.uidAn`, message: `uid dupliqué : ${p.uidAn}` });
    }
    seen.add(p.uidAn);

    if (p.themeSlug !== null && !isThemeSlugTaxonomie(p.themeSlug)) {
      issues.push({
        path: `${path}.themeSlug`,
        message: `slug hors taxonomie : ${p.themeSlug}`,
      });
    }
  }

  for (const entry of CLASSIFICATION_GOLD_SAMPLE) {
    if (!seen.has(entry.uidAn)) {
      issues.push({
        path: "predictions",
        message: `prédiction manquante pour ${entry.uidAn}`,
      });
    }
  }

  return issues;
}

export { CLASSIFICATION_GOLD_SAMPLE, computeClassificationMetrics };
