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
  dossiersLegislatifs,
  activiteJournaliere,
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

export interface ActiviteJour {
  jour: string; // YYYY-MM-DD
  niveau: number; // 0–4
  nbVotes: number;
}

/**
 * Série d'activité journalière d'un·e député·e (pour la heatmap).
 * Ne contient que les jours actifs ; les jours absents = niveau 0.
 */
export async function getActiviteJournaliere(deputeId: string): Promise<ActiviteJour[]> {
  const db = getDb();
  const rows = await db
    .select({
      jour: activiteJournaliere.jour,
      niveau: activiteJournaliere.niveau,
      nbVotes: activiteJournaliere.nbVotes,
    })
    .from(activiteJournaliere)
    .where(eq(activiteJournaliere.deputeId, deputeId))
    .orderBy(asc(activiteJournaliere.jour));
  return rows.map((r) => ({ jour: r.jour, niveau: r.niveau, nbVotes: r.nbVotes }));
}

export interface ScrutinRow {
  uidAn: string;
  numero: number | null;
  dateScrutin: Date | null;
  objet: string | null;
  typeScrutin: string | null;
  /** Résultat officiel AN : "adopté" | "rejeté" (verbatim, sourcé). */
  sort: string | null;
  nbPour: number | null;
  nbContre: number | null;
  nbAbstention: number | null;
}

export type TypeScrutinFiltre = "solennel" | "censure" | "ordinaire";

/**
 * Liste des scrutins, les plus récents d'abord, filtrable par grande catégorie.
 *
 * NB : on expose `objet` (= libellé du scrutin tel que publié par l'AN). C'est
 * un fait sourcé, repris verbatim, jamais reformulé.
 */
export async function listScrutins(opts?: {
  type?: TypeScrutinFiltre;
  limit?: number;
  offset?: number;
}): Promise<ScrutinRow[]> {
  const db = getDb();
  const limit = Math.min(opts?.limit ?? 50, 200);
  const offset = Math.max(opts?.offset ?? 0, 0);
  const typeFilter =
    opts?.type === "solennel"
      ? eq(scrutins.typeScrutin, "scrutin public solennel")
      : opts?.type === "censure"
        ? eq(scrutins.typeScrutin, "motion de censure")
        : opts?.type === "ordinaire"
          ? eq(scrutins.typeScrutin, "scrutin public ordinaire")
          : undefined;

  return db
    .select({
      uidAn: scrutins.uidAn,
      numero: scrutins.numero,
      dateScrutin: scrutins.dateScrutin,
      objet: scrutins.objet,
      typeScrutin: scrutins.typeScrutin,
      sort: scrutins.sort,
      nbPour: scrutins.nbPour,
      nbContre: scrutins.nbContre,
      nbAbstention: scrutins.nbAbstention,
    })
    .from(scrutins)
    .where(and(eq(scrutins.legislature, LEGISLATURE), typeFilter))
    .orderBy(desc(scrutins.dateScrutin), desc(scrutins.numero))
    .limit(limit)
    .offset(offset);
}

/** Nombre total de scrutins (pour la pagination), filtrable par catégorie. */
export async function countScrutins(type?: TypeScrutinFiltre): Promise<number> {
  const db = getDb();
  const typeFilter =
    type === "solennel"
      ? eq(scrutins.typeScrutin, "scrutin public solennel")
      : type === "censure"
        ? eq(scrutins.typeScrutin, "motion de censure")
        : type === "ordinaire"
          ? eq(scrutins.typeScrutin, "scrutin public ordinaire")
          : undefined;
  const [r] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(scrutins)
    .where(and(eq(scrutins.legislature, LEGISLATURE), typeFilter));
  return r?.n ?? 0;
}

export interface GroupeVentilation {
  groupeId: string | null;
  sigle: string | null;
  nom: string | null;
  couleurHex: string | null;
  pour: number;
  contre: number;
  abstention: number;
  nonVotant: number;
  /** Positions nominatives enregistrées pour ce groupe sur ce scrutin. */
  total: number;
}

/** Dossier législatif rattaché à un scrutin. */
export interface DossierLien {
  uidAn: string;
  titre: string;
  procedure: string | null;
  urlAn: string | null;
}

export interface ScrutinDetail extends ScrutinRow {
  groupes: GroupeVentilation[];
  /** Total de positions nominatives enregistrées (tous groupes confondus). */
  totalNominatif: number;
  /** Dossier législatif rattaché (null si scrutin de procédure / non rattaché). */
  dossier: DossierLien | null;
}

/**
 * Détail d'un scrutin : métadonnées + ventilation des votes par groupe.
 *
 * La ventilation est calculée à partir des votes nominatifs joints à
 * l'affiliation de groupe COURANTE (pas celle à la date du scrutin — limite
 * connue, signalée dans l'UI). Pour les scrutins ordinaires, l'AN ne liste
 * nominativement que les votants exprimés et quelques non-votants : ce n'est
 * donc pas un relevé d'absence.
 */
export async function getScrutinDetail(uidAn: string): Promise<ScrutinDetail | null> {
  const db = getDb();
  const [meta] = await db
    .select({
      uidAn: scrutins.uidAn,
      numero: scrutins.numero,
      dateScrutin: scrutins.dateScrutin,
      objet: scrutins.objet,
      typeScrutin: scrutins.typeScrutin,
      sort: scrutins.sort,
      nbPour: scrutins.nbPour,
      nbContre: scrutins.nbContre,
      nbAbstention: scrutins.nbAbstention,
      id: scrutins.id,
      dossierUidAn: dossiersLegislatifs.uidAn,
      dossierTitre: dossiersLegislatifs.titre,
      dossierProcedure: dossiersLegislatifs.procedure,
      dossierUrlAn: dossiersLegislatifs.urlAn,
    })
    .from(scrutins)
    .leftJoin(dossiersLegislatifs, eq(dossiersLegislatifs.id, scrutins.dossierId))
    .where(eq(scrutins.uidAn, uidAn))
    .limit(1);
  if (!meta) return null;

  const dossier: DossierLien | null = meta.dossierUidAn
    ? {
        uidAn: meta.dossierUidAn,
        titre: meta.dossierTitre!,
        procedure: meta.dossierProcedure,
        urlAn: meta.dossierUrlAn,
      }
    : null;

  const rows = await db
    .select({
      groupeId: groupesPolitiques.id,
      sigle: groupesPolitiques.sigle,
      nom: groupesPolitiques.nom,
      couleurHex: groupesPolitiques.couleurHex,
      position: votes.position,
      n: sql<number>`count(*)::int`,
    })
    .from(votes)
    .innerJoin(
      affiliationsGroupe,
      and(
        eq(affiliationsGroupe.deputeId, votes.deputeId),
        isNull(affiliationsGroupe.validTo),
      ),
    )
    .innerJoin(groupesPolitiques, eq(groupesPolitiques.id, affiliationsGroupe.groupeId))
    .where(eq(votes.scrutinId, meta.id))
    .groupBy(
      groupesPolitiques.id,
      groupesPolitiques.sigle,
      groupesPolitiques.nom,
      groupesPolitiques.couleurHex,
      votes.position,
    );

  const byGroup = new Map<string, GroupeVentilation>();
  for (const r of rows) {
    const key = r.groupeId ?? "—";
    let g = byGroup.get(key);
    if (!g) {
      g = {
        groupeId: r.groupeId,
        sigle: r.sigle,
        nom: r.nom,
        couleurHex: r.couleurHex,
        pour: 0,
        contre: 0,
        abstention: 0,
        nonVotant: 0,
        total: 0,
      };
      byGroup.set(key, g);
    }
    if (r.position === "pour") g.pour += r.n;
    else if (r.position === "contre") g.contre += r.n;
    else if (r.position === "abstention") g.abstention += r.n;
    else if (r.position === "non-votant") g.nonVotant += r.n;
    g.total += r.n;
  }

  const groupes = [...byGroup.values()].sort((a, b) => b.total - a.total);
  const totalNominatif = groupes.reduce((s, g) => s + g.total, 0);

  return {
    uidAn: meta.uidAn,
    numero: meta.numero,
    dateScrutin: meta.dateScrutin,
    objet: meta.objet,
    typeScrutin: meta.typeScrutin,
    sort: meta.sort,
    nbPour: meta.nbPour,
    nbContre: meta.nbContre,
    nbAbstention: meta.nbAbstention,
    groupes,
    totalNominatif,
    dossier,
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
