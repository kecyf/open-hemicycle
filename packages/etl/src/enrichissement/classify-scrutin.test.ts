import { describe, expect, it } from "vitest";
import { classifyScrutin } from "./classify-scrutin.ts";

describe("classifyScrutin", () => {
  it("retourne non-classe en dry-run sans appel réseau", async () => {
    const out = await classifyScrutin(
      {
        uidAn: "VTANR5L17V999",
        titre: "Scrutin public sur un texte de loi",
        objet: "Objet test",
      },
      { dryRun: true },
    );

    expect(out.dryRun).toBe(true);
    expect(out.result.status).toBe("non-classe");
    expect(out.result.themeSlug).toBeNull();
    expect(out.result.justification).toBe("dry-run");
    expect(out.promptVersion).toBe("v1");
  });
});
