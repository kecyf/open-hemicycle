import { describe, expect, it } from "vitest";
import {
  enrichThemeRowForDisplay,
  getCanonicalThemeSlug,
  isDeprecatedPilotThemeSlug,
  resolveThemeSlugForDb,
  TAXONOMIE_TO_PILOT_SLUG,
} from "./theme-slug-resolution.ts";
import { THEME_SLUGS_PILOTE } from "./data/theme-slugs.ts";
import { PILOT_TO_TAXONOMIE_SLUG } from "./data/theme-taxonomie.ts";

describe("theme-slug-resolution", () => {
  it("mappe chaque pilote vers son slug taxonomie canonique", () => {
    for (const pilot of THEME_SLUGS_PILOTE) {
      const canonical = getCanonicalThemeSlug(pilot);
      expect(canonical).toBe(PILOT_TO_TAXONOMIE_SLUG[pilot]);
      expect(canonical).not.toBe(pilot);
    }
  });

  it("laisse inchangé un slug taxonomie déjà canonique", () => {
    expect(getCanonicalThemeSlug("finances-controle-budgetaire")).toBe(
      "finances-controle-budgetaire",
    );
  });

  it("résout taxonomie → pilote pour les requêtes DB", () => {
    expect(resolveThemeSlugForDb("finances-controle-budgetaire")).toBe("budget-finances");
    expect(resolveThemeSlugForDb("budget-finances")).toBe("budget-finances");
    expect(resolveThemeSlugForDb("affaires-culturelles-education")).toBe(
      "affaires-culturelles-education",
    );
  });

  it("TAXONOMIE_TO_PILOT_SLUG est l'inverse exact de PILOT_TO_TAXONOMIE_SLUG", () => {
    for (const [pilot, tax] of Object.entries(PILOT_TO_TAXONOMIE_SLUG)) {
      expect(TAXONOMIE_TO_PILOT_SLUG[tax]).toBe(pilot);
    }
  });

  it("enrichit nom et description depuis la taxonomie", () => {
    const enriched = enrichThemeRowForDisplay({
      slug: "budget-finances",
      nom: "Budget & finances publiques",
      description: "Ancienne description pilote",
      nbScrutins: 42,
    });
    expect(enriched.slug).toBe("finances-controle-budgetaire");
    expect(enriched.nom).toContain("Finances");
    expect(enriched.description).toContain("Lois de finances");
    expect(enriched.nbScrutins).toBe(42);
  });

  it("isDeprecatedPilotThemeSlug identifie les slugs pilotes", () => {
    expect(isDeprecatedPilotThemeSlug("agriculture")).toBe(true);
    expect(isDeprecatedPilotThemeSlug("finances-controle-budgetaire")).toBe(false);
  });
});
