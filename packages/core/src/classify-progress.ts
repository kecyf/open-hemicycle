/**
 * Indicateurs de progression pour l'extension classify (scrutins sans dossier).
 * Logique pure — pilotage admin / ETL, jamais de jugement nominatif.
 */

export interface ClassifyBacklogCounts {
  scrutinsSansDossier: number;
  dejaClassifies: number;
  enAttente: number;
}

export interface ClassifyProgressSummary {
  /** Part des scrutins sans dossier déjà classifiés (prompt courant), 0–100. */
  percentComplete: number;
  /** Runs `classify:scrutins` estimés pour vider le backlog restant. */
  estimatedRuns: number;
  batchSize: number;
}

const DEFAULT_BATCH_SIZE = 100;

/** Résumé de progression à partir des compteurs backlog. */
export function computeClassifyProgressSummary(
  backlog: ClassifyBacklogCounts,
  batchSize: number = DEFAULT_BATCH_SIZE,
): ClassifyProgressSummary | null {
  if (backlog.scrutinsSansDossier <= 0) return null;

  const ratio = backlog.dejaClassifies / backlog.scrutinsSansDossier;
  const percentComplete = Math.min(100, Math.round(ratio * 100));
  const safeBatch = Math.max(1, Math.floor(batchSize));
  const estimatedRuns =
    backlog.enAttente <= 0 ? 0 : Math.ceil(backlog.enAttente / safeBatch);

  return {
    percentComplete,
    estimatedRuns,
    batchSize: safeBatch,
  };
}
