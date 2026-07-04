/**
 * Compteurs backlog classification LLM (scrutins sans dossier législatif).
 * Partagé entre ETL (`classify:stats`) et l'admin superviseur.
 */

import { and, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "./client.ts";
import { scrutins, scrutinsClassifications } from "./schema.ts";

export interface ClassifyBacklogStats {
  promptVersion: string;
  scrutinsSansDossier: number;
  dejaClassifies: number;
  enAttente: number;
}

/** Calcule le backlog restant (jamais négatif). */
export function computeClassifyBacklog(
  scrutinsSansDossier: number,
  dejaClassifies: number,
): Pick<ClassifyBacklogStats, "enAttente"> {
  return {
    enAttente: Math.max(0, scrutinsSansDossier - dejaClassifies),
  };
}

/** Compteurs pour piloter l'extension classify (sans dossier législatif). */
export async function getClassifyBacklogStats(
  promptVersion: string = "v1",
): Promise<ClassifyBacklogStats> {
  const db = getDb();

  const [sansDossierRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(scrutins)
    .where(isNull(scrutins.dossierId));

  const [dejaRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(scrutins)
    .innerJoin(
      scrutinsClassifications,
      and(
        eq(scrutinsClassifications.scrutinId, scrutins.id),
        eq(scrutinsClassifications.promptVersion, promptVersion),
      ),
    )
    .where(isNull(scrutins.dossierId));

  const scrutinsSansDossier = sansDossierRow?.count ?? 0;
  const dejaClassifies = dejaRow?.count ?? 0;
  const { enAttente } = computeClassifyBacklog(scrutinsSansDossier, dejaClassifies);

  return {
    promptVersion,
    scrutinsSansDossier,
    dejaClassifies,
    enAttente,
  };
}
