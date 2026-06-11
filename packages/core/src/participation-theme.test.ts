import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { getThemesRevendiques } from "./data/themes-revendiques.ts";
import { computeComparaisonParticipationTheme } from "./participation-theme.ts";
import type { EnregistrementVote } from "./taux-participation.ts";

const fixtureDir = path.dirname(fileURLToPath(import.meta.url));
const sample = JSON.parse(
  readFileSync(path.join(fixtureDir, "fixtures/participation-theme.sample.json"), "utf8"),
) as { theme: EnregistrementVote[]; global: EnregistrementVote[] };

describe("participation-theme", () => {
  it("calcule les taux et l'écart sur la fixture", () => {
    const c = computeComparaisonParticipationTheme(sample.theme, sample.global);

    expect(c.nbScrutinsTheme).toBe(3);
    expect(c.tauxParticipationTheme).toBeCloseTo(2 / 3, 5);

    expect(c.nbScrutinsGlobal).toBe(6);
    expect(c.tauxParticipationGlobal).toBeCloseTo(5 / 6, 5);

    expect(c.ecartParticipation).toBeCloseTo(2 / 3 - 5 / 6, 5);
  });

  it("écart null si périmètre thème vide", () => {
    const c = computeComparaisonParticipationTheme([], sample.global);
    expect(c.tauxParticipationTheme).toBeNull();
    expect(c.ecartParticipation).toBeNull();
  });

  it("non-vote ≠ opposition : décompte séparé", () => {
    const c = computeComparaisonParticipationTheme(
      [{ typeScrutin: "scrutin public ordinaire", position: "non-votant" }],
      [{ typeScrutin: "scrutin public ordinaire", position: "non-votant" }],
    );
    expect(c.decompteTheme.nonVotant).toBe(1);
    expect(c.decompteTheme.contre).toBe(0);
    expect(c.tauxParticipationTheme).toBe(0);
  });

  it("revendications pilote : liste vide par défaut", () => {
    expect(getThemesRevendiques("inconnu")).toEqual([]);
  });
});
