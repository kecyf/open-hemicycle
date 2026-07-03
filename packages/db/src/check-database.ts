/**
 * Diagnostic rapide de DATABASE_URL (format, auth, tables clés).
 * Partagé entre ETL (`check:db`) et l'admin superviseur.
 */

import { sql } from "drizzle-orm";
import { getDb } from "./client.ts";

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
  classificationsCount?: number;
  /** DELETE sur affiliations_groupe (requis pour ingest:deputes / cron ETL). */
  ohAgentEtlGrantsOk?: boolean;
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
    const ping = await db.execute(sql`SELECT now() AS t, current_user AS u`);
    const user = firstRow<{ u: string }>(ping)?.u;

    const scrutins = await db.execute(sql`SELECT count(*)::int AS c FROM scrutins`);
    const scrutinsCount = firstRow<{ c: number }>(scrutins)?.c ?? 0;

    let scrutinsClassificationsTable = false;
    let classificationsCount: number | undefined;
    try {
      const classif = await db.execute(
        sql`SELECT count(*)::int AS c FROM scrutins_classifications`,
      );
      scrutinsClassificationsTable = true;
      classificationsCount = firstRow<{ c: number }>(classif)?.c ?? 0;
    } catch {
      scrutinsClassificationsTable = false;
    }

    let ohAgentEtlGrantsOk: boolean | undefined;
    if (user === "oh_agent") {
      const grants = await db.execute(sql`
        SELECT count(*)::int AS c FROM information_schema.table_privileges
        WHERE grantee = 'oh_agent' AND table_schema = 'public'
          AND table_name = 'affiliations_groupe' AND privilege_type = 'DELETE'
      `);
      ohAgentEtlGrantsOk = (firstRow<{ c: number }>(grants)?.c ?? 0) > 0;
    }

    return {
      ok: true,
      formatOk: true,
      connected: true,
      user,
      scrutinsCount,
      scrutinsClassificationsTable,
      classificationsCount,
      ohAgentEtlGrantsOk,
    };
  } catch (err) {
    const message = (err as Error).message;
    const hint = message.includes("password authentication failed")
      ? " — copier la chaîne .env.oh_agent depuis GitHub Actions Secrets (ETL Refresh vert) vers Cursor Cloud Agents ; rôle oh_agent, pas postgres"
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
