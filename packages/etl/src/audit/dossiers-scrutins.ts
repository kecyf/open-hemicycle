/**
 * Audit hors-ligne : dossiers législatifs liés à au moins un scrutin nominatif.
 * Ne requiert pas DATABASE_URL — lit les dumps AN dans data/raw.
 */

import { readdir } from "node:fs/promises";
import path from "node:path";
import { resolveRawDir } from "../lib/download.ts";
import { anText, readJson } from "../lib/json.ts";

export interface DossierScrutinRow {
  uid: string;
  nbScrutins: number;
  titre: string;
}

/** Liste les dossiers porteurs de scrutins, triés par volume décroissant. */
export async function listDossiersAvecScrutins(): Promise<DossierScrutinRow[]> {
  const rawDir = resolveRawDir();
  const scrutinsJsonDir = path.join(rawDir, "scrutins", "json");
  const dossiersJsonDir = path.join(rawDir, "dossiers-legislatifs", "json", "dossierParlementaire");

  const scrutinFiles = (await readdir(scrutinsJsonDir)).filter((f) => f.endsWith(".json"));
  const dossierCounts = new Map<string, number>();

  for (const f of scrutinFiles) {
    const raw = (await readJson(path.join(scrutinsJsonDir, f))) as {
      scrutin?: { objet?: { dossierLegislatif?: { dossierRef?: unknown } } };
    };
    const ref = anText(raw?.scrutin?.objet?.dossierLegislatif?.dossierRef);
    if (ref) dossierCounts.set(ref, (dossierCounts.get(ref) ?? 0) + 1);
  }

  const titles = new Map<string, string>();
  const dfiles = (await readdir(dossiersJsonDir)).filter((f) => f.endsWith(".json"));
  for (const f of dfiles) {
    const raw = (await readJson(path.join(dossiersJsonDir, f))) as {
      dossierParlementaire?: { uid?: unknown; titreDossier?: { titre?: unknown } };
    };
    const dp = raw?.dossierParlementaire;
    const uid = anText(dp?.uid);
    const titre = anText(dp?.titreDossier?.titre);
    if (uid && titre) titles.set(uid, titre);
  }

  return [...dossierCounts.entries()]
    .map(([uid, nbScrutins]) => ({
      uid,
      nbScrutins,
      titre: titles.get(uid) ?? "???",
    }))
    .sort((a, b) => b.nbScrutins - a.nbScrutins);
}

export async function auditDossiersScrutins(): Promise<void> {
  const rows = await listDossiersAvecScrutins();
  const totalScrutins = rows.reduce((s, r) => s + r.nbScrutins, 0);

  console.log(`\n[audit:dossiers-scrutins] Dossiers porteurs de votes : ${rows.length}`);
  console.log(`[audit:dossiers-scrutins] Scrutins liés à un dossier : ${totalScrutins}\n`);

  for (const r of rows) {
    console.log(`${String(r.nbScrutins).padStart(4)}  ${r.uid}  |  ${r.titre}`);
  }
  console.log("");
}
