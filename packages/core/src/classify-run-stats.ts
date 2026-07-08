/**
 * Agrégation des stats classify extraites des logs GitHub Actions (admin).
 */

import type { ParsedClassifyStatsLine } from "./classify-stats-parse.ts";
import { parseClassifyStatsLine } from "./classify-stats-parse.ts";

export interface ClassifyRunStatsPair {
  before: ParsedClassifyStatsLine | null;
  after: ParsedClassifyStatsLine | null;
}

export interface ClassifyRunDelta {
  newlyClassified: number;
  enAttenteAfter: number;
}

/** Extrait les lignes `[classify:stats]` d'un log job (avant = 1re, après = dernière). */
export function extractClassifyStatsFromLogs(logText: string): ClassifyRunStatsPair {
  const stats: ParsedClassifyStatsLine[] = [];
  for (const line of logText.split("\n")) {
    const parsed = parseClassifyStatsLine(line);
    if (parsed) stats.push(parsed);
  }
  if (stats.length === 0) return { before: null, after: null };
  if (stats.length === 1) return { before: stats[0] ?? null, after: null };
  return {
    before: stats[0] ?? null,
    after: stats[stats.length - 1] ?? null,
  };
}

/** Delta entre backlog avant/après un run classify (null si paire incomplète). */
export function computeClassifyRunDelta(
  before: ParsedClassifyStatsLine,
  after: ParsedClassifyStatsLine,
): ClassifyRunDelta {
  return {
    newlyClassified: after.dejaClassifies - before.dejaClassifies,
    enAttenteAfter: after.enAttente,
  };
}

/** Libellé compact pour l'historique admin. */
export function formatClassifyRunDeltaLabel(delta: ClassifyRunDelta): string {
  const sign = delta.newlyClassified >= 0 ? "+" : "";
  return `${sign}${delta.newlyClassified.toLocaleString("fr-FR")} classifiés · ${delta.enAttenteAfter.toLocaleString("fr-FR")} en attente`;
}

/** Durée lisible entre deux timestamps ISO (run GH Actions). */
export function formatWorkflowRunDuration(
  startIso: string,
  endIso: string | null | undefined,
): string | null {
  if (!endIso) return null;
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  if (ms < 0) return null;
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  if (minutes > 0) return `${minutes} min ${seconds} s`;
  return `${seconds} s`;
}
