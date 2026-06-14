/**
 * CLI : valide la structure des revendications thématiques sourcées (core).
 */

import {
  REVENDICATIONS_THEMATIQUES,
  validateRevendicationsThematiques,
} from "@open-hemicycle/core";

export async function validateRevendications(): Promise<void> {
  const issues = validateRevendicationsThematiques(REVENDICATIONS_THEMATIQUES);

  if (issues.length === 0) {
    console.log(
      `[validate:revendications] OK — ${REVENDICATIONS_THEMATIQUES.length} député(s), structure conforme`,
    );
    return;
  }

  console.error(`[validate:revendications] ${issues.length} problème(s) :\n`);
  for (const issue of issues) {
    console.error(`  • ${issue.path}: ${issue.message}`);
  }
  process.exitCode = 1;
}
