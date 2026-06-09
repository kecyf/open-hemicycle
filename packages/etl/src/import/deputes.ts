/**
 * Import des députés actifs, groupes politiques et affiliations (dump AMO10).
 *
 * Source : data.assemblee-nationale.fr — AMO10 (acteurs + mandats + organes).
 * AMO10 = ensemble ACTIF de la législature courante → on fait un rafraîchissement
 * complet des affiliations/mandats à chaque exécution (source de vérité).
 */

import { readdir } from "node:fs/promises";
import path from "node:path";
import { sql } from "drizzle-orm";
import {
  getDb,
  deputes,
  groupesPolitiques,
  affiliationsGroupe,
  mandats,
  syncRuns,
} from "@open-hemicycle/db";
import { AN_DATASETS } from "../sources.ts";
import { downloadDataset } from "../lib/download.ts";
import { arrayify, anText, readJson } from "../lib/json.ts";
import { slugify } from "../lib/slug.ts";

interface ParsedActeur {
  uidAn: string;
  prenom: string;
  nom: string;
  civilite: string | null;
  dateNaissance: string | null;
  departement: string | null;
  circonscription: string | null;
  urlAn: string | null;
  /** Mandats vers un groupe politique (typeOrgane = GP). */
  gpMandats: { organeRef: string; debut: string | null; fin: string | null }[];
  /** Mandat parlementaire (ASSEMBLEE). */
  assemblee: { debut: string | null; fin: string | null } | null;
}

export function parseActeur(raw: any, legislature: string): ParsedActeur | null {
  const a = raw?.acteur;
  if (!a) return null;
  const uidAn = anText(a.uid);
  const ident = a.etatCivil?.ident ?? {};
  const prenom = anText(ident.prenom);
  const nom = anText(ident.nom);
  if (!uidAn || !prenom || !nom) return null;

  const gpMandats: ParsedActeur["gpMandats"] = [];
  let assemblee: ParsedActeur["assemblee"] = null;
  let departement: string | null = null;
  let circonscription: string | null = null;

  for (const m of arrayify<any>(a.mandats?.mandat)) {
    const type = anText(m.typeOrgane);
    const mandatLeg = anText(m.legislature);
    if (type === "GP" && mandatLeg === legislature) {
      const organeRef = anText(m.organes?.organeRef);
      if (organeRef) {
        gpMandats.push({
          organeRef,
          debut: anText(m.dateDebut),
          fin: anText(m.dateFin),
        });
      }
    }
    if (type === "ASSEMBLEE" && mandatLeg === legislature) {
      assemblee = { debut: anText(m.dateDebut), fin: anText(m.dateFin) };
      const lieu = m.election?.lieu;
      if (lieu) {
        departement = anText(lieu.departement);
        const num = anText(lieu.numCirco);
        circonscription = num ? `${departement ?? ""} — circo. ${num}` : null;
      }
    }
  }

  return {
    uidAn,
    prenom,
    nom,
    civilite: anText(ident.civ),
    dateNaissance: anText(a.etatCivil?.infoNaissance?.dateNais),
    departement,
    circonscription,
    urlAn: `https://www.assemblee-nationale.fr/dyn/${legislature}/acteurs/${uidAn}`,
    gpMandats,
    assemblee,
  };
}

interface ParsedGroupe {
  uidAn: string;
  nom: string;
  sigle: string | null;
  couleurHex: string | null;
}

export function parseGroupe(raw: any): ParsedGroupe | null {
  const o = raw?.organe;
  if (!o || o.codeType !== "GP") return null;
  const uidAn = anText(o.uid);
  const nom = anText(o.libelle);
  if (!uidAn || !nom) return null;
  return {
    uidAn,
    nom,
    sigle: anText(o.libelleAbrev) ?? anText(o.libelleAbrege),
    couleurHex: anText(o.couleurAssociee),
  };
}

export async function importDeputes(legislature: string): Promise<void> {
  const db = getDb();
  const legNum = Number(legislature);
  const started = new Date();
  console.log(`\n[deputes] Import législature ${legislature}\n`);

  const dataset = AN_DATASETS.find((d) => d.id === "deputes-actifs")!;
  const { dir, fromCache } = await downloadDataset(dataset, legislature);
  console.log(`[deputes] Dump : ${dir} ${fromCache ? "(cache)" : "(téléchargé)"}`);

  // 1) Parse acteurs.
  const acteurDir = path.join(dir, "json", "acteur");
  const acteurFiles = await readdir(acteurDir);
  const acteurs: ParsedActeur[] = [];
  for (const f of acteurFiles) {
    if (!f.endsWith(".json")) continue;
    const parsed = parseActeur(await readJson(path.join(acteurDir, f)), legislature);
    if (parsed) acteurs.push(parsed);
  }
  console.log(`[deputes] Acteurs parsés : ${acteurs.length}`);

  // 2) Parse les organes GP référencés.
  const gpRefs = new Set<string>();
  for (const a of acteurs) for (const m of a.gpMandats) gpRefs.add(m.organeRef);
  const organeDir = path.join(dir, "json", "organe");
  const groupesParsed: ParsedGroupe[] = [];
  for (const ref of gpRefs) {
    try {
      const g = parseGroupe(await readJson(path.join(organeDir, `${ref}.json`)));
      if (g) groupesParsed.push(g);
    } catch {
      // organe manquant → ignoré (robustesse)
    }
  }
  console.log(`[deputes] Groupes politiques : ${groupesParsed.length}`);

  // 3) Upsert groupes.
  if (groupesParsed.length) {
    await db
      .insert(groupesPolitiques)
      .values(
        groupesParsed.map((g) => ({
          uidAn: g.uidAn,
          nom: g.nom,
          sigle: g.sigle,
          couleurHex: g.couleurHex,
          legislature: legNum,
        })),
      )
      .onConflictDoUpdate({
        target: groupesPolitiques.uidAn,
        set: {
          nom: sql`excluded.nom`,
          sigle: sql`excluded.sigle`,
          couleurHex: sql`excluded.couleur_hex`,
        },
      });
  }

  // 4) Upsert députés.
  await db
    .insert(deputes)
    .values(
      acteurs.map((a) => ({
        uidAn: a.uidAn,
        prenom: a.prenom,
        nom: a.nom,
        slug: slugify(a.prenom, a.nom, a.uidAn),
        civilite: a.civilite,
        dateNaissance: a.dateNaissance,
        departement: a.departement,
        circonscription: a.circonscription,
        urlAn: a.urlAn,
      })),
    )
    .onConflictDoUpdate({
      target: deputes.uidAn,
      set: {
        prenom: sql`excluded.prenom`,
        nom: sql`excluded.nom`,
        civilite: sql`excluded.civilite`,
        departement: sql`excluded.departement`,
        circonscription: sql`excluded.circonscription`,
        urlAn: sql`excluded.url_an`,
      },
    });

  // 5) Maps uidAn -> id (techniques).
  const grpRows = await db
    .select({ id: groupesPolitiques.id, uidAn: groupesPolitiques.uidAn })
    .from(groupesPolitiques);
  const depRows = await db
    .select({ id: deputes.id, uidAn: deputes.uidAn })
    .from(deputes);
  const grpId = new Map(grpRows.map((r) => [r.uidAn, r.id]));
  const depId = new Map(depRows.map((r) => [r.uidAn, r.id]));

  // 6) Rafraîchissement complet affiliations + mandats.
  await db.delete(affiliationsGroupe);
  await db.delete(mandats);

  const affRows: (typeof affiliationsGroupe.$inferInsert)[] = [];
  const mandatRows: (typeof mandats.$inferInsert)[] = [];
  for (const a of acteurs) {
    const dId = depId.get(a.uidAn);
    if (!dId) continue;
    for (const m of a.gpMandats) {
      const gId = grpId.get(m.organeRef);
      if (gId && m.debut) {
        affRows.push({ deputeId: dId, groupeId: gId, validFrom: m.debut, validTo: m.fin });
      }
    }
    if (a.assemblee?.debut) {
      mandatRows.push({
        deputeId: dId,
        legislature: legNum,
        debut: a.assemblee.debut,
        fin: a.assemblee.fin,
        typeMandat: "ASSEMBLEE",
      });
    }
  }
  if (affRows.length) await db.insert(affiliationsGroupe).values(affRows);
  if (mandatRows.length) await db.insert(mandats).values(mandatRows);
  console.log(`[deputes] Affiliations : ${affRows.length} · Mandats : ${mandatRows.length}`);

  await db.insert(syncRuns).values({
    dataset: "deputes-actifs",
    startedAt: started,
    finishedAt: new Date(),
    recordsProcessed: acteurs.length,
    errors: 0,
    notes: `${groupesParsed.length} groupes, ${affRows.length} affiliations`,
  });
  console.log(`[deputes] OK\n`);
}
