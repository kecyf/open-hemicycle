#!/usr/bin/env tsx
/**
 * CLI ETL — Open Hémicycle.
 *
 * Commandes :
 *   sources           Liste le catalogue des jeux de données AN.
 *   check             Vérifie l'accessibilité (HTTP HEAD) des jeux "core".
 *   download          Télécharge + décompresse les jeux "core" dans data/raw/.
 *   ingest:deputes    Importe députés + groupes + affiliations (AMO10).
 *   ingest:acteurs-historique  Complète les députés non actifs (AMO30).
 *   backfill:votes    Ré-insère les votes manquants (après AMO30).
 *   ingest:dossiers   Importe les dossiers législatifs.
 *   ingest:scrutins   Importe scrutins + votes individuels (+ lien dossier, sort).
 *   seed:themes       (Re)pose la classification thématique des dossiers (fichier versionné).
 *   ingest:all        Enchaîne deputes, dossiers, scrutins, themes, puis activite.
 *   job:activite      (Re)calcule la table activite_journaliere (heatmap).
 *   stats             Affiche les compteurs DB (députés, scrutins, votes).
 *   validate:nosdeputes  Cross-check effectifs + échantillon vs NosDéputés.fr.
 *   audit:dossiers-scrutins  Liste les dossiers liés à des scrutins (hors-ligne, dumps AN).
 *
 * Les commandes d'ingestion nécessitent DATABASE_URL (voir .env.example).
 */

import { sql } from "drizzle-orm";
import { getDb } from "@open-hemicycle/db";
import { AN_DATASETS, AN_DAILY_PUBLICATION_INDEX, datasetUrl } from "./sources.ts";
import { downloadDataset } from "./lib/download.ts";
import { importDeputes } from "./import/deputes.ts";
import { importActeursHistorique } from "./import/acteurs-historique.ts";
import { importDossiers } from "./import/dossiers.ts";
import { importScrutins, backfillVotes } from "./import/scrutins.ts";
import { seedThemes } from "./import/themes.ts";
import { computeActiviteJournaliere } from "./jobs/activite.ts";
import { validateNosdeputes } from "./validate/nosdeputes.ts";
import { auditDossiersScrutins } from "./audit/dossiers-scrutins.ts";

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

interface DbStats {
  deputes: number;
  scrutins: number;
  votes: number;
}

async function fetchDbStats(): Promise<DbStats> {
  const db = getDb();
  const [deputes, scrutins, votes] = await Promise.all([
    db.execute(sql`SELECT count(*)::int AS c FROM deputes`),
    db.execute(sql`SELECT count(*)::int AS c FROM scrutins`),
    db.execute(sql`SELECT count(*)::int AS c FROM votes`),
  ]);
  const row = (r: unknown) => (r as Array<{ c: number }>)[0]?.c ?? 0;
  return {
    deputes: row(deputes),
    scrutins: row(scrutins),
    votes: row(votes),
  };
}

async function printDbStats(label: string): Promise<DbStats> {
  const stats = await fetchDbStats();
  console.log(`[stats:${label}] députés=${stats.deputes} scrutins=${stats.scrutins} votes=${stats.votes}`);
  return stats;
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
    case "ingest:acteurs-historique":
      await importActeursHistorique(LEGISLATURE);
      break;
    case "backfill:votes":
      await backfillVotes(LEGISLATURE);
      break;
    case "ingest:dossiers":
      await importDossiers(LEGISLATURE);
      break;
    case "ingest:scrutins":
      await importScrutins(LEGISLATURE);
      break;
    case "seed:themes":
      await seedThemes();
      break;
    case "ingest:all":
      await importDeputes(LEGISLATURE);
      await importDossiers(LEGISLATURE);
      await importScrutins(LEGISLATURE);
      await seedThemes();
      await computeActiviteJournaliere();
      break;
    case "job:activite":
      await computeActiviteJournaliere();
      break;
    case "stats":
      await printDbStats("now");
      break;
    case "validate:nosdeputes":
      await validateNosdeputes();
      break;
    case "audit:dossiers-scrutins":
      await auditDossiersScrutins();
      break;
    default:
      console.error(
        `Commande inconnue: ${cmd}\nUsage: oh-etl [sources|check|download|ingest:deputes|ingest:acteurs-historique|backfill:votes|ingest:dossiers|ingest:scrutins|seed:themes|ingest:all|job:activite|stats|validate:nosdeputes|audit:dossiers-scrutins]`,
      );
      process.exit(1);
  }
  process.exit(0);
}

void main();
