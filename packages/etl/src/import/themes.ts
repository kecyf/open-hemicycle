/**
 * Seed des thèmes + rattachement des dossiers (classification éditoriale).
 *
 * Idempotent : upsert des thèmes par slug, puis (ré)écriture des liens
 * dossier↔thème à partir de la liste versionnée packages/etl/src/data/themes.ts.
 * La source de vérité est ce fichier ; la base n'en est qu'une projection.
 */

import { eq, inArray } from "drizzle-orm";
import { THEME_SLUGS_PILOTE } from "@open-hemicycle/core";
import {
  getDb,
  themes as themesTable,
  dossiersThemes,
  dossiersLegislatifs,
} from "@open-hemicycle/db";
import { THEMES } from "../data/themes.ts";

export async function seedThemes(): Promise<void> {
  const db = getDb();
  console.log(`\n[themes] Seed de ${THEMES.length} thème(s)\n`);

  for (const t of THEMES) {
    const [theme] = await db
      .insert(themesTable)
      .values({ slug: t.slug, nom: t.nom, description: t.description })
      .onConflictDoUpdate({
        target: themesTable.slug,
        set: { nom: t.nom, description: t.description },
      })
      .returning({ id: themesTable.id });
    const themeId = theme!.id;

    // Résout les dossiers par uid AN.
    const dossiers = await db
      .select({ id: dossiersLegislatifs.id, uidAn: dossiersLegislatifs.uidAn })
      .from(dossiersLegislatifs)
      .where(inArray(dossiersLegislatifs.uidAn, t.dossiersUid));
    const foundUids = new Set(dossiers.map((d) => d.uidAn));
    const missing = t.dossiersUid.filter((u) => !foundUids.has(u));
    if (missing.length) {
      console.warn(`[themes] ⚠ ${t.slug} : dossiers introuvables : ${missing.join(", ")}`);
    }

    // Réécrit les liens de ce thème (source de vérité = fichier versionné).
    await db.delete(dossiersThemes).where(eq(dossiersThemes.themeId, themeId));
    if (dossiers.length) {
      await db
        .insert(dossiersThemes)
        .values(dossiers.map((d) => ({ dossierId: d.id, themeId })))
        .onConflictDoNothing();
    }
    console.log(`[themes] ${t.slug} → ${dossiers.length} dossier(s) rattaché(s)`);
  }

  // Détache les liens des slugs pilotes dépréciés (migration progressive, sans DELETE sur `themes`).
  for (const pilotSlug of THEME_SLUGS_PILOTE) {
    const [pilotTheme] = await db
      .select({ id: themesTable.id })
      .from(themesTable)
      .where(eq(themesTable.slug, pilotSlug))
      .limit(1);
    if (!pilotTheme) continue;
    await db.delete(dossiersThemes).where(eq(dossiersThemes.themeId, pilotTheme.id));
    console.log(`[themes] liens pilote déprécié détachés : ${pilotSlug}`);
  }

  console.log(`[themes] OK\n`);
}
