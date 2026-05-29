/**
 * Couche d'accès aux données (serveur uniquement).
 *
 * Lecture seule sur la base Open Hémicycle (Drizzle + Postgres). Ces fonctions
 * ne sont importées que par des Server Components / route handlers — jamais
 * côté client (la connexion porte tous les droits).
 */

import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import {
  getDb,
  deputes,
  groupesPolitiques,
  affiliationsGroupe,
  votes,
  scrutins,
  type Position,
} from "@open-hemicycle/db";

const LEGISLATURE = Number(process.env.AN_LEGISLATURE ?? "17");

export interface GroupeRow {
  id: string;
  nom: string;
  sigle: string | null;
  couleurHex: string | null;
  membres: number;
}

/** Liste des groupes politiques avec leur effectif courant (affiliation ouverte). */
export async function listGroupes(): Promise<GroupeRow[]> {
  const db = getDb();
  return db
    .select({
      id: groupesPolitiques.id,
      nom: groupesPolitiques.nom,
      sigle: groupesPolitiques.sigle,
      couleurHex: groupesPolitiques.couleurHex,
      membres: sql<number>`count(${affiliationsGroupe.id})::int`,
    })
    .from(groupesPolitiques)
    .leftJoin(
      affiliationsGroupe,
      and(
        eq(affiliationsGroupe.groupeId, groupesPolitiques.id),
        isNull(affiliationsGroupe.validTo),
      ),
    )
    .where(eq(groupesPolitiques.legislature, LEGISLATURE))
    .groupBy(groupesPolitiques.id)
    .orderBy(desc(sql`count(${affiliationsGroupe.id})`));
}

export interface DeputeRow {
  id: string;
  prenom: string;
  nom: string;
  slug: string;
  departement: string | null;
  groupeId: string | null;
  groupeSigle: string | null;
  groupeNom: string | null;
  couleurHex: string | null;
}

/** Annuaire des députés (affiliation courante), filtrable par groupe. */
export async function listDeputes(groupeId?: string): Promise<DeputeRow[]> {
  const db = getDb();
  return db
    .select({
      id: deputes.id,
      prenom: deputes.prenom,
      nom: deputes.nom,
      slug: deputes.slug,
      departement: deputes.departement,
      groupeId: groupesPolitiques.id,
      groupeSigle: groupesPolitiques.sigle,
      groupeNom: groupesPolitiques.nom,
      couleurHex: groupesPolitiques.couleurHex,
    })
    .from(deputes)
    .leftJoin(
      affiliationsGroupe,
      and(
        eq(affiliationsGroupe.deputeId, deputes.id),
        isNull(affiliationsGroupe.validTo),
      ),
    )
    .leftJoin(groupesPolitiques, eq(groupesPolitiques.id, affiliationsGroupe.groupeId))
    .where(groupeId ? eq(affiliationsGroupe.groupeId, groupeId) : undefined)
    .orderBy(asc(deputes.nom), asc(deputes.prenom));
}

export interface DeputeDetail extends DeputeRow {
  civilite: string | null;
  circonscription: string | null;
  urlAn: string | null;
}

/** Fiche d'un·e député·e par slug (avec groupe courant). */
export async function getDeputeBySlug(slug: string): Promise<DeputeDetail | null> {
  const db = getDb();
  const rows = await db
    .select({
      id: deputes.id,
      prenom: deputes.prenom,
      nom: deputes.nom,
      slug: deputes.slug,
      civilite: deputes.civilite,
      departement: deputes.departement,
      circonscription: deputes.circonscription,
      urlAn: deputes.urlAn,
      groupeId: groupesPolitiques.id,
      groupeSigle: groupesPolitiques.sigle,
      groupeNom: groupesPolitiques.nom,
      couleurHex: groupesPolitiques.couleurHex,
    })
    .from(deputes)
    .leftJoin(
      affiliationsGroupe,
      and(
        eq(affiliationsGroupe.deputeId, deputes.id),
        isNull(affiliationsGroupe.validTo),
      ),
    )
    .leftJoin(groupesPolitiques, eq(groupesPolitiques.id, affiliationsGroupe.groupeId))
    .where(eq(deputes.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export interface VoteStats {
  pour: number;
  contre: number;
  abstention: number;
  nonVotant: number;
  /** Total de positions enregistrées pour ce·tte député·e. */
  total: number;
  /** Votes exprimés (pour + contre + abstention). */
  exprimes: number;
  /** Part de votes exprimés sur le total enregistré (0–1), ou null si aucun. */
  tauxExpression: number | null;
}

/**
 * Répartition des positions de vote d'un·e député·e.
 *
 * NB : compte uniquement les scrutins où une position nominative a été
 * enregistrée à la source. Ce n'est PAS un taux de présence physique.
 */
export async function getVoteStats(deputeId: string): Promise<VoteStats> {
  const db = getDb();
  const rows = await db
    .select({
      position: votes.position,
      n: sql<number>`count(*)::int`,
    })
    .from(votes)
    .where(eq(votes.deputeId, deputeId))
    .groupBy(votes.position);

  const byPos = new Map<string, number>(rows.map((r) => [r.position, r.n]));
  const pour = byPos.get("pour") ?? 0;
  const contre = byPos.get("contre") ?? 0;
  const abstention = byPos.get("abstention") ?? 0;
  const nonVotant = byPos.get("non-votant") ?? 0;
  const exprimes = pour + contre + abstention;
  const total = exprimes + nonVotant;
  return {
    pour,
    contre,
    abstention,
    nonVotant,
    total,
    exprimes,
    tauxExpression: total > 0 ? exprimes / total : null,
  };
}

/** Quelques compteurs globaux pour le contexte (affichés sur la landing/annuaire). */
export async function getGlobalCounts(): Promise<{
  deputes: number;
  scrutins: number;
  votes: number;
}> {
  const db = getDb();
  const [d, s, v] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(deputes),
    db.select({ n: sql<number>`count(*)::int` }).from(scrutins),
    db.select({ n: sql<number>`count(*)::int` }).from(votes),
  ]);
  return {
    deputes: d[0]?.n ?? 0,
    scrutins: s[0]?.n ?? 0,
    votes: v[0]?.n ?? 0,
  };
}

export type { Position };
