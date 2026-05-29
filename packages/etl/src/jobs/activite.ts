/**
 * Job d'agrégation : `activite_journaliere` (heatmap style GitHub).
 *
 * v1 « votes-only » : seule source disponible = les votes exprimés. Le score
 * journalier vaut donc le nombre de votes exprimés ce jour-là (METHODOLOGY §2,
 * poids vote = 1). Les autres composantes (amendements, questions…) restent à 0
 * tant que leurs sources ne sont pas ingérées.
 *
 * Les niveaux 0–4 sont calculés par **quantiles sur la population** (tous les
 * scores journaliers positifs, tous·tes les député·es) → couleurs comparables
 * d'une fiche à l'autre.
 */

import { sql } from "drizzle-orm";
import { getDb, activiteJournaliere, syncRuns } from "@open-hemicycle/db";
import { computeSeuilsNiveaux, niveauPourScore, scoreJour } from "@open-hemicycle/core";

interface JourAgrege {
  deputeId: string;
  jour: string; // YYYY-MM-DD (fuseau Europe/Paris)
  nbVotes: number;
}

const INSERT_BATCH = 2000;

export async function computeActiviteJournaliere(): Promise<void> {
  const db = getDb();
  const started = new Date();
  console.log(`\n[activite] Agrégation activité journalière (votes-only)\n`);

  // 1) Agrège les votes exprimés par (député, jour) côté SQL.
  const rows = (await db.execute(sql`
    select
      v.depute_id as depute_id,
      (s.date_scrutin at time zone 'Europe/Paris')::date as jour,
      count(*)::int as nb_votes
    from votes v
    join scrutins s on s.id = v.scrutin_id
    where v.position <> 'non-votant'
      and s.date_scrutin is not null
    group by v.depute_id, (s.date_scrutin at time zone 'Europe/Paris')::date
  `)) as unknown as Array<{ depute_id: string; jour: string; nb_votes: number }>;

  const agrege: JourAgrege[] = rows.map((r) => ({
    deputeId: r.depute_id,
    jour: typeof r.jour === "string" ? r.jour : new Date(r.jour).toISOString().slice(0, 10),
    nbVotes: Number(r.nb_votes),
  }));
  console.log(`[activite] Lignes (député × jour actif) : ${agrege.length}`);

  // 2) Seuils de niveaux sur la distribution de population.
  const scores = agrege.map((a) => scoreJour({ nbVotes: a.nbVotes }));
  const seuils = computeSeuilsNiveaux(scores);
  console.log(`[activite] Seuils niveaux (q25/q50/q75) : ${seuils.join(" / ")}`);

  // 3) Recalcul complet (la table est dérivée → on la reconstruit).
  await db.delete(activiteJournaliere);

  let buf: (typeof activiteJournaliere.$inferInsert)[] = [];
  let inserted = 0;
  const flush = async () => {
    if (!buf.length) return;
    await db.insert(activiteJournaliere).values(buf).onConflictDoNothing();
    inserted += buf.length;
    buf = [];
  };

  for (const a of agrege) {
    const score = scoreJour({ nbVotes: a.nbVotes });
    buf.push({
      deputeId: a.deputeId,
      jour: a.jour,
      nbVotes: a.nbVotes,
      nbAmendements: 0,
      nbQuestions: 0,
      nbInterventions: 0,
      nbPresencesCommission: 0,
      scoreTotal: score,
      niveau: niveauPourScore(score, seuils),
    });
    if (buf.length >= INSERT_BATCH) await flush();
  }
  await flush();
  console.log(`[activite] Lignes insérées : ${inserted}`);

  await db.insert(syncRuns).values({
    dataset: "activite_journaliere",
    startedAt: started,
    finishedAt: new Date(),
    recordsProcessed: inserted,
    errors: 0,
    notes: `seuils ${seuils.join("/")} · votes-only`,
  });
  console.log(`[activite] OK\n`);
}
