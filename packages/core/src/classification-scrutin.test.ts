import { describe, expect, it } from "vitest";
import {
  CONFIDENCE_THRESHOLD,
  computeClassificationMetrics,
  parseLlmClassificationResponse,
  resolveClassification,
} from "./classification-scrutin.ts";
import { CLASSIFICATION_GOLD_SAMPLE } from "./data/classification-gold-sample.ts";
import {
  validateClassificationGoldSample,
  validateClassificationPredictions,
} from "./validate/enrichissement.ts";

describe("parseLlmClassificationResponse", () => {
  it("parse snake_case", () => {
    const raw = parseLlmClassificationResponse({
      theme_slug: "finances-controle-budgetaire",
      confidence: 0.92,
      justification: "Loi de finances.",
    });
    expect(raw).toEqual({
      themeSlug: "finances-controle-budgetaire",
      confidence: 0.92,
      justification: "Loi de finances.",
    });
  });

  it("rejette confidence hors plage", () => {
    const raw = parseLlmClassificationResponse({
      theme_slug: "finances-controle-budgetaire",
      confidence: 1.2,
    });
    expect(raw).toHaveProperty("error");
  });
});

describe("resolveClassification", () => {
  it("accepte un slug valide au-dessus du seuil", () => {
    const result = resolveClassification({
      themeSlug: "defense-forces-armees",
      confidence: 0.9,
    });
    expect(result.status).toBe("classé");
    expect(result.themeSlug).toBe("defense-forces-armees");
  });

  it("rejette confiance insuffisante", () => {
    const result = resolveClassification({
      themeSlug: "defense-forces-armees",
      confidence: CONFIDENCE_THRESHOLD - 0.01,
    });
    expect(result.status).toBe("non-classe");
    expect(result.rejectReason).toBe("confiance insuffisante");
  });

  it("rejette slug hors taxonomie", () => {
    const result = resolveClassification({
      themeSlug: "budget-finances",
      confidence: 0.95,
    });
    expect(result.status).toBe("non-classe");
    expect(result.rejectReason).toContain("hors taxonomie");
  });

  it("accepte null explicite comme non classé", () => {
    const result = resolveClassification({ themeSlug: null, confidence: 0.99 });
    expect(result.status).toBe("non-classe");
    expect(result.themeSlug).toBeNull();
  });
});

describe("computeClassificationMetrics", () => {
  it("calcule accuracy sur prédictions parfaites", () => {
    const predictions = CLASSIFICATION_GOLD_SAMPLE.map((e) => ({
      uidAn: e.uidAn,
      themeSlug: e.expectedThemeSlug,
    }));
    const metrics = computeClassificationMetrics(predictions, CLASSIFICATION_GOLD_SAMPLE);
    expect(metrics.accuracy).toBe(1);
    expect(metrics.falsePositives).toBe(0);
    expect(metrics.wrongTheme).toBe(0);
  });

  it("détecte faux positifs et mauvais thème", () => {
    const gold = CLASSIFICATION_GOLD_SAMPLE.slice(0, 3);
    const predictions = [
      { uidAn: gold[0]!.uidAn, themeSlug: gold[0]!.expectedThemeSlug },
      { uidAn: gold[1]!.uidAn, themeSlug: "defense-forces-armees" as const },
      { uidAn: gold[2]!.uidAn, themeSlug: "finances-controle-budgetaire" as const },
    ];
    const metrics = computeClassificationMetrics(predictions, gold);
    expect(metrics.accuracy).toBeCloseTo(1 / 3);
    expect(metrics.wrongTheme).toBe(2);
  });
});

describe("validateClassificationGoldSample", () => {
  it("passe sur l'échantillon-or courant", () => {
    expect(validateClassificationGoldSample()).toEqual([]);
  });
});

describe("validateClassificationPredictions", () => {
  it("exige couverture complète de l'échantillon-or", () => {
    const issues = validateClassificationPredictions([]);
    expect(issues.length).toBeGreaterThan(0);
  });
});
