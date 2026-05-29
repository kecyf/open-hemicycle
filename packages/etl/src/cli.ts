#!/usr/bin/env tsx
/**
 * CLI ETL — Open Hémicycle.
 *
 * Commandes :
 *   sources           Liste le catalogue des jeux de données AN.
 *   check             Vérifie l'accessibilité (HTTP HEAD) des jeux "core".
 *   download          Télécharge + décompresse les jeux "core" dans data/raw/.
 *   ingest:deputes    Importe députés + groupes + affiliations (AMO10).
 *   ingest:scrutins   Importe scrutins + votes individuels.
 *   ingest:all        Enchaîne deputes puis scrutins.
 *   job:activite      (Re)calcule la table activite_journaliere (heatmap).
 *
 * Les commandes d'ingestion nécessitent DATABASE_URL (voir .env.example).
 */

import { AN_DATASETS, AN_DAILY_PUBLICATION_INDEX, datasetUrl } from "./sources.ts";
import { downloadDataset } from "./lib/download.ts";
import { importDeputes } from "./import/deputes.ts";
import { importScrutins } from "./import/scrutins.ts";
import { computeActiviteJournaliere } from "./jobs/activite.ts";

const LEGISLATURE = process.env.AN_LEGISLATURE ?? "17";

function listSources(): void {
  console.log(`\nCatalogue des jeux de données AN (législature ${LEGISLATURE})\n`);
  console.log("Source primaire : data.assemblee-nationale.fr (Licence Ouverte Etalab 2.0)\n");
  for (const d of AN_DATASETS) {
    const tag = d.core ? "[core]" : "      ";
    console.log(`${tag} ${d.id.padEnd(22)} ${d.approxSize.padEnd(10)} ${d.format}`);
    console.log(`        ${datasetUrl(d, LEGISLATURE)}`);
  }
  console.log(`\nIndex publications du jour : ${AN_DAILY_PUBLICATION_INDEX}\n`);
}

async function checkSources(): Promise<void> {
  console.log(`\nVérification d'accessibilité (jeux core, législature ${LEGISLATURE})\n`);
  const core = AN_DATASETS.filter((d) => d.core);
  for (const d of core) {
    const url = datasetUrl(d, LEGISLATURE);
    try {
      const res = await fetch(url, { method: "HEAD" });
      const len = res.headers.get("content-length");
      const sizeMb = len ? `${(Number(len) / 1_048_576).toFixed(1)} Mo` : "?";
      console.log(`${res.ok ? "OK  " : "ERR "} ${res.status}  ${sizeMb.padStart(9)}  ${d.id}`);
    } catch (err) {
      console.log(`FAIL      ${d.id}  (${(err as Error).message})`);
    }
  }
  console.log("");
}

async function downloadCore(): Promise<void> {
  console.log(`\nTéléchargement des jeux core (législature ${LEGISLATURE})\n`);
  for (const d of AN_DATASETS.filter((x) => x.core)) {
    const { dir, fromCache } = await downloadDataset(d, LEGISLATURE);
    console.log(`${fromCache ? "cache " : "dl    "} ${d.id.padEnd(22)} -> ${dir}`);
  }
  console.log("");
}

async function main(): Promise<void> {
  const cmd = process.argv[2] ?? "sources";
  switch (cmd) {
    case "sources":
      listSources();
      break;
    case "check":
      await checkSources();
      break;
    case "download":
      await downloadCore();
      break;
    case "ingest:deputes":
      await importDeputes(LEGISLATURE);
      break;
    case "ingest:scrutins":
      await importScrutins(LEGISLATURE);
      break;
    case "ingest:all":
      await importDeputes(LEGISLATURE);
      await importScrutins(LEGISLATURE);
      await computeActiviteJournaliere();
      break;
    case "job:activite":
      await computeActiviteJournaliere();
      break;
    default:
      console.error(
        `Commande inconnue: ${cmd}\nUsage: oh-etl [sources|check|download|ingest:deputes|ingest:scrutins|ingest:all|job:activite]`,
      );
      process.exit(1);
  }
  process.exit(0);
}

void main();
