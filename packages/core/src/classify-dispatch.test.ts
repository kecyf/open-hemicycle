import { describe, expect, it } from "vitest";
import { parseClassifyDispatchInputs } from "./classify-dispatch.ts";

describe("parseClassifyDispatchInputs", () => {
  it("applique les valeurs par défaut", () => {
    const result = parseClassifyDispatchInputs({});
    expect(result).toEqual({
      ok: true,
      inputs: { limit: 100, delayMs: 500, dryRun: false },
    });
  });

  it("accepte des valeurs personnalisées", () => {
    const result = parseClassifyDispatchInputs({
      limit: 50,
      delayMs: 1000,
      dryRun: true,
    });
    expect(result).toEqual({
      ok: true,
      inputs: { limit: 50, delayMs: 1000, dryRun: true },
    });
  });

  it("parse dryRun depuis une chaîne", () => {
    const result = parseClassifyDispatchInputs({ dryRun: "true" });
    expect(result.ok && result.inputs.dryRun).toBe(true);
  });

  it("rejette limit invalide", () => {
    const result = parseClassifyDispatchInputs({ limit: 0 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("limit");
  });

  it("rejette limit au-delà du plafond", () => {
    const result = parseClassifyDispatchInputs({ limit: 501 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("500");
  });

  it("rejette delay_ms au-delà du plafond", () => {
    const result = parseClassifyDispatchInputs({ delayMs: 20_000 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("delay_ms");
  });
});
