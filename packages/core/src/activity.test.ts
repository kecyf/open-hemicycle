import { describe, expect, it } from "vitest";
import {
  computeSeuilsNiveaux,
  niveauPourScore,
  scoreJour,
  POIDS_ACTIVITE,
} from "./activity.ts";

describe("scoreJour", () => {
  it("renvoie 0 sans activité", () => {
    expect(scoreJour({})).toBe(0);
  });

  it("compte les votes au poids 1 (cas v1 votes-only)", () => {
    expect(scoreJour({ nbVotes: 5 })).toBe(5);
  });

  it("applique les poids pondérés de chaque acte", () => {
    const a = {
      nbVotes: 2,
      nbAmendements: 1,
      nbQuestions: 3,
      nbInterventions: 1,
      nbPresencesCommission: 2,
    };
    const attendu =
      POIDS_ACTIVITE.vote * 2 +
      POIDS_ACTIVITE.amendement * 1 +
      POIDS_ACTIVITE.question * 3 +
      POIDS_ACTIVITE.intervention * 1 +
      POIDS_ACTIVITE.presenceCommission * 2;
    expect(scoreJour(a)).toBe(attendu); // 2 + 2 + 3 + 3 + 4 = 14
    expect(attendu).toBe(14);
  });
});

describe("computeSeuilsNiveaux", () => {
  it("renvoie un fallback neutre si aucune activité positive", () => {
    expect(computeSeuilsNiveaux([])).toEqual([1, 1, 1]);
    expect(computeSeuilsNiveaux([0, 0, 0])).toEqual([1, 1, 1]);
  });

  it("ignore les scores nuls et calcule les quartiles des positifs", () => {
    // positifs = [1,2,3,4] → quartiles 0.25/0.5/0.75 (interpolation linéaire)
    const seuils = computeSeuilsNiveaux([0, 1, 2, 3, 4]);
    expect(seuils[0]).toBeCloseTo(1.75, 5);
    expect(seuils[1]).toBeCloseTo(2.5, 5);
    expect(seuils[2]).toBeCloseTo(3.25, 5);
  });
});

describe("niveauPourScore", () => {
  const seuils: [number, number, number] = [1.75, 2.5, 3.25];

  it("score nul ou négatif → niveau 0", () => {
    expect(niveauPourScore(0, seuils)).toBe(0);
    expect(niveauPourScore(-3, seuils)).toBe(0);
  });

  it("répartit les scores positifs sur les niveaux 1–4", () => {
    expect(niveauPourScore(1, seuils)).toBe(1);
    expect(niveauPourScore(1.75, seuils)).toBe(1);
    expect(niveauPourScore(2, seuils)).toBe(2);
    expect(niveauPourScore(3, seuils)).toBe(3);
    expect(niveauPourScore(10, seuils)).toBe(4);
  });

  it("monotone : un score plus élevé n'a jamais un niveau inférieur", () => {
    let prev = 0;
    for (const s of [0, 1, 2, 3, 4, 5, 50]) {
      const n = niveauPourScore(s, seuils);
      expect(n).toBeGreaterThanOrEqual(prev);
      prev = n;
    }
  });
});
