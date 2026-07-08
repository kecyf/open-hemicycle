import { describe, expect, it } from "vitest";
import {
  computeClassifyRunDelta,
  extractClassifyStatsFromLogs,
  formatClassifyRunDeltaLabel,
  formatWorkflowRunDuration,
} from "./classify-run-stats.ts";

describe("extractClassifyStatsFromLogs", () => {
  it("extrait avant et après depuis un log job", () => {
    const log = `
2026-07-08T10:00:00 Backlog avant
[classify:stats] prompt=v1 sans_dossier=7150 classifiés=650 en_attente=6500
... classify ...
2026-07-08T10:15:00 Backlog après
[classify:stats] prompt=v1 sans_dossier=7150 classifiés=747 en_attente=6453
`;
    expect(extractClassifyStatsFromLogs(log)).toEqual({
      before: {
        promptVersion: "v1",
        scrutinsSansDossier: 7150,
        dejaClassifies: 650,
        enAttente: 6500,
      },
      after: {
        promptVersion: "v1",
        scrutinsSansDossier: 7150,
        dejaClassifies: 747,
        enAttente: 6453,
      },
    });
  });

  it("retourne une seule entrée si une ligne stats", () => {
    const log = "[classify:stats] prompt=v1 sans_dossier=100 classifiés=10 en_attente=90";
    expect(extractClassifyStatsFromLogs(log)).toEqual({
      before: {
        promptVersion: "v1",
        scrutinsSansDossier: 100,
        dejaClassifies: 10,
        enAttente: 90,
      },
      after: null,
    });
  });

  it("retourne null si aucune ligne stats", () => {
    expect(extractClassifyStatsFromLogs("job terminé sans stats")).toEqual({
      before: null,
      after: null,
    });
  });
});

describe("computeClassifyRunDelta", () => {
  it("calcule le delta de classifications", () => {
    const before = {
      promptVersion: "v1",
      scrutinsSansDossier: 7150,
      dejaClassifies: 650,
      enAttente: 6500,
    };
    const after = {
      promptVersion: "v1",
      scrutinsSansDossier: 7150,
      dejaClassifies: 747,
      enAttente: 6453,
    };
    expect(computeClassifyRunDelta(before, after)).toEqual({
      newlyClassified: 97,
      enAttenteAfter: 6453,
    });
  });
});

describe("formatClassifyRunDeltaLabel", () => {
  it("formate le libellé FR", () => {
    const label = formatClassifyRunDeltaLabel({ newlyClassified: 97, enAttenteAfter: 6453 });
    expect(label).toContain("+97 classifiés");
    expect(label).toContain("en attente");
    expect(label).toMatch(/6.453/);
  });
});

describe("formatWorkflowRunDuration", () => {
  it("formate minutes et secondes", () => {
    expect(
      formatWorkflowRunDuration("2026-07-08T10:00:00Z", "2026-07-08T10:12:34Z"),
    ).toBe("12 min 34 s");
  });

  it("formate secondes seules", () => {
    expect(
      formatWorkflowRunDuration("2026-07-08T10:00:00Z", "2026-07-08T10:00:45Z"),
    ).toBe("45 s");
  });

  it("retourne null si fin absente", () => {
    expect(formatWorkflowRunDuration("2026-07-08T10:00:00Z", null)).toBeNull();
  });
});
