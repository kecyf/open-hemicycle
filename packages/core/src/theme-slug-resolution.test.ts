import { describe, expect, it } from "vitest";
import {
  enrichThemeRowForDisplay,
  getCanonicalThemeSlug,
  isDeprecatedPilotThemeSlug,
  resolveThemeSlugForDb,
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

  it("résout pilote → taxonomie pour les requêtes DB", () => {
    expect(resolveThemeSlugForDb("finances-controle-budgetaire")).toBe(
      "finances-controle-budgetaire",
    );
    expect(resolveThemeSlugForDb("budget-finances")).toBe("finances-controle-budgetaire");
    expect(resolveThemeSlugForDb("affaires-culturelles-education")).toBe(
      "affaires-culturelles-education",
    );
  });

  it("mappe chaque pilote vers taxonomie en requête DB", () => {
    for (const pilot of THEME_SLUGS_PILOTE) {
      expect(resolveThemeSlugForDb(pilot)).toBe(PILOT_TO_TAXONOMIE_SLUG[pilot]);
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
