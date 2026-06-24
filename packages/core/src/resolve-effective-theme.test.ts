import { describe, expect, it } from "vitest";
import {
  basisPointsToConfidence,
  confidenceToBasisPoints,
  CONFIDENCE_BASIS_POINTS_MAX,
} from "./classification-scrutin.ts";
import {
  resolveEffectiveThemeSlug,
  scrutinBelongsToEffectiveTheme,
} from "./resolve-effective-theme.ts";

describe("confidenceToBasisPoints", () => {
  it("convertit 0.75 en 7500 points", () => {
    expect(confidenceToBasisPoints(0.75)).toBe(7500);
  });

  it("borne les valeurs hors plage", () => {
    expect(confidenceToBasisPoints(-0.1)).toBe(0);
    expect(confidenceToBasisPoints(1.5)).toBe(CONFIDENCE_BASIS_POINTS_MAX);
  });

  it("est réversible avec basisPointsToConfidence", () => {
    const bp = confidenceToBasisPoints(0.92);
    expect(basisPointsToConfidence(bp)).toBeCloseTo(0.92, 4);
  });
});

describe("resolveEffectiveThemeSlug", () => {
  it("priorise le thème dossier sur le LLM", () => {
    expect(
      resolveEffectiveThemeSlug({
        dossierThemeSlug: "budget-finances",
        llmThemeSlug: "defense-forces-armees",
        llmConfidence: 0.99,
      }),
    ).toBe("finances-controle-budgetaire");
  });

  it("utilise le LLM si pas de dossier et confiance suffisante", () => {
    expect(
      resolveEffectiveThemeSlug({
        dossierThemeSlug: null,
        llmThemeSlug: "defense-forces-armees",
        llmConfidence: 0.8,
      }),
    ).toBe("defense-forces-armees");
  });

  it("rejette le LLM sous le seuil de confiance", () => {
    expect(
      resolveEffectiveThemeSlug({
        dossierThemeSlug: null,
        llmThemeSlug: "defense-forces-armees",
        llmConfidence: 0.5,
      }),
    ).toBeNull();
  });

  it("rejette un slug LLM hors taxonomie", () => {
    expect(
      resolveEffectiveThemeSlug({
        dossierThemeSlug: null,
        llmThemeSlug: "invente",
        llmConfidence: 0.95,
      }),
    ).toBeNull();
  });
});

describe("scrutinBelongsToEffectiveTheme", () => {
  it("inclut via dossier même si le LLM propose un autre thème", () => {
    expect(
      scrutinBelongsToEffectiveTheme("finances-controle-budgetaire", {
        dossierThemeSlug: "budget-finances",
        llmThemeSlug: "defense-forces-armees",
        llmConfidence: 0.99,
      }),
    ).toBe(true);
    expect(
      scrutinBelongsToEffectiveTheme("defense-forces-armees", {
        dossierThemeSlug: "budget-finances",
        llmThemeSlug: "defense-forces-armees",
        llmConfidence: 0.99,
      }),
    ).toBe(false);
  });

  it("inclut via LLM seulement sans thème dossier", () => {
    expect(
      scrutinBelongsToEffectiveTheme("defense-forces-armees", {
        dossierThemeSlug: null,
        llmThemeSlug: "defense-forces-armees",
        llmConfidence: 0.8,
      }),
    ).toBe(true);
  });
});
