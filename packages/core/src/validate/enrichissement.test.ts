import { describe, expect, it } from "vitest";
import type { ClassificationPrediction } from "../classification-scrutin.ts";
import { CLASSIFICATION_GOLD_SAMPLE } from "../data/classification-gold-sample.ts";
import {
  validateClassificationGoldSample,
  validateClassificationPredictions,
} from "./enrichissement.ts";

describe("validate enrichissement", () => {
  it("échantillon-or actuel : structure valide", () => {
    expect(validateClassificationGoldSample()).toEqual([]);
  });

  it("détecte uid absent de l'échantillon-or", () => {
    const issues = validateClassificationPredictions([
      { uidAn: "VTANR5L17V999-GOLD99", themeSlug: "affaires-economiques" },
    ]);
    expect(issues.some((i) => i.message.includes("absent de l'échantillon-or"))).toBe(true);
  });

  it("détecte prédiction manquante pour un uid gold", () => {
    const issues = validateClassificationPredictions([]);
    expect(issues.length).toBeGreaterThanOrEqual(CLASSIFICATION_GOLD_SAMPLE.length);
    expect(issues.some((i) => i.message.includes("prédiction manquante"))).toBe(true);
  });

  it("détecte slug hors taxonomie dans les prédictions", () => {
    const bad: ClassificationPrediction[] = [
      { uidAn: CLASSIFICATION_GOLD_SAMPLE[0]!.uidAn, themeSlug: "slug-invente" as never },
    ];
    const issues = validateClassificationPredictions(bad);
    expect(issues.some((i) => i.path.endsWith(".themeSlug"))).toBe(true);
  });
});
