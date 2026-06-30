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
    try {
      await db.execute(sql`SELECT count(*)::int AS c FROM scrutins_classifications`);
      scrutinsClassificationsTable = true;
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
