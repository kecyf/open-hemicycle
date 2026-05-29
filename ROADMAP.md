# Roadmap — Open Hémicycle

Horizon de référence : **Jalon M1 à ~1 mois** (POC public fonctionnel). Le détail opérationnel vit dans [`tasks/BACKLOG.md`](tasks/BACKLOG.md) ; l'historique dans [`tasks/JOURNAL.md`](tasks/JOURNAL.md).

---

## Phase 0 — Amorçage ✅ (en cours)
- [x] Étude de faisabilité (sources, concurrence, technique).
- [x] Vision, méthodologie, garde-fous juridiques documentés.
- [x] Harness agentique (AGENTS.md, rules, skills, standup).
- [ ] Squelette monorepo (pnpm, apps/web, packages/etl).
- [ ] Repo GitHub public + premier push.
- [ ] Automation quotidienne câblée.

## Phase 1 — Données (semaines 1–2)
- [ ] Setup Supabase (Postgres) + Drizzle + migrations.
- [ ] Schéma de base : `deputes`, `groupes`, `affiliations_groupe`, `mandats`, `scrutins`, `votes`, `dossiers`, `textes`, `activite_journaliere`, `sync_runs`.
- [ ] ETL : import députés (AMO10) + groupes/organes.
- [ ] ETL : import scrutins + votes individuels (17e lég.).
- [ ] ETL : lien scrutin ↔ dossier législatif.
- [ ] Validation : cross-check de 2–3 député·es connus vs NosDéputés.

## Phase 2 — Agrégation & API (semaine 2–3)
- [ ] Calcul `activite_journaliere` (heatmap) selon METHODOLOGY §2.
- [ ] Calcul des 3 taux de participation (METHODOLOGY §3).
- [ ] Endpoints : liste/recherche député·es, fiche député·e + heatmap, scrutin + votes par groupe.

## Phase 3 — Frontend POC (semaine 3–4)
- [ ] Page recherche/annuaire des député·es (filtre groupe).
- [ ] Fiche député·e : heatmap d'activité + détail votes + contexte + légende « activité détectée ».
- [ ] Explorateur d'un texte de loi : qui a voté quoi, par groupe.
- [ ] Page méthodologie + mentions légales + bouton « signaler une erreur ».
- [ ] Déploiement Vercel + Supabase (after validation humaine).

## Phase 4 — Indice de cohérence v0 (fin M1, sous validation HITL)
- [ ] Rattachement scrutins ↔ thèmes (au moins 1 thème pilote).
- [ ] Cohérence vote / ligne de groupe (composante a).
- [ ] Cohérence participation / thème revendiqué (composante c).
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
