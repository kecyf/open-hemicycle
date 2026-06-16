import { describe, expect, it } from "vitest";
import {
  THEMES_TAXONOMIE,
  getThemeTaxonomieByCommissionUid,
  getThemeTaxonomieBySlug,
  isThemeSlugTaxonomie,
  PILOT_TO_TAXONOMIE_SLUG,
} from "../data/theme-taxonomie.ts";
import { THEME_SLUGS_PILOTE } from "../data/theme-slugs.ts";
import { validateThemeTaxonomie } from "../validate/taxonomie.ts";

describe("theme-taxonomie", () => {
  it("contient exactement 8 thèmes (commissions permanentes AN)", () => {
    expect(THEMES_TAXONOMIE).toHaveLength(8);
  });

  it("a des ordres de règlement uniques de 1 à 8", () => {
    const ordres = THEMES_TAXONOMIE.map((t) => t.ordreReglement).sort((a, b) => a - b);
    expect(ordres).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("résout chaque commission PO* vers un thème unique", () => {
    for (const t of THEMES_TAXONOMIE) {
      const found = getThemeTaxonomieByCommissionUid(t.commissionUidAn);
      expect(found?.slug).toBe(t.slug);
    }
  });

  it("isThemeSlugTaxonomie reconnaît les slugs officiels", () => {
    expect(isThemeSlugTaxonomie("finances-controle-budgetaire")).toBe(true);
    expect(isThemeSlugTaxonomie("budget-finances")).toBe(false);
  });

  it("mappe tous les slugs pilotes vers la taxonomie", () => {
    for (const pilot of THEME_SLUGS_PILOTE) {
      const taxSlug = PILOT_TO_TAXONOMIE_SLUG[pilot];
      expect(isThemeSlugTaxonomie(taxSlug)).toBe(true);
      expect(getThemeTaxonomieBySlug(taxSlug)).toBeDefined();
    }
  });
});

describe("validateThemeTaxonomie", () => {
  it("passe sans erreur sur la taxonomie courante", () => {
    const issues = validateThemeTaxonomie();
    expect(issues).toEqual([]);
  });
});
