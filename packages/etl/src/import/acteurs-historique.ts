/**
 * Import des acteurs historiques (dump AMO30) pour compléter les députés
 * absents du jeu AMO10 (députés non actifs / mandats terminés).
 *
 * Source : data.assemblee-nationale.fr — AMO30 (tous acteurs depuis la XIe législature).
 * Complément additif : n'écrase pas les affiliations/mandats gérés par AMO10.
 */

import { readdir } from "node:fs/promises";
import path from "node:path";
import { sql } from "drizzle-orm";
import {
  getDb,
  deputes,
  groupesPolitiques,
  affiliationsGroupe,
  mandats,
  syncRuns,
} from "@open-hemicycle/db";
import { AN_DATASETS } from "../sources.ts";
import { downloadDataset } from "../lib/download.ts";
import { arrayify, anText, readJson } from "../lib/json.ts";
import { slugify } from "../lib/slug.ts";
import { parseActeur, parseGroupe } from "./deputes.ts";

export async function importActeursHistorique(legislature: string): Promise<void> {
  const db = getDb();
  const legNum = Number(legislature);
  const started = new Date();
  console.log(`\n[acteurs-historique] Import complémentaire législature ${legislature}\n`);

  const dataset = AN_DATASETS.find((d) => d.id === "acteurs-historique")!;
  const { dir, fromCache } = await downloadDataset(dataset, legislature);
  console.log(`[acteurs-historique] Dump : ${dir} ${fromCache ? "(cache)" : "(téléchargé)"}`);

  const acteurDir = path.join(dir, "json", "acteur");
  const acteurFiles = (await readdir(acteurDir)).filter((f) => f.endsWith(".json"));

  const existingRows = await db.select({ uidAn: deputes.uidAn }).from(deputes);
  const existing = new Set(existingRows.map((r) => r.uidAn));

  const toImport: NonNullable<ReturnType<typeof parseActeur>>[] = [];
  for (const f of acteurFiles) {
    const parsed = parseActeur(await readJson(path.join(acteurDir, f)), legislature);
    if (!parsed?.assemblee) continue;
    if (existing.has(parsed.uidAn)) continue;
    toImport.push(parsed);
  }
  console.log(
    `[acteurs-historique] Députés lég. ${legislature} absents de la base : ${toImport.length}`,
  );
  if (!toImport.length) {
    await db.insert(syncRuns).values({
      dataset: "acteurs-historique",
      startedAt: started,
      finishedAt: new Date(),
      recordsProcessed: 0,
      errors: 0,
      notes: "Aucun député manquant",
    });
    console.log(`[acteurs-historique] Rien à importer\n`);
    return;
  }

  const gpRefs = new Set<string>();
  for (const a of toImport) for (const m of a.gpMandats) gpRefs.add(m.organeRef);

  const organeDir = path.join(dir, "json", "organe");
  const groupesParsed = [];
  for (const ref of gpRefs) {
    try {
      const g = parseGroupe(await readJson(path.join(organeDir, `${ref}.json`)));
      if (g) groupesParsed.push(g);
    } catch {
      // organe manquant → ignoré
    }
  }
  if (groupesParsed.length) {
    await db
      .insert(groupesPolitiques)
      .values(
        groupesParsed.map((g) => ({
          uidAn: g.uidAn,
          nom: g.nom,
          sigle: g.sigle,
          couleurHex: g.couleurHex,
          legislature: legNum,
        })),
      )
      .onConflictDoUpdate({
        target: groupesPolitiques.uidAn,
        set: {
          nom: sql`excluded.nom`,
          sigle: sql`excluded.sigle`,
          couleurHex: sql`excluded.couleur_hex`,
        },
      });
  }

  await db.insert(deputes).values(
    toImport.map((a) => ({
      uidAn: a.uidAn,
      prenom: a.prenom,
      nom: a.nom,
      slug: slugify(a.prenom, a.nom, a.uidAn),
      civilite: a.civilite,
      dateNaissance: a.dateNaissance,
      departement: a.departement,
      circonscription: a.circonscription,
      urlAn: a.urlAn,
    })),
  );

  const depRows = await db.select({ id: deputes.id, uidAn: deputes.uidAn }).from(deputes);
  const depId = new Map(depRows.map((r) => [r.uidAn, r.id]));
  const grpRows = await db
    .select({ id: groupesPolitiques.id, uidAn: groupesPolitiques.uidAn })
    .from(groupesPolitiques);
  const grpId = new Map(grpRows.map((r) => [r.uidAn, r.id]));

  const affRows: (typeof affiliationsGroupe.$inferInsert)[] = [];
  const mandatRows: (typeof mandats.$inferInsert)[] = [];
  for (const a of toImport) {
    const dId = depId.get(a.uidAn);
    if (!dId) continue;
    for (const m of a.gpMandats) {
      const gId = grpId.get(m.organeRef);
      if (gId && m.debut) {
        affRows.push({ deputeId: dId, groupeId: gId, validFrom: m.debut, validTo: m.fin });
      }
    }
    if (a.assemblee?.debut) {
      mandatRows.push({
        deputeId: dId,
        legislature: legNum,
        debut: a.assemblee.debut,
        fin: a.assemblee.fin,
        typeMandat: "ASSEMBLEE",
      });
    }
  }
  if (affRows.length) await db.insert(affiliationsGroupe).values(affRows);
  if (mandatRows.length) await db.insert(mandats).values(mandatRows);

  await db.insert(syncRuns).values({
    dataset: "acteurs-historique",
    startedAt: started,
    finishedAt: new Date(),
    recordsProcessed: toImport.length,
    errors: 0,
    notes: `${groupesParsed.length} groupes, ${affRows.length} affiliations, ${mandatRows.length} mandats`,
  });
  console.log(
    `[acteurs-historique] OK — ${toImport.length} députés · ${affRows.length} affiliations · ${mandatRows.length} mandats\n`,
  );
}
