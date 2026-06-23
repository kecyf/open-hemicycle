/**
 * Classification assistée scrutin → thème (couche d'enrichissement 4.8).
 *
 * Logique pure : parse la réponse LLM, applique le seuil de confiance,
 * valide le slug contre la taxonomie. Jamais de jugement sur une personne.
 */

import {
  isThemeSlugTaxonomie,
  type ThemeSlugTaxonomie,
} from "./data/theme-taxonomie.ts";

/** Seuil minimal de confiance pour accepter une classification (cf. VISION.md). */
export const CONFIDENCE_THRESHOLD = 0.75;

/** Précision stockée en base (0–10 000 = 0,00–1,00). */
export const CONFIDENCE_BASIS_POINTS_MAX = 10_000;

export const PROMPT_VERSION = "v1";

/** Convertit une confiance [0, 1] en points de base pour la persistance DB. */
export function confidenceToBasisPoints(confidence: number): number {
  return Math.round(
    Math.max(0, Math.min(1, confidence)) * CONFIDENCE_BASIS_POINTS_MAX,
  );
}

/** Convertit des points de base DB en confiance [0, 1]. */
export function basisPointsToConfidence(basisPoints: number): number {
  return (
    Math.max(0, Math.min(CONFIDENCE_BASIS_POINTS_MAX, basisPoints)) /
    CONFIDENCE_BASIS_POINTS_MAX
  );
}

export interface ScrutinClassificationInput {
  uidAn: string;
  titre: string;
  objet?: string | null;
}

/** Réponse brute attendue du modèle (JSON structuré). */
export interface LlmClassificationRaw {
  themeSlug: string | null;
  confidence: number;
  /** Justification factuelle (audit), jamais sur une personne. */
  justification?: string;
}

export type ClassificationStatus = "classé" | "non-classe";

export interface ClassificationResult {
  status: ClassificationStatus;
  /** Slug taxonomie retenu, ou `null` si non classé. */
  themeSlug: ThemeSlugTaxonomie | null;
  confidence: number;
  /** Slug proposé par le modèle avant filtrage (traçabilité). */
  rawThemeSlug: string | null;
  justification?: string;
  /** Motif du rejet éventuel (slug invalide, confiance insuffisante…). */
  rejectReason?: string;
}

export interface ParseClassificationError {
  error: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readStringField(
  obj: Record<string, unknown>,
  keys: string[],
): string | null | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (value === null) return null;
    if (typeof value === "string") return value;
  }
  return undefined;
}

function readNumberField(
  obj: Record<string, unknown>,
  keys: string[],
): number | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

/** Parse une réponse JSON du modèle (accepte snake_case ou camelCase). */
export function parseLlmClassificationResponse(
  json: unknown,
): LlmClassificationRaw | ParseClassificationError {
  if (!isRecord(json)) {
    return { error: "réponse non objet" };
  }

  const themeField = readStringField(json, ["themeSlug", "theme_slug"]);
  if (themeField === undefined) {
    return { error: "champ theme_slug manquant" };
  }

  const confidence = readNumberField(json, ["confidence", "confiance"]);
  if (confidence === undefined) {
    return { error: "champ confidence manquant ou invalide" };
  }
  if (confidence < 0 || confidence > 1) {
    return { error: "confidence hors plage [0, 1]" };
  }

  const justification = readStringField(json, ["justification", "motif"]);

  return {
    themeSlug: themeField,
    confidence,
    justification: justification ?? undefined,
  };
}

/** Applique seuil + validation taxonomie → résultat exploitable. */
export function resolveClassification(
  raw: LlmClassificationRaw,
  threshold = CONFIDENCE_THRESHOLD,
): ClassificationResult {
  const base = {
    confidence: raw.confidence,
    rawThemeSlug: raw.themeSlug,
    justification: raw.justification,
  };

  if (raw.themeSlug === null || raw.themeSlug.trim() === "") {
    return {
      ...base,
      status: "non-classe",
      themeSlug: null,
      rejectReason: raw.confidence < threshold ? "confiance insuffisante" : "thème absent",
    };
  }

  if (raw.confidence < threshold) {
    return {
      ...base,
      status: "non-classe",
      themeSlug: null,
      rejectReason: "confiance insuffisante",
    };
  }

  if (!isThemeSlugTaxonomie(raw.themeSlug)) {
    return {
      ...base,
      status: "non-classe",
      themeSlug: null,
      rejectReason: `slug hors taxonomie : ${raw.themeSlug}`,
    };
  }

  return {
    ...base,
    status: "classé",
    themeSlug: raw.themeSlug,
  };
}

export interface GoldSampleEntry extends ScrutinClassificationInput {
  /** Slug taxonomie attendu, ou `null` si le scrutin doit rester non classé. */
  expectedThemeSlug: ThemeSlugTaxonomie | null;
  /** Note d'annotation (source, date, ambiguïté). */
  annotationNote: string;
}

export interface ClassificationPrediction {
  uidAn: string;
  themeSlug: ThemeSlugTaxonomie | null;
}

export interface ClassificationMetrics {
  n: number;
  /** Part des prédictions exactes (slug ou non-classé). */
  accuracy: number;
  /** Précision sur les entrées où le modèle a proposé un thème. */
  precisionWhenClassified: number | null;
  /** Rappel : part des gold « classé » correctement identifiées. */
  recallWhenExpectedClassified: number | null;
  falsePositives: number;
  falseNegatives: number;
  wrongTheme: number;
}

function predictionsByUid(
  predictions: ClassificationPrediction[],
): Map<string, ThemeSlugTaxonomie | null> {
  const map = new Map<string, ThemeSlugTaxonomie | null>();
  for (const p of predictions) {
    map.set(p.uidAn, p.themeSlug);
  }
  return map;
}

/** Mesure la précision sur un échantillon-or annoté manuellement. */
export function computeClassificationMetrics(
  predictions: ClassificationPrediction[],
  gold: readonly GoldSampleEntry[],
): ClassificationMetrics {
  const byUid = predictionsByUid(predictions);
  let correct = 0;
  let classifiedPredictions = 0;
  let correctWhenClassified = 0;
  let expectedClassified = 0;
  let recalledClassified = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  let wrongTheme = 0;

  for (const entry of gold) {
    const predicted = byUid.get(entry.uidAn);
    if (predicted === undefined) {
      falseNegatives += entry.expectedThemeSlug !== null ? 1 : 0;
      continue;
    }

    const expected = entry.expectedThemeSlug;
    const match = predicted === expected;

    if (match) {
      correct += 1;
    } else if (predicted !== null && expected === null) {
      falsePositives += 1;
    } else if (predicted === null && expected !== null) {
      falseNegatives += 1;
    } else if (predicted !== null && expected !== null) {
      wrongTheme += 1;
    }

    if (predicted !== null) {
      classifiedPredictions += 1;
      if (match) correctWhenClassified += 1;
    }

    if (expected !== null) {
      expectedClassified += 1;
      if (predicted === expected) recalledClassified += 1;
    }
  }

  const n = gold.length;
  return {
    n,
    accuracy: n === 0 ? 0 : correct / n,
    precisionWhenClassified:
      classifiedPredictions === 0 ? null : correctWhenClassified / classifiedPredictions,
    recallWhenExpectedClassified:
      expectedClassified === 0 ? null : recalledClassified / expectedClassified,
    falsePositives,
    falseNegatives,
    wrongTheme,
  };
}
