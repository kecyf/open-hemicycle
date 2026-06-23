import { describe, expect, it } from "vitest";
import { THEMES_TAXONOMIE } from "@open-hemicycle/core";
import {
  buildClassificationPrompt,
  CLASSIFICATION_MODEL_DEFAULT,
  getPromptMetadata,
} from "./prompt-v1.ts";

describe("buildClassificationPrompt", () => {
  it("inclut les 8 slugs taxonomie dans le message utilisateur", () => {
    const prompt = buildClassificationPrompt({
      titre: "Loi de finances pour 2025",
      objet: "Première partie",
    });

    expect(prompt.promptVersion).toBe("v1");
    for (const theme of THEMES_TAXONOMIE) {
      expect(prompt.user).toContain(theme.slug);
    }
    expect(prompt.user).toContain("Loi de finances pour 2025");
    expect(prompt.user).toContain("Première partie");
    expect(prompt.system).toContain("JSON valide");
  });

  it("omet le bloc objet si absent", () => {
    const prompt = buildClassificationPrompt({ titre: "Motion de censure" });
    expect(prompt.user).not.toContain("Objet officiel");
  });
});

describe("getPromptMetadata", () => {
  it("expose le modèle par défaut et le nombre de thèmes", () => {
    const meta = getPromptMetadata();
    expect(meta.modelDefault).toBe(CLASSIFICATION_MODEL_DEFAULT);
    expect(meta.themeCount).toBe(THEMES_TAXONOMIE.length);
    expect(meta.promptVersion).toBe("v1");
  });
});
