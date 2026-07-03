import { describe, expect, it } from "vitest";
import { computeClassifyBacklog } from "./classify-scrutins.ts";

describe("computeClassifyBacklog", () => {
  it("calcule en_attente = sans_dossier - classifiés", () => {
    expect(computeClassifyBacklog(7150, 650)).toEqual({ enAttente: 6500 });
  });

  it("ne retourne jamais un backlog négatif", () => {
    expect(computeClassifyBacklog(100, 150)).toEqual({ enAttente: 0 });
  });

  it("gère le cas zéro", () => {
    expect(computeClassifyBacklog(0, 0)).toEqual({ enAttente: 0 });
  });
});
