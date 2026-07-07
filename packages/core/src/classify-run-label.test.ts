import { describe, expect, it } from "vitest";
import { formatClassifyRunInputsLabel } from "./classify-run-label.ts";

describe("formatClassifyRunInputsLabel", () => {
  it("formate limit et delay_ms", () => {
    expect(
      formatClassifyRunInputsLabel({ limit: 100, delayMs: 500, dryRun: false }),
    ).toBe("limit=100, delay_ms=500");
  });

  it("ajoute dry_run si activé", () => {
    expect(
      formatClassifyRunInputsLabel({ limit: 5, delayMs: 1000, dryRun: true }),
    ).toBe("limit=5, delay_ms=1000, dry_run");
  });
});
