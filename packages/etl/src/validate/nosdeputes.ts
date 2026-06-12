/**
 * Cross-check nominatif Open Hémicycle ↔ NosDéputés.fr (tâche backlog 1.7).
 *
 * Compare effectifs par groupe et échantillon de députés en mandat (groupe + nb votes).
 * Source primaire OH = data.assemblee-nationale.fr ; NosDéputés = contrôle externe (ODbL).
 */

import { sql } from "drizzle-orm";
import {
  aggregateEffectifsBySigle,
  compareGroupEffectifs,
  summarizeDeputeCrossCheck,
  uidAnFromNosdeputesId,
  type DeputeCrossCheckRow,
} from "@open-hemicycle/core";
import { getDb } from "@open-hemicycle/db";
import {
  fetchAllDeputes,
  fetchDeputesEnMandat,
  fetchSyntheseBySlug,
  type NosdeputesDepute,
} from "../lib/nosdeputes-client.ts";

const LEGISLATURE = Number(process.env.AN_LEGISLATURE ?? "17");
const SAMPLE_SIZE = Number(process.env.OH_CROSSCHECK_SAMPLE ?? "30");

interface OhDeputeEnMandat {
  uidAn: string;
  slug: string;
  groupeSigle: string | null;
  voteCount: number;
}

async function loadOhDeputesEnMandat(): Promise<OhDeputeEnMandat[]> {
  const db = getDb();
  const rows = (await db.execute(sql`
    SELECT
      d.uid_an AS "uidAn",
      d.slug,
      g.sigle AS "groupeSigle",
      count(v.id)::int AS "voteCount"
    FROM deputes d
    INNER JOIN mandats m
      ON m.depute_id = d.id
      AND m.legislature = ${LEGISLATURE}
      AND m.fin IS NULL
    LEFT JOIN affiliations_groupe ag
      ON ag.depute_id = d.id
      AND ag.valid_to IS NULL
    LEFT JOIN groupes_politiques g ON g.id = ag.groupe_id
    LEFT JOIN votes v ON v.depute_id = d.id
    GROUP BY d.id, d.uid_an, d.slug, g.sigle
    ORDER BY d.nom, d.prenom
  `)) as unknown as OhDeputeEnMandat[];
  return rows;
}

async function loadNosdeputesDeputes(): Promise<{
  deputes: NosdeputesDepute[];
  source: string;
  warnings: string[];
}> {
  const warnings: string[] = [];
  const enMandat = await fetchDeputesEnMandat();
  if (enMandat.ok && enMandat.data && enMandat.data.length > 0) {
    return { deputes: enMandat.data, source: enMandat.url, warnings };
  }
  if (!enMandat.ok) {
    warnings.push(`enmandat indisponible (${enMandat.error}) — tentative /deputes/json`);
  } else if (enMandat.data?.length === 0) {
    warnings.push("enmandat vide — tentative /deputes/json (filtrage id_an)");
  }

  const all = await fetchAllDeputes();
  if (!all.ok || !all.data) {
    throw new Error(
      `API NosDéputés inaccessible (${all.error ?? "réponse vide"}). Cross-check externe reporté.`,
    );
  }
  return { deputes: all.data, source: all.url, warnings };
}

function buildCrossCheckRows(
  ours: OhDeputeEnMandat[],
  theirs: NosdeputesDepute[],
  syntheseBySlug: Map<string, { nbScrutins: number | null }>,
): DeputeCrossCheckRow[] {
  const byUid = new Map(
    theirs.map((d) => [uidAnFromNosdeputesId(d.idAn), d] as const),
  );

  return ours.map((row) => {
    const nd = byUid.get(row.uidAn);
    const syn = nd ? syntheseBySlug.get(nd.slug) : undefined;
    const theirVotes = nd?.nbScrutins ?? syn?.nbScrutins ?? null;
    return {
      uidAn: row.uidAn,
      slug: row.slug,
      foundInNosdeputes: Boolean(nd),
      ourGroupeSigle: row.groupeSigle,
      theirGroupeSigle: nd?.groupeSigle ?? null,
      ourVoteCount: row.voteCount,
      theirVoteCount: theirVotes,
    };
  });
}

function pickSample<T>(rows: T[], size: number): T[] {
  if (rows.length <= size) return rows;
  const step = Math.floor(rows.length / size);
  const sample: T[] = [];
  for (let i = 0; i < rows.length && sample.length < size; i += Math.max(step, 1)) {
    sample.push(rows[i]!);
  }
  return sample;
}

export async function validateNosdeputes(): Promise<void> {
  console.log(`\n[validate:nosdeputes] Cross-check législature ${LEGISLATURE}\n`);

  const ours = await loadOhDeputesEnMandat();
  console.log(`[oh] Députés en mandat (mandats.fin IS NULL) : ${ours.length}`);

  let theirs: NosdeputesDepute[];
  let ndSource: string;
  const warnings: string[] = [];
  try {
    const loaded = await loadNosdeputesDeputes();
    theirs = loaded.deputes;
    ndSource = loaded.source;
    warnings.push(...loaded.warnings);
  } catch (err) {
    console.error(`[nosdeputes] ${(err as Error).message}`);
    console.log(
      "\n[validate:nosdeputes] Arrêt — données internes disponibles, contrôle externe impossible.\n",
    );
    process.exit(2);
  }

  const oursUidSet = new Set(ours.map((d) => d.uidAn));
  const theirsMatched = theirs.filter((d) => oursUidSet.has(uidAnFromNosdeputesId(d.idAn)));
  console.log(`[nosdeputes] Source : ${ndSource}`);
  console.log(`[nosdeputes] Députés récupérés : ${theirs.length} · recoupement id_an : ${theirsMatched.length}`);
  for (const w of warnings) console.log(`[nosdeputes] ⚠ ${w}`);

  const effectifOurs = aggregateEffectifsBySigle(
    ours.map((d) => ({ groupeSigle: d.groupeSigle })),
  );
  const effectifTheirs = aggregateEffectifsBySigle(
    theirsMatched.map((d) => ({ groupeSigle: d.groupeSigle })),
  );
  const groupCmp = compareGroupEffectifs(effectifOurs, effectifTheirs);

  console.log("\n--- Effectifs par groupe (sigle) ---");
  for (const m of groupCmp.matches) {
    console.log(`  OK  ${m.sigle.padEnd(6)} ${m.count}`);
  }
  for (const mm of groupCmp.mismatches) {
    console.log(`  Δ   ${mm.sigle.padEnd(6)} oh=${mm.ours ?? "—"} nd=${mm.theirs ?? "—"}`);
  }

  const synthese = await fetchSyntheseBySlug();
  const syntheseMap = synthese.ok && synthese.data ? synthese.data : new Map();
  if (!synthese.ok) {
    console.log(`[nosdeputes] Synthèse non chargée (${synthese.error ?? "vide"}) — nb votes ND partiel`);
  }

  const rows = buildCrossCheckRows(ours, theirs, syntheseMap);
  const summary = summarizeDeputeCrossCheck(rows);

  console.log("\n--- Échantillon nominatif ---");
  const sample = pickSample(
    rows.filter((r) => r.theirGroupeSigle !== null || r.theirVoteCount !== null),
    SAMPLE_SIZE,
  );
  for (const row of sample) {
    const gOk = row.ourGroupeSigle === row.theirGroupeSigle ? "✓" : "Δ";
    const vOk =
      row.theirVoteCount === null
        ? "?"
        : row.ourVoteCount === row.theirVoteCount
          ? "✓"
          : "Δ";
    console.log(
      `  ${row.uidAn} ${gOk} groupe oh=${row.ourGroupeSigle ?? "—"} nd=${row.theirGroupeSigle ?? "—"} · votes ${vOk} oh=${row.ourVoteCount} nd=${row.theirVoteCount ?? "—"}`,
    );
  }

  console.log("\n--- Synthèse ---");
  console.log(`  Appariés OK (groupe + votes) : ${summary.matched}/${rows.length}`);
  console.log(`  Écart groupe : ${summary.groupeMismatch}`);
  console.log(`  Écart nb votes : ${summary.voteCountMismatch}`);
  console.log(`  Absents NosDéputés : ${summary.missingInNosdeputes}`);

  const hasIssues =
    groupCmp.mismatches.length > 0 ||
    summary.groupeMismatch > 0 ||
    summary.voteCountMismatch > 0;

  if (hasIssues) {
    console.log("\n[validate:nosdeputes] Écarts détectés — à investiguer (délais de sync, périmètre).\n");
    process.exit(1);
  }
  console.log("\n[validate:nosdeputes] OK — pas d'écart sur l'échantillon courant.\n");
}
