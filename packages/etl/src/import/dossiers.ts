/**
 * Import des dossiers législatifs (dump Dossiers_Legislatifs).
 *
 * Source : data.assemblee-nationale.fr — Dossiers_Legislatifs (un JSON par dossier
 * sous `json/dossierParlementaire/DLR5L17N*.json`).
 *
 * On ne charge que les dossiers de la législature visée. Le rattachement des
 * scrutins aux dossiers se fait côté import des scrutins (via objet.dossierLegislatif.dossierRef).
 */

import { readdir } from "node:fs/promises";
import path from "node:path";
import { sql } from "drizzle-orm";
import { getDb, dossiersLegislatifs, syncRuns } from "@open-hemicycle/db";
import { AN_DATASETS } from "../sources.ts";
import { downloadDataset } from "../lib/download.ts";
import { anText, readJson } from "../lib/json.ts";

const BATCH = 500;
const AN_DYN = "https://www.assemblee-nationale.fr/dyn";

interface DossierMeta {
  uidAn: string;
  titre: string;
  procedure: string | null;
  urlAn: string | null;
  legislature: number;
}

function parseDossier(raw: any, legNum: number): DossierMeta | null {
  const dp = raw?.dossierParlementaire;
  if (!dp) return null;
  const uidAn = anText(dp.uid);
  const titre = anText(dp.titreDossier?.titre);
  if (!uidAn || !titre) return null;
  const chemin = anText(dp.titreDossier?.titreChemin);
  return {
    uidAn,
    titre,
    procedure: anText(dp.procedureParlementaire?.libelle),
    urlAn: chemin ? `${AN_DYN}/${legNum}/dossiers/${chemin}` : null,
    legislature: legNum,
  };
}

export async function importDossiers(legislature: string): Promise<void> {
  const db = getDb();
  const legNum = Number(legislature);
  const started = new Date();
  console.log(`\n[dossiers] Import législature ${legislature}\n`);

  const dataset = AN_DATASETS.find((d) => d.id === "dossiers-legislatifs")!;
  const { dir, fromCache } = await downloadDataset(dataset, legislature);
  console.log(`[dossiers] Dump : ${dir} ${fromCache ? "(cache)" : "(téléchargé)"}`);

  const jsonDir = path.join(dir, "json", "dossierParlementaire");
  const files = (await readdir(jsonDir)).filter(
    (f) => f.startsWith(`DLR5L${legNum}`) && f.endsWith(".json"),
  );
  console.log(`[dossiers] Fichiers (lég. ${legislature}) : ${files.length}`);

  let buf: DossierMeta[] = [];
  let upserted = 0;
  const flush = async () => {
    if (!buf.length) return;
    await db
      .insert(dossiersLegislatifs)
      .values(
        buf.map((d) => ({
          uidAn: d.uidAn,
          titre: d.titre,
          procedure: d.procedure,
          urlAn: d.urlAn,
          legislature: d.legislature,
        })),
      )
      .onConflictDoUpdate({
        target: dossiersLegislatifs.uidAn,
        set: {
          titre: sql`excluded.titre`,
          procedure: sql`excluded.procedure`,
          urlAn: sql`excluded.url_an`,
        },
      });
    upserted += buf.length;
    buf = [];
  };

  for (const f of files) {
    const meta = parseDossier(await readJson(path.join(jsonDir, f)), legNum);
    if (meta) buf.push(meta);
    if (buf.length >= BATCH) await flush();
  }
  await flush();
  console.log(`[dossiers] Upsertés : ${upserted}`);

  await db.insert(syncRuns).values({
    dataset: "dossiers-legislatifs",
    startedAt: started,
    finishedAt: new Date(),
    recordsProcessed: files.length,
    errors: 0,
    notes: `${upserted} dossiers`,
  });
  console.log(`[dossiers] OK\n`);
}
