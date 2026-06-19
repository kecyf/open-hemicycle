/**
 * Diagnostic rapide de DATABASE_URL (format, auth, tables clés).
 * Utilisé au standup cloud pour détecter tôt un secret invalide.
 */

import { sql } from "drizzle-orm";
import { getDb } from "@open-hemicycle/db";

function firstRow<T>(result: unknown): T | undefined {
  return (result as T[])[0];
}

export interface DbCheckResult {
  ok: boolean;
  formatOk: boolean;
  connected: boolean;
  user?: string;
  scrutinsCount?: number;
  scrutinsClassificationsTable: boolean;
  error?: string;
}

export async function checkDatabase(): Promise<DbCheckResult> {
  const url = process.env.DATABASE_URL ?? "";
  const formatOk = url.startsWith("postgresql://") || url.startsWith("postgres://");

  if (!formatOk) {
    return {
      ok: false,
      formatOk: false,
      connected: false,
      scrutinsClassificationsTable: false,
      error: "DATABASE_URL absent ou format invalide (attendu postgresql://… pooler Supabase)",
    };
  }

  try {
    const db = getDb();
    const ping = await db.execute(
      sql`SELECT now() AS t, current_user AS u`,
    );
    const user = firstRow<{ u: string }>(ping)?.u;

    const scrutins = await db.execute(sql`SELECT count(*)::int AS c FROM scrutins`);
    const scrutinsCount = firstRow<{ c: number }>(scrutins)?.c ?? 0;

    let scrutinsClassificationsTable = false;
    try {
      const cls = await db.execute(
        sql`SELECT count(*)::int AS c FROM scrutins_classifications`,
      );
      scrutinsClassificationsTable = true;
      void cls;
    } catch {
      scrutinsClassificationsTable = false;
    }

    return {
      ok: true,
      formatOk: true,
      connected: true,
      user,
      scrutinsCount,
      scrutinsClassificationsTable,
    };
  } catch (err) {
    const message = (err as Error).message;
    const hint = message.includes("password authentication failed")
      ? " — vérifier le mot de passe et le rôle (oh_agent recommandé en cloud, pas postgres)"
      : message.includes("scrutins_classifications")
        ? " — migration 0001 non appliquée (HITL)"
        : "";
    return {
      ok: false,
      formatOk: true,
      connected: false,
      scrutinsClassificationsTable: false,
      error: message + hint,
    };
  }
}

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
