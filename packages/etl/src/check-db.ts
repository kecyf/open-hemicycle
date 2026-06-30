/**
 * CLI wrapper pour le diagnostic DATABASE_URL (logique partagée dans @open-hemicycle/db).
 */

import { checkDatabase } from "@open-hemicycle/db";

export type { DbCheckResult } from "@open-hemicycle/db";
export { checkDatabase } from "@open-hemicycle/db";

export async function runCheckDb(): Promise<void> {
  console.log("\n[check:db] diagnostic DATABASE_URL\n");
  const result = await checkDatabase();

  console.log(`  format URL     : ${result.formatOk ? "OK" : "KO"}`);
  console.log(`  connexion      : ${result.connected ? "OK" : "KO"}`);
  if (result.user) {
    console.log(`  rôle           : ${result.user}`);
  }
  if (result.scrutinsCount !== undefined) {
    console.log(`  scrutins       : ${result.scrutinsCount}`);
  }
  console.log(
    `  table classif. : ${result.scrutinsClassificationsTable ? "OK (migration appliquée)" : "absente (migration 0001 HITL)"}`,
  );

  if (!result.ok) {
    console.error(`\n[check:db] ÉCHEC — ${result.error}\n`);
    process.exit(1);
  }

  if (!result.scrutinsClassificationsTable) {
    console.warn(
      "\n[check:db] Connexion OK mais migration scrutins_classifications manquante — appliquer packages/db/drizzle/0001_scrutins_classifications.sql (HITL)\n",
    );
    process.exit(0);
  }

  console.log("\n[check:db] OK\n");
}
