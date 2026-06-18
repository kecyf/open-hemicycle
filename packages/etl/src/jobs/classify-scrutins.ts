/**
 * Persistance des classifications LLM en base (idempotent upsert).
 *
 * Nécessite DATABASE_URL + migration `scrutins_classifications` appliquée (HITL).
 */

import { eq, isNull, sql } from "drizzle-orm";
import {
  getDb,
  scrutins,
  scrutinsClassifications,
  syncRuns,
} from "@open-hemicycle/db";
import type { ClassificationResult } from "@open-hemicycle/core";
import { PROMPT_VERSION } from "@open-hemicycle/core";
import { classifyScrutin } from "../enrichissement/classify-scrutin.ts";

function confidenceToBasisPoints(confidence: number): number {
  return Math.round(Math.max(0, Math.min(1, confidence)) * 10_000);
}

export async function upsertScrutinClassification(
  scrutinId: string,
  model: string,
  promptVersion: string,
  result: ClassificationResult,
): Promise<void> {
  const db = getDb();
  await db
    .insert(scrutinsClassifications)
    .values({
      scrutinId,
      themeSlug: result.themeSlug,
      confidence: confidenceToBasisPoints(result.confidence),
      modelId: model,
      promptVersion,
      justification: result.justification ?? result.rejectReason ?? null,
    })
    .onConflictDoUpdate({
      target: [
        scrutinsClassifications.scrutinId,
        scrutinsClassifications.promptVersion,
      ],
      set: {
        themeSlug: result.themeSlug,
        confidence: confidenceToBasisPoints(result.confidence),
        modelId: model,
        justification: result.justification ?? result.rejectReason ?? null,
        classifiedAt: sql`now()`,
      },
    });
}

/** Classifie les scrutins sans dossier législatif (échantillon limité pour le pilote). */
export async function jobClassifyScrutinsSansDossier(opts?: {
  limit?: number;
  dryRun?: boolean;
}): Promise<void> {
  const db = getDb();
  const limit = opts?.limit ?? 50;
  const dryRun = opts?.dryRun ?? !process.env.OPENROUTER_API_KEY?.trim();

  const [run] = await db
    .insert(syncRuns)
    .values({ dataset: "classify-scrutins", notes: `limit=${limit} dryRun=${dryRun}` })
    .returning({ id: syncRuns.id });

  console.log(`\n[classify:scrutins] démarrage (limit=${limit}, dryRun=${dryRun})\n`);

  const rows = await db
    .select({
      id: scrutins.id,
      uidAn: scrutins.uidAn,
      titre: scrutins.titre,
      objet: scrutins.objet,
    })
    .from(scrutins)
    .where(isNull(scrutins.dossierId))
    .limit(limit);

  let processed = 0;
  let errors = 0;

  for (const row of rows) {
    if (!row.titre?.trim()) {
      console.warn(`[classify:scrutins] skip ${row.uidAn} — titre absent`);
      continue;
    }
    try {
      const out = await classifyScrutin(
        { uidAn: row.uidAn, titre: row.titre, objet: row.objet },
        { dryRun },
      );
      if (!dryRun) {
        await upsertScrutinClassification(
          row.id,
          out.model,
          out.promptVersion ?? PROMPT_VERSION,
          out.result,
        );
      }
      processed += 1;
      console.log(
        `[classify:scrutins] ${row.uidAn} → ${out.result.status} ${out.result.themeSlug ?? "—"}`,
      );
    } catch (err) {
      errors += 1;
      console.error(`[classify:scrutins] ERR ${row.uidAn}: ${(err as Error).message}`);
    }
  }

  await db
    .update(syncRuns)
    .set({
      finishedAt: sql`now()`,
      recordsProcessed: processed,
      errors,
    })
    .where(eq(syncRuns.id, run!.id));

  console.log(`\n[classify:scrutins] terminé — traités=${processed} erreurs=${errors}\n`);
}
