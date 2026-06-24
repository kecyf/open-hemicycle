/**
 * Filtre scrutins ↔ thème : dossier législatif prioritaire, sinon classification LLM (4.8).
 *
 * Dégradation gracieuse si la migration `scrutins_classifications` n'est pas encore appliquée.
 */

import {
  CONFIDENCE_THRESHOLD,
  PROMPT_VERSION,
  confidenceToBasisPoints,
  resolveThemeSlugForDb,
} from "@open-hemicycle/core";
import { and, eq, gte, inArray, isNull, notInArray, or, sql } from "drizzle-orm";
import {
  getDb,
  dossiersThemes,
  scrutins,
  scrutinsClassifications,
  themes,
} from "@open-hemicycle/db";

const CONFIDENCE_THRESHOLD_BP = confidenceToBasisPoints(CONFIDENCE_THRESHOLD);

let classificationsTableAvailable: boolean | null = null;

/** Détecte une fois par process si la table LLM est présente (migration 0001 HITL). */
export async function hasScrutinsClassificationsTable(): Promise<boolean> {
  if (classificationsTableAvailable !== null) {
    return classificationsTableAvailable;
  }
  try {
    const db = getDb();
    await db.execute(sql`SELECT 1 FROM scrutins_classifications LIMIT 0`);
    classificationsTableAvailable = true;
  } catch {
    classificationsTableAvailable = false;
  }
  return classificationsTableAvailable;
}

/** Sous-requête : ids de dossiers rattachés à un thème (par slug pilote ou taxonomie). */
export function dossierIdsForTheme(slug: string) {
  const dbSlug = resolveThemeSlugForDb(slug);
  const db = getDb();
  return db
    .select({ id: dossiersThemes.dossierId })
    .from(dossiersThemes)
    .innerJoin(themes, eq(themes.id, dossiersThemes.themeId))
    .where(eq(themes.slug, dbSlug));
}

/** Sous-requête : dossiers ayant au moins un rattachement thématique (tout slug). */
function dossierIdsWithAnyThemeLink() {
  const db = getDb();
  return db.select({ id: dossiersThemes.dossierId }).from(dossiersThemes);
}

/** Condition Drizzle : scrutins rattachés au thème (dossier prioritaire sur LLM). */
export async function themeScrutinCondition(themeSlug: string) {
  const dbSlug = resolveThemeSlugForDb(themeSlug);
  const viaDossier = inArray(scrutins.dossierId, dossierIdsForTheme(dbSlug));

  if (!(await hasScrutinsClassificationsTable())) {
    return viaDossier;
  }

  const db = getDb();
  const viaLlm = and(
    inArray(
      scrutins.id,
      db
        .select({ id: scrutinsClassifications.scrutinId })
        .from(scrutinsClassifications)
        .where(
          and(
            eq(scrutinsClassifications.promptVersion, PROMPT_VERSION),
            eq(scrutinsClassifications.themeSlug, dbSlug),
            gte(scrutinsClassifications.confidence, CONFIDENCE_THRESHOLD_BP),
          ),
        ),
    ),
    or(
      isNull(scrutins.dossierId),
      notInArray(scrutins.dossierId, dossierIdsWithAnyThemeLink()),
    ),
  );

  return or(viaDossier, viaLlm);
}
