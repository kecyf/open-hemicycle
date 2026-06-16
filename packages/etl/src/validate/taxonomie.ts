/**
 * Commande CLI : validation de la taxonomie thématique (sans DB).
 */

import { validateThemeTaxonomie } from "@open-hemicycle/core";

export function validateTaxonomie(): void {
  const issues = validateThemeTaxonomie();
  if (issues.length === 0) {
    console.log("\n[validate:taxonomie] OK — taxonomie valide (8 commissions permanentes AN)\n");
    return;
  }
  console.error(`\n[validate:taxonomie] ${issues.length} problème(s) :\n`);
  for (const i of issues) {
    console.error(`  • ${i.path}: ${i.message}`);
  }
  console.error("");
  process.exit(1);
}
