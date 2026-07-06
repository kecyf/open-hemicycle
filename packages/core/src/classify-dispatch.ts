/**
 * Paramètres du workflow GitHub Actions « Classify Scrutins (LLM) ».
 * Validation pure — pilotage admin, pas de jugement nominatif.
 */

export interface ClassifyDispatchInputs {
  limit: number;
  delayMs: number;
  dryRun: boolean;
}

export interface ClassifyDispatchValidation {
  ok: true;
  inputs: ClassifyDispatchInputs;
}

export interface ClassifyDispatchValidationError {
  ok: false;
  error: string;
}

export type ClassifyDispatchResult =
  | ClassifyDispatchValidation
  | ClassifyDispatchValidationError;

const DEFAULT_LIMIT = 100;
const DEFAULT_DELAY_MS = 500;
const MAX_LIMIT = 500;
const MAX_DELAY_MS = 10_000;

function parsePositiveInt(
  value: unknown,
  fallback: number,
  max: number,
  field: string,
): number | ClassifyDispatchValidationError {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  const n = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (!Number.isFinite(n) || n < 1) {
    return { ok: false, error: `${field} doit être un entier ≥ 1.` };
  }
  if (n > max) {
    return { ok: false, error: `${field} ne peut pas dépasser ${max}.` };
  }
  return Math.floor(n);
}

/** Valide les entrées workflow_dispatch (aligné sur classify-scrutins.yml). */
export function parseClassifyDispatchInputs(raw: {
  limit?: unknown;
  delayMs?: unknown;
  dryRun?: unknown;
}): ClassifyDispatchResult {
  const limitResult = parsePositiveInt(raw.limit, DEFAULT_LIMIT, MAX_LIMIT, "limit");
  if (typeof limitResult !== "number") return limitResult;

  const delayResult = parsePositiveInt(
    raw.delayMs,
    DEFAULT_DELAY_MS,
    MAX_DELAY_MS,
    "delay_ms",
  );
  if (typeof delayResult !== "number") return delayResult;

  const dryRun = raw.dryRun === true || raw.dryRun === "true";

  return {
    ok: true,
    inputs: {
      limit: limitResult,
      delayMs: delayResult,
      dryRun,
    },
  };
}
