/**
 * Téléchargement + décompression des dumps de l'Assemblée nationale.
 *
 * Les dumps sont écrits dans DATA_RAW_DIR (jamais commité, voir .gitignore).
 * Par défaut, un dump déjà présent et récent (< maxAgeHours) n'est pas
 * re-téléchargé, pour des itérations rapides.
 */

import { mkdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import AdmZip from "adm-zip";
import { type AnDataset, datasetUrl } from "../sources.ts";

const RAW_DIR = process.env.DATA_RAW_DIR ?? "./data/raw";

export interface DownloadResult {
  /** Répertoire où le zip a été décompressé. */
  dir: string;
  /** Vrai si on a réutilisé un cache local. */
  fromCache: boolean;
}

async function isFresh(file: string, maxAgeHours: number): Promise<boolean> {
  if (!existsSync(file)) return false;
  const { mtimeMs } = await stat(file);
  return Date.now() - mtimeMs < maxAgeHours * 3_600_000;
}

export async function downloadDataset(
  dataset: AnDataset,
  legislature: string,
  opts: { maxAgeHours?: number } = {},
): Promise<DownloadResult> {
  const maxAgeHours = opts.maxAgeHours ?? 6;
  const zipPath = path.join(RAW_DIR, `${dataset.id}.zip`);
  const outDir = path.join(RAW_DIR, dataset.id);

  if ((await isFresh(zipPath, maxAgeHours)) && existsSync(outDir)) {
    return { dir: outDir, fromCache: true };
  }

  const url = datasetUrl(dataset, legislature);
  await mkdir(RAW_DIR, { recursive: true });

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Téléchargement échoué (${res.status}) : ${url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(zipPath, buf);

  const zip = new AdmZip(buf);
  zip.extractAllTo(outDir, /* overwrite */ true);

  return { dir: outDir, fromCache: false };
}
