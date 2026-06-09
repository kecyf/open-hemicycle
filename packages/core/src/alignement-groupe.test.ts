import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { VoteDeputeScrutin } from "./alignement-groupe.ts";
import {
  computeTauxAlignementGroupe,
  positionMajoritaireGroupe,
  voteAligneSurGroupe,
} from "./alignement-groupe.ts";

const fixtureDir = path.dirname(fileURLToPath(import.meta.url));
const sample = JSON.parse(
  readFileSync(path.join(fixtureDir, "fixtures/alignement-groupe.sample.json"), "utf8"),
) as VoteDeputeScrutin[];

describe("alignement-groupe", () => {
  it("positionMajoritaireGroupe = modalité exprimée la plus fréquente", () => {
    expect(
      positionMajoritaireGroupe({ pour: 40, contre: 5, abstention: 2, nonVotant: 10 }),
    ).toBe("pour");
    expect(
      positionMajoritaireGroupe({ pour: 20, contre: 20, abstention: 5, nonVotant: 0 }),
    ).toBeNull();
    expect(
      positionMajoritaireGroupe({ pour: 0, contre: 0, abstention: 0, nonVotant: 50 }),
    ).toBeNull();
  });

  it("voteAligneSurGroupe compare au vote exprimé uniquement", () => {
    const v = { pour: 40, contre: 5, abstention: 2, nonVotant: 10 };
    expect(voteAligneSurGroupe("pour", v)).toBe(true);
    expect(voteAligneSurGroupe("contre", v)).toBe(false);
    expect(voteAligneSurGroupe("non-votant", v)).toBeNull();
  });

  it("calcule le taux sur la fixture (exclut égalité et non-votant député)", () => {
    const t = computeTauxAlignementGroupe(sample);
    expect(t.nbVotesExprimes).toBe(2);
    expect(t.nbAlignes).toBe(1);
    expect(t.taux).toBeCloseTo(0.5, 5);
    expect(t.nbScrutinsSansMajorite).toBe(1);
  });

  it("non-vote député·e n'entre pas dans le dénominateur", () => {
    const t = computeTauxAlignementGroupe([
      { position: "non-votant", ventilationGroupe: { pour: 50, contre: 0, abstention: 0, nonVotant: 0 } },
    ]);
    expect(t.nbVotesExprimes).toBe(0);
    expect(t.taux).toBeNull();
  });
});
