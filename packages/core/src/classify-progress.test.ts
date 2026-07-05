import { describe, expect, it } from "vitest";
import { computeClassifyProgressSummary } from "./classify-progress.ts";

describe("computeClassifyProgressSummary", () => {
  it("calcule le pourcentage et les runs estimés (backlog réel ~7150/650)", () => {
    const summary = computeClassifyProgressSummary({
      scrutinsSansDossier: 7150,
      dejaClassifies: 650,
      enAttente: 6500,
    });
    expect(summary).toEqual({
      percentComplete: 9,
      estimatedRuns: 65,
      batchSize: 100,
    });
  });

  it("retourne 0 run si backlog vide", () => {
    expect(
      computeClassifyProgressSummary({
        scrutinsSansDossier: 100,
        dejaClassifies: 100,
        enAttente: 0,
      }),
    ).toEqual({
      percentComplete: 100,
      estimatedRuns: 0,
      batchSize: 100,
    });
  });

  it("retourne null si aucun scrutin sans dossier", () => {
    expect(
      computeClassifyProgressSummary({
        scrutinsSansDossier: 0,
        dejaClassifies: 0,
        enAttente: 0,
      }),
    ).toBeNull();
  });

  it("respecte un batchSize personnalisé", () => {
    const summary = computeClassifyProgressSummary(
      { scrutinsSansDossier: 500, dejaClassifies: 0, enAttente: 500 },
      50,
    );
    expect(summary).toEqual({
      percentComplete: 0,
      estimatedRuns: 10,
      batchSize: 50,
    });
  });

  it("plafonne le pourcentage à 100 si déjà classifiés > sans dossier", () => {
    const summary = computeClassifyProgressSummary({
      scrutinsSansDossier: 100,
      dejaClassifies: 150,
      enAttente: 0,
    });
    expect(summary?.percentComplete).toBe(100);
  });
});
