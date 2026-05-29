#!/usr/bin/env tsx
/**
 * CLI ETL — Open Hémicycle.
 *
 * Commandes :
 *   sources         Liste le catalogue des jeux de données AN.
 *   check           Vérifie l'accessibilité (HTTP HEAD) des jeux "core".
 *
 * Les commandes d'ingestion réelle (download, parse, load) seront ajoutées
 * en Phase 1 (voir tasks/BACKLOG.md). Ce CLI est volontairement sans
 * dépendance lourde pour rester exécutable tôt.
 */

import { AN_DATASETS, AN_DAILY_PUBLICATION_INDEX, datasetUrl } from "./sources.ts";

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

async function main(): Promise<void> {
  const cmd = process.argv[2] ?? "sources";
  switch (cmd) {
    case "sources":
      listSources();
      break;
    case "check":
      await checkSources();
      break;
    default:
      console.error(`Commande inconnue: ${cmd}\nUsage: oh-etl [sources|check]`);
      process.exit(1);
  }
}

void main();
