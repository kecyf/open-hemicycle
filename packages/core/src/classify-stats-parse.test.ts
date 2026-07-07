import { describe, expect, it } from "vitest";
import { parseClassifyStatsLine } from "./classify-stats-parse.ts";

describe("parseClassifyStatsLine", () => {
  it("parse la ligne stdout classify:stats", () => {
    expect(
      parseClassifyStatsLine(
        "[classify:stats] prompt=v1 sans_dossier=7150 classifiés=650 en_attente=6500",
      ),
    ).toEqual({
      promptVersion: "v1",
      scrutinsSansDossier: 7150,
      dejaClassifies: 650,
      enAttente: 6500,
    });
  });

  it("accepte des espaces autour", () => {
    expect(
      parseClassifyStatsLine(
        "  [classify:stats] prompt=v1 sans_dossier=100 classifiés=10 en_attente=90  ",
      ),
    ).toEqual({
      promptVersion: "v1",
      scrutinsSansDossier: 100,
      dejaClassifies: 10,
      enAttente: 90,
    });
  });

  it("retourne null si format invalide", () => {
    expect(parseClassifyStatsLine("backlog: 6500 restants")).toBeNull();
    expect(parseClassifyStatsLine("")).toBeNull();
  });
});
