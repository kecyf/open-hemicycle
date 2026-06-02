import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { EnregistrementVote } from "./taux-participation.ts";
import {
  TYPE_SCRUTIN_SOLENNEL,
  computeTauxParticipationTriple,
  isScrutinCommission,
  isScrutinSolennel,
  tauxParticipationCoherent,
} from "./taux-participation.ts";

const fixtureDir = path.dirname(fileURLToPath(import.meta.url));
const sample = JSON.parse(
  readFileSync(path.join(fixtureDir, "fixtures/taux-participation.sample.json"), "utf8"),
) as EnregistrementVote[];

describe("taux-participation", () => {
  it("isScrutinSolennel reconnaît le libellé AN", () => {
    expect(isScrutinSolennel(TYPE_SCRUTIN_SOLENNEL)).toBe(true);
    expect(isScrutinSolennel("scrutin public ordinaire")).toBe(false);
    expect(isScrutinSolennel(null)).toBe(false);
  });

  it("isScrutinCommission exige une commission connue", () => {
    expect(isScrutinCommission("PO1", ["PO1", "PO2"])).toBe(true);
    expect(isScrutinCommission("PO9", ["PO1"])).toBe(false);
    expect(isScrutinCommission(null, ["PO1"])).toBe(false);
    expect(isScrutinCommission("PO1", [])).toBe(false);
  });

  it("calcule les 3 taux sur la fixture (sans mandats commission)", () => {
    const t = computeTauxParticipationTriple(sample);

    expect(t.solennel.nbScrutins).toBe(2);
    expect(t.solennel.decompte.pour).toBe(1);
    expect(t.solennel.decompte.nonVotant).toBe(1);
    expect(t.solennel.taux).toBeCloseTo(0.5, 5);

    expect(t.commission.nbScrutins).toBe(0);
    expect(t.commission.taux).toBeNull();

    expect(t.tous.nbScrutins).toBe(6);
    expect(t.tous.decompte.pour).toBe(3);
    expect(t.tous.taux).toBeCloseTo(5 / 6, 5);

    for (const p of [t.solennel, t.commission, t.tous]) {
      expect(tauxParticipationCoherent(p)).toBe(true);
    }
  });

  it("filtre commission quand mandats fournis", () => {
    const t = computeTauxParticipationTriple(sample, ["PO420123"]);
    expect(t.commission.nbScrutins).toBe(1);
    expect(t.commission.taux).toBe(1);
    expect(t.commission.decompte.pour).toBe(1);
  });

  it("non-vote ≠ opposition : décompte séparé", () => {
    const t = computeTauxParticipationTriple([
      { typeScrutin: "scrutin public ordinaire", position: "non-votant" },
    ]);
    expect(t.tous.decompte.nonVotant).toBe(1);
    expect(t.tous.decompte.contre).toBe(0);
    expect(t.tous.taux).toBe(0);
  });
});
