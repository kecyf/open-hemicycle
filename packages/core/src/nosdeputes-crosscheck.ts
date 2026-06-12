/**
 * Comparaisons factuelles pour le cross-check NosDéputés (docs/data-sources.md).
 *
 * Logique pure — sans réseau ni base. L'ETL charge les données et appelle ces fonctions.
 */

/** Identifiant AN (PA*) à partir du champ `id_an` de NosDéputés (numérique). */
export function uidAnFromNosdeputesId(idAn: number | string): string {
  const digits = String(idAn).replace(/\D/g, "");
  return `PA${digits}`;
}

export interface EffectifGroupe {
  sigle: string;
  count: number;
}

export interface EffectifMismatch {
  sigle: string;
  ours: number | null;
  theirs: number | null;
}

/** Compare les effectifs par sigle de groupe (députés en mandat). */
export function compareGroupEffectifs(
  ours: EffectifGroupe[],
  theirs: EffectifGroupe[],
): { matches: EffectifGroupe[]; mismatches: EffectifMismatch[] } {
  const mapOurs = new Map(ours.map((r) => [r.sigle, r.count]));
  const mapTheirs = new Map(theirs.map((r) => [r.sigle, r.count]));
  const sigles = new Set([...mapOurs.keys(), ...mapTheirs.keys()]);

  const matches: EffectifGroupe[] = [];
  const mismatches: EffectifMismatch[] = [];

  for (const sigle of [...sigles].sort()) {
    const o = mapOurs.get(sigle) ?? null;
    const t = mapTheirs.get(sigle) ?? null;
    if (o !== null && t !== null && o === t) {
      matches.push({ sigle, count: o });
    } else {
      mismatches.push({ sigle, ours: o, theirs: t });
    }
  }

  return { matches, mismatches };
}

export interface DeputeCrossCheckRow {
  uidAn: string;
  slug?: string;
  foundInNosdeputes: boolean;
  ourGroupeSigle: string | null;
  theirGroupeSigle: string | null;
  ourVoteCount: number;
  theirVoteCount: number | null;
}

export interface DeputeCrossCheckSummary {
  matched: number;
  groupeMismatch: number;
  voteCountMismatch: number;
  missingInNosdeputes: number;
}

const DEFAULT_VOTE_TOLERANCE = 0;

/** Résume les écarts nominatifs (groupe courant + nombre de votes enregistrés). */
export function summarizeDeputeCrossCheck(
  rows: DeputeCrossCheckRow[],
  voteTolerance = DEFAULT_VOTE_TOLERANCE,
): DeputeCrossCheckSummary {
  let groupeMismatch = 0;
  let voteCountMismatch = 0;
  let missingInNosdeputes = 0;
  let matched = 0;

  for (const row of rows) {
    if (!row.foundInNosdeputes) {
      missingInNosdeputes++;
      continue;
    }

    const groupeOk =
      row.ourGroupeSigle === null ||
      row.theirGroupeSigle === null ||
      row.ourGroupeSigle === row.theirGroupeSigle;
    const votesOk =
      row.theirVoteCount === null ||
      Math.abs(row.ourVoteCount - row.theirVoteCount) <= voteTolerance;

    if (!groupeOk) groupeMismatch++;
    if (!votesOk) voteCountMismatch++;
    if (groupeOk && votesOk) matched++;
  }

  return { matched, groupeMismatch, voteCountMismatch, missingInNosdeputes };
}

/** Agrège les effectifs par sigle à partir d'une liste (député → sigle). */
export function aggregateEffectifsBySigle(
  rows: Array<{ groupeSigle: string | null }>,
): EffectifGroupe[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    if (!row.groupeSigle) continue;
    counts.set(row.groupeSigle, (counts.get(row.groupeSigle) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([sigle, count]) => ({ sigle, count }))
    .sort((a, b) => b.count - a.count);
}
