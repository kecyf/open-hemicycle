# Roadmap — Open Hémicycle

Horizon de référence : **Jalon M1 à ~1 mois** (POC public fonctionnel). Le détail opérationnel vit dans [`tasks/BACKLOG.md`](tasks/BACKLOG.md) ; l'historique dans [`tasks/JOURNAL.md`](tasks/JOURNAL.md) ; les versions livrées dans [`CHANGELOG.md`](CHANGELOG.md).

**Version courante : `0.9.0`** — POC public en ligne (annuaire + fiches + heatmap à jour + explorateur scrutins + thèmes + participation + alignement backend). Cible `1.0.0` = jalon M1 (1er indice de cohérence sourcé publié).

---

## Phase 0 — Amorçage ✅ (quasi terminé)
- [x] Étude de faisabilité (sources, concurrence, technique).
- [x] Vision, méthodologie, garde-fous juridiques documentés.
- [x] Harness agentique (AGENTS.md, rules, skills, standup).
- [x] Squelette monorepo (pnpm, apps/web, packages/etl, packages/db).
- [x] Repo GitHub public + premier push.
- [x] Infra live : Supabase (schéma + RLS) + Vercel auto-déployé depuis GitHub.
- [x] Landing en ligne : https://open-hemicycle.vercel.app
- [x] Automation quotidienne opérationnelle (1er run autonome complet 2026-06-10).

## Phase 1 — Données (semaines 1–2)
- [x] Setup Supabase (Postgres) + Drizzle + migrations.
- [x] Schéma de base : `deputes`, `groupes`, `affiliations_groupe`, `mandats`, `scrutins`, `votes`, `dossiers`, `textes`, `activite_journaliere`, `sync_runs`.
- [x] ETL : import députés (AMO10) + groupes/organes (577 / 12 / 588 affiliations).
- [x] ETL : import scrutins + votes individuels (17e lég.) — 7205 scrutins / 1,07M votes + résultat `sort`.
- [x] ETL : import acteurs historiques (AMO30) → récupérer les 55k votes de députés non actifs.
- [x] ETL : lien scrutin ↔ dossier législatif (2609 dossiers ; 1375 scrutins liés à 40 dossiers).
- [~] Validation : effectifs par groupe cohérents ; reste cross-check nominatif vs NosDéputés.

## Phase 2 — Agrégation & API (semaine 2–3)
- [x] Fonctions de calcul pures (`@open-hemicycle/core`) + tests vitest (score, seuils 0–4, participation).
- [x] Calcul `activite_journaliere` (heatmap) selon METHODOLOGY §2 — job ETL, 66 080 lignes (votes-only).
- [x] Calcul des 3 taux de participation (METHODOLOGY §3) — fiche député·e, v0.8.0.
- [x] Accès données (server components Drizzle) : liste/recherche député·es, fiche député·e + répartition des votes.
- [x] Scrutin + votes par groupe (`listScrutins` / `countScrutins` / `getScrutinDetail`).

## Phase 3 — Frontend POC (semaine 3–4)
- [x] Page recherche/annuaire des député·es (filtre groupe, couleurs + effectifs) — **en ligne**.
- [x] Fiche député·e : **heatmap d'activité (votes)** + détail votes (pour/contre/abstention/non-votant) + contexte + légende.
- [x] Explorateur de scrutins : liste filtrable + qui a voté quoi par groupe — **en ligne** (`/scrutins`).
- [x] Page méthodologie + mentions légales + « signaler une erreur » + footer global — **en ligne**.
- [x] Déploiement continu Vercel depuis `main` (landing + pages data).

## Phase 4 — Indice de cohérence v0 (fin M1, sous validation HITL)
- [x] Rattachement scrutins ↔ thèmes (2 thèmes pilotes, v0.7.0).
- [~] Cohérence vote / ligne de groupe (composante a) — core + requête prêts ; affichage fiche soumis à HITL (4.5).
- [~] Cohérence participation / thème revendiqué (composante c) — core + requête prêts ; revendications sourcées et affichage fiche soumis à HITL.
- [ ] Validation manuelle d'un échantillon + check-list juridique.
- [ ] **HITL : relecture humaine avant toute publication nominative.**

---

## Jalon M1 — Définition du succès (~1 mois)

Un **POC public et hébergé** sur la 17e législature permettant :
1. de chercher un·e député·e et voir sa **heatmap d'activité** + son détail de votes ;
2. d'explorer un **texte de loi** (qui a voté quoi, par groupe) ;
3. d'afficher un **premier indice de cohérence** factuel et sourcé sur ≥ 1 thème ;
4. avec **méthodologie publiée** et **garde-fous juridiques** documentés et appliqués.

Livrable narratif visé : une **observation data-driven, sourcée, sans aucun adjectif moral**, du type « sur le thème X, écart de cohérence mesurable entre positions publiques et votes pour le groupe Y ».

## Au-delà de M1 (backlog long terme)
- Amendements, questions, interventions dans le score d'activité.
- Croisement HATVP (intérêts / lobbying).
- Comparaison inter-groupes (cohésion, alignement).
- Historique multi-législatures.
- Extension Sénat (data.senat.fr, même pipeline).
- API publique documentée (OpenAPI).
