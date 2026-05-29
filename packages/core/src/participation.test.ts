import { describe, expect, it } from "vitest";
import { tauxExpression, totalPositions, votesExprimes } from "./participation.ts";

describe("participation", () => {
  const d = { pour: 30, contre: 10, abstention: 10, nonVotant: 50 };

  it("votesExprimes exclut les non-votants", () => {
    expect(votesExprimes(d)).toBe(50);
  });

  it("totalPositions inclut les non-votants", () => {
    expect(totalPositions(d)).toBe(100);
  });

  it("tauxExpression = exprimés / total", () => {
    expect(tauxExpression(d)).toBeCloseTo(0.5, 5);
  });

  it("tauxExpression = null si aucune position (pas de 0 trompeur)", () => {
    expect(tauxExpression({ pour: 0, contre: 0, abstention: 0, nonVotant: 0 })).toBeNull();
  });
});
