import { describe, expect, it } from "vitest";
import { REVENDICATIONS_THEMATIQUES } from "../data/themes-revendiques.ts";
import {
  validateRevendicationsThematiques,
  validateThemeRevendiqueClaim,
} from "./revendications.ts";

describe("validate revendications", () => {
  it("revendications pilote actuelles : structure valide", () => {
    expect(validateRevendicationsThematiques(REVENDICATIONS_THEMATIQUES)).toEqual([]);
    expect(REVENDICATIONS_THEMATIQUES.length).toBeGreaterThanOrEqual(1);
  });

  it("accepte slug taxonomie", () => {
    const issues = validateThemeRevendiqueClaim(
      {
        themeSlug: "affaires-economiques",
        sourceUrl: "https://www.assemblee-nationale.fr/",
        sourceDate: "2026-01-01",
        libelle: "Exemple neutre sourcé.",
      },
      "test",
    );
    expect(issues).toEqual([]);
  });

  it("détecte slug thème inconnu", () => {
    const issues = validateThemeRevendiqueClaim(
      {
        themeSlug: "inconnu",
        sourceUrl: "https://www.assemblee-nationale.fr/",
        sourceDate: "2026-01-01",
        libelle: "Exemple neutre sourcé.",
      },
      "test",
    );
    expect(issues.some((i) => i.path.endsWith(".themeSlug"))).toBe(true);
  });

  it("détecte URL invalide et date mal formée", () => {
    const issues = validateThemeRevendiqueClaim(
      {
        themeSlug: "agriculture",
        sourceUrl: "pas-une-url",
        sourceDate: "01/01/2026",
        libelle: "",
      },
      "test",
    );
    expect(issues).toHaveLength(3);
  });

  it("détecte doublon député×thème", () => {
    const issues = validateRevendicationsThematiques([
      {
        deputeSlug: "exemple-depute-00001",
        themes: [
          {
            themeSlug: "agriculture",
            sourceUrl: "https://www.assemblee-nationale.fr/",
            sourceDate: "2026-05-04",
            libelle: "Rapporteur désigné sur le PL agriculture (source AN).",
          },
          {
            themeSlug: "agriculture",
            sourceUrl: "https://www.assemblee-nationale.fr/",
            sourceDate: "2026-05-05",
            libelle: "Doublon.",
          },
        ],
      },
    ]);
    expect(issues.some((i) => i.message.includes("doublon"))).toBe(true);
  });
});
