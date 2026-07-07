/**
 * Parse la ligne stdout de `classify:stats` (workflow GH Actions, ETL).
 * Logique pure — alignée sur `printClassifyScrutinsStats` dans l'ETL.
 */

import type { ClassifyBacklogCounts } from "./classify-progress.ts";

const STATS_LINE_RE =
  /\[classify:stats\]\s+prompt=(\S+)\s+sans_dossier=(\d+)\s+classifiés=(\d+)\s+en_attente=(\d+)/u;

export interface ParsedClassifyStatsLine extends ClassifyBacklogCounts {
  promptVersion: string;
}

/** Extrait les compteurs backlog depuis une ligne `[classify:stats] …`. */
export function parseClassifyStatsLine(line: string): ParsedClassifyStatsLine | null {
  const trimmed = line.trim();
  const match = STATS_LINE_RE.exec(trimmed);
  if (!match) return null;

  const [, promptVersion, sansDossier, dejaClassifies, enAttente] = match;
  if (!promptVersion || !sansDossier || !dejaClassifies || !enAttente) return null;

  return {
    promptVersion,
    scrutinsSansDossier: Number.parseInt(sansDossier, 10),
    dejaClassifies: Number.parseInt(dejaClassifies, 10),
    enAttente: Number.parseInt(enAttente, 10),
  };
}
