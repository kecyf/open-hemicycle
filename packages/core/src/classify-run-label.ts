/**
 * Libellés compacts pour l'historique des runs classify (admin).
 */

import type { ClassifyDispatchInputs } from "./classify-dispatch.ts";

/** Chaîne lisible des paramètres workflow_dispatch. */
export function formatClassifyRunInputsLabel(inputs: ClassifyDispatchInputs): string {
  const parts = [`limit=${inputs.limit}`, `delay_ms=${inputs.delayMs}`];
  if (inputs.dryRun) parts.push("dry_run");
  return parts.join(", ");
}
