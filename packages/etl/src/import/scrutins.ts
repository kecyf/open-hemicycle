/**
 * Import des scrutins publics et votes individuels (dump Scrutins).
 *
 * Source : data.assemblee-nationale.fr — Scrutins (un fichier JSON par scrutin,
 * contenant la ventilation nominative des votes par groupe).
 *
 * La position de vote est déduite du nœud qui contient le votant :
 *   pours -> "pour" · contres -> "contre" · abstentions -> "abstention" · nonVotants -> "non-votant".
 */

import { readdir } from "node:fs/promises";
import path from "node:path";
import { sql } from "drizzle-orm";
import { getDb, scrutins, votes, deputes, syncRuns } from "@open-hemicycle/db";
import { AN_DATASETS } from "../sources.ts";
import { downloadDataset } from "../lib/download.ts";
import { arrayify, anText, readJson } from "../lib/json.ts";

type Position = "pour" | "contre" | "abstention" | "non-votant";

const POSITION_BY_NODE: Record<string, Position> = {
  pours: "pour",
  contres: "contre",
  abstentions: "abstention",
  nonVotants: "non-votant",
};

const VOTE_BATCH = 5000;
const SCRUTIN_BATCH = 1000;

interface ScrutinMeta {
  uidAn: string;
  numero: number | null;
  dateScrutin: string | null;
  titre: string | null;
  objet: string | null;
  typeScrutin: string | null;
  nbPour: number | null;
  nbContre: number | null;
  nbAbstention: number | null;
}

function toInt(v: string | null): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseScrutinMeta(raw: any): ScrutinMeta | null {
  const s = raw?.scrutin;
  if (!s) return null;
  const uidAn = anText(s.uid);
  if (!uidAn) return null;
  const decompte = s.syntheseVote?.decompte ?? {};
  return {
    uidAn,
    numero: toInt(anText(s.numero)),
    dateScrutin: anText(s.dateScrutin),
    titre: anText(s.titre),
    objet: anText(s.objet?.libelle) ?? anText(s.objet),
    typeScrutin: anText(s.typeVote?.libelleTypeVote),
    nbPour: toInt(anText(decompte.pour)),
    nbContre: toInt(anText(decompte.contre)),
    nbAbstention: toInt(anText(decompte.abstentions)),
  };
}

/** Itère les votes individuels (acteurRef, position, parDelegation) d'un scrutin. */
function* iterVotes(raw: any): Generator<{ acteurRef: string; position: Position; parDelegation: boolean }> {
  const s = raw?.scrutin;
  if (!s) return;
  for (const org of arrayify<any>(s.ventilationVotes?.organe)) {
    for (const g of arrayify<any>(org.groupes?.groupe)) {
      const dn = g.vote?.decompteNominatif;
      if (!dn) continue;
      for (const node of Object.keys(POSITION_BY_NODE)) {
        const block = dn[node];
        if (!block || typeof block !== "object") continue;
        for (const v of arrayify<any>(block.votant)) {
          const acteurRef = anText(v.acteurRef);
          if (acteurRef) {
            yield {
              acteurRef,
              position: POSITION_BY_NODE[node]!,
              parDelegation: anText(v.parDelegation) === "true",
            };
          }
        }
      }
    }
  }
}

export async function importScrutins(legislature: string): Promise<void> {
  const db = getDb();
  const legNum = Number(legislature);
  const started = new Date();
  console.log(`\n[scrutins] Import législature ${legislature}\n`);

  const dataset = AN_DATASETS.find((d) => d.id === "scrutins")!;
  const { dir, fromCache } = await downloadDataset(dataset, legislature);
  console.log(`[scrutins] Dump : ${dir} ${fromCache ? "(cache)" : "(téléchargé)"}`);

  const jsonDir = path.join(dir, "json");
  const files = (await readdir(jsonDir)).filter((f) => f.endsWith(".json"));
  console.log(`[scrutins] Fichiers : ${files.length}`);

  // Map députés (uidAn AN -> id technique). Requis pour rattacher les votes.
  const depRows = await db.select({ id: deputes.id, uidAn: deputes.uidAn }).from(deputes);
  const depId = new Map(depRows.map((r) => [r.uidAn, r.id]));
  if (depId.size === 0) {
    throw new Error("Aucun député en base — lancer d'abord `ingest:deputes`.");
  }

  // Passe 1 : upsert métadonnées des scrutins.
  let metaBuf: ScrutinMeta[] = [];
  const flushMeta = async () => {
    if (!metaBuf.length) return;
    await db
      .insert(scrutins)
      .values(
        metaBuf.map((m) => ({
          uidAn: m.uidAn,
          legislature: legNum,
          numero: m.numero,
          dateScrutin: m.dateScrutin ? new Date(m.dateScrutin) : null,
          titre: m.titre,
          objet: m.objet,
          typeScrutin: m.typeScrutin,
          nbPour: m.nbPour,
          nbContre: m.nbContre,
          nbAbstention: m.nbAbstention,
        })),
      )
      .onConflictDoUpdate({
        target: scrutins.uidAn,
        set: {
          titre: sql`excluded.titre`,
          objet: sql`excluded.objet`,
          nbPour: sql`excluded.nb_pour`,
          nbContre: sql`excluded.nb_contre`,
          nbAbstention: sql`excluded.nb_abstention`,
        },
      });
    metaBuf = [];
  };

  for (const f of files) {
    const meta = parseScrutinMeta(await readJson(path.join(jsonDir, f)));
    if (meta) metaBuf.push(meta);
    if (metaBuf.length >= SCRUTIN_BATCH) await flushMeta();
  }
  await flushMeta();
  console.log(`[scrutins] Métadonnées upsertées.`);

  // Map scrutins (uidAn -> id).
  const scrRows = await db.select({ id: scrutins.id, uidAn: scrutins.uidAn }).from(scrutins);
  const scrId = new Map(scrRows.map((r) => [r.uidAn, r.id]));

  // Passe 2 : votes individuels.
  let voteBuf: (typeof votes.$inferInsert)[] = [];
  let inserted = 0;
  let skipped = 0;
  const flushVotes = async () => {
    if (!voteBuf.length) return;
    await db.insert(votes).values(voteBuf).onConflictDoNothing();
    inserted += voteBuf.length;
    voteBuf = [];
    if (inserted % 100_000 < VOTE_BATCH) console.log(`[scrutins] ...${inserted} votes`);
  };

  for (const f of files) {
    const raw = await readJson(path.join(jsonDir, f));
    const uidAn = anText((raw as any)?.scrutin?.uid);
    const sId = uidAn ? scrId.get(uidAn) : undefined;
    if (!sId) continue;
    for (const v of iterVotes(raw)) {
      const dId = depId.get(v.acteurRef);
      if (!dId) {
        skipped++;
        continue;
      }
      voteBuf.push({
        scrutinId: sId,
        deputeId: dId,
        position: v.position,
        parDelegation: v.parDelegation ? 1 : 0,
      });
      if (voteBuf.length >= VOTE_BATCH) await flushVotes();
    }
  }
  await flushVotes();
  console.log(`[scrutins] Votes insérés : ${inserted} · ignorés (député inconnu) : ${skipped}`);

  await db.insert(syncRuns).values({
    dataset: "scrutins",
    startedAt: started,
    finishedAt: new Date(),
    recordsProcessed: files.length,
    errors: skipped,
    notes: `${inserted} votes individuels`,
  });
  console.log(`[scrutins] OK\n`);
}
