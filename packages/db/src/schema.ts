/**
 * Schéma de base de données — Open Hémicycle.
 *
 * Modèle relationnel pour l'open data de l'Assemblée nationale.
 * Voir docs/METHODOLOGY.md (calculs) et docs/data-sources.md (identifiants AN).
 *
 * Convention : on conserve l'identifiant métier AN (`uid_an`, ex. PA1592, PO758...)
 * comme clé naturelle stable, en plus d'un id technique.
 */

import {
  pgTable,
  uuid,
  text,
  integer,
  smallint,
  date,
  timestamp,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";

/** Groupes politiques (et autres organes : commissions...). */
export const groupesPolitiques = pgTable(
  "groupes_politiques",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    uidAn: text("uid_an").notNull().unique(), // PO*
    nom: text("nom").notNull(),
    sigle: text("sigle"),
    couleurHex: text("couleur_hex"),
    legislature: integer("legislature").notNull(),
    sourceUpdatedAt: timestamp("source_updated_at", { withTimezone: true }),
    ingestedAt: timestamp("ingested_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_groupes_legislature").on(t.legislature)],
);

/** Députés (acteurs). */
export const deputes = pgTable(
  "deputes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    uidAn: text("uid_an").notNull().unique(), // PA*
    prenom: text("prenom").notNull(),
    nom: text("nom").notNull(),
    slug: text("slug").notNull().unique(),
    civilite: text("civilite"),
    dateNaissance: date("date_naissance"),
    departement: text("departement"),
    circonscription: text("circonscription"),
    urlAn: text("url_an"),
    sourceUpdatedAt: timestamp("source_updated_at", { withTimezone: true }),
    ingestedAt: timestamp("ingested_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_deputes_nom").on(t.nom)],
);

/** Appartenance d'un député à un groupe (historisée — SCD type 2). */
export const affiliationsGroupe = pgTable(
  "affiliations_groupe",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    deputeId: uuid("depute_id")
      .notNull()
      .references(() => deputes.id),
    groupeId: uuid("groupe_id")
      .notNull()
      .references(() => groupesPolitiques.id),
    validFrom: date("valid_from").notNull(),
    validTo: date("valid_to"), // NULL = en cours
  },
  (t) => [index("idx_affiliations_periode").on(t.deputeId, t.validFrom, t.validTo)],
);

/** Mandats. */
export const mandats = pgTable("mandats", {
  id: uuid("id").primaryKey().defaultRandom(),
  deputeId: uuid("depute_id")
    .notNull()
    .references(() => deputes.id),
  legislature: integer("legislature").notNull(),
  debut: date("debut"),
  fin: date("fin"),
  typeMandat: text("type_mandat"),
});

/** Dossiers législatifs. */
export const dossiersLegislatifs = pgTable("dossiers_legislatifs", {
  id: uuid("id").primaryKey().defaultRandom(),
  uidAn: text("uid_an").notNull().unique(), // DLR5L17N*
  titre: text("titre").notNull(),
  statut: text("statut"),
  procedure: text("procedure"), // libellé procédure parlementaire (PPL, PJL...)
  urlAn: text("url_an"), // page officielle du dossier (dyn/{leg}/dossiers/{chemin})
  legislature: integer("legislature").notNull(),
});

/** Textes de loi rattachés à un dossier. */
export const textesDeLoi = pgTable("textes_de_loi", {
  id: uuid("id").primaryKey().defaultRandom(),
  uidAn: text("uid_an").notNull().unique(),
  dossierId: uuid("dossier_id").references(() => dossiersLegislatifs.id),
  titre: text("titre").notNull(),
  typeTexte: text("type_texte"),
  dateDepot: date("date_depot"),
});

/** Scrutins (votes publics). */
export const scrutins = pgTable(
  "scrutins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    uidAn: text("uid_an").notNull().unique(), // VTANR5L17V*
    legislature: integer("legislature").notNull(),
    numero: integer("numero"),
    dateScrutin: timestamp("date_scrutin", { withTimezone: true }),
    titre: text("titre"),
    objet: text("objet"),
    typeScrutin: text("type_scrutin"), // ex. "solennel"
    sort: text("sort"), // résultat officiel AN : "adopté" | "rejeté"
    nbPour: integer("nb_pour"),
    nbContre: integer("nb_contre"),
    nbAbstention: integer("nb_abstention"),
    dossierId: uuid("dossier_id").references(() => dossiersLegislatifs.id),
    ingestedAt: timestamp("ingested_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_scrutins_date").on(t.dateScrutin)],
);

/** Position de vote possible. */
export type Position = "pour" | "contre" | "abstention" | "non-votant";

/** Votes individuels. */
export const votes = pgTable(
  "votes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    scrutinId: uuid("scrutin_id")
      .notNull()
      .references(() => scrutins.id),
    deputeId: uuid("depute_id")
      .notNull()
      .references(() => deputes.id),
    position: text("position").notNull(), // Position
    parDelegation: integer("par_delegation").default(0), // 0/1
    ingestedAt: timestamp("ingested_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("idx_votes_scrutin_depute").on(t.scrutinId, t.deputeId),
    index("idx_votes_depute").on(t.deputeId),
    index("idx_votes_position").on(t.position),
  ],
);

/**
 * Activité parlementaire DÉTECTÉE, agrégée par jour (heatmap style GitHub).
 * NB : "activité détectée", PAS "présence". Voir docs/METHODOLOGY.md §2.
 */
export const activiteJournaliere = pgTable(
  "activite_journaliere",
  {
    deputeId: uuid("depute_id")
      .notNull()
      .references(() => deputes.id),
    jour: date("jour").notNull(),
    nbVotes: smallint("nb_votes").default(0).notNull(),
    nbAmendements: smallint("nb_amendements").default(0).notNull(),
    nbQuestions: smallint("nb_questions").default(0).notNull(),
    nbInterventions: smallint("nb_interventions").default(0).notNull(),
    nbPresencesCommission: smallint("nb_presences_commission").default(0).notNull(),
    scoreTotal: smallint("score_total").default(0).notNull(),
    niveau: smallint("niveau").default(0).notNull(), // 0-4 pour la heatmap
  },
  (t) => [
    primaryKey({ columns: [t.deputeId, t.jour] }),
    index("idx_activite_jour").on(t.jour),
  ],
);

/** Audit des exécutions d'ingestion. */
export const syncRuns = pgTable("sync_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  dataset: text("dataset").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  recordsProcessed: integer("records_processed").default(0),
  errors: integer("errors").default(0),
  notes: text("notes"),
});
