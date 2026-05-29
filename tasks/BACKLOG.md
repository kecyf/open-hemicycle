# Backlog — Open Hémicycle

Statuts : `next` (à prendre) · `in-progress` · `blocked` · `done` · `hitl` (requiert validation humaine).
Priorité : P0 (critique) · P1 · P2.

> L'agent prend la tâche `next` de plus haute priorité **faisable en autonomie**. Les tâches `hitl` attendent une validation humaine (voir AGENTS.md §3).

---

## Phase 0 — Amorçage

| ID | Prio | Statut | Tâche |
|----|------|--------|-------|
| 0.1 | P0 | done | Étude de faisabilité (sources / concurrence / technique) |
| 0.2 | P0 | done | Vision + méthodologie + garde-fous juridiques |
| 0.3 | P0 | done | Harness agentique (AGENTS.md, rules, skills) |
| 0.4 | P0 | done | Squelette monorepo pnpm (`apps/web`, `packages/etl`, configs) |
| 0.5 | P0 | done | Repo GitHub public + push initial |
| 0.6 | P1 | hitl | Cursor Automation quotidienne : formulaire Glass pré-rempli (cron 08:00 Paris) → reste la sauvegarde par le superviseur |
| 0.7 | P2 | next | Choisir/réserver un nom de domaine (HITL si payant) |

## Phase 1 — Données

| ID | Prio | Statut | Tâche |
|----|------|--------|-------|
| 1.1 | P0 | done | Créer projet Supabase + connexion + `.env.example` |
| 1.2 | P0 | done | Schéma Drizzle + 1re migration (tables core) — appliqué sur la DB live |
| 1.2b | P0 | done | `DATABASE_URL` fourni + connexion vérifiée + câblé Vercel (prod/preview/dev). `service_role` non requis pour Drizzle |
| 1.3 | P0 | done | ETL : download util (`data/raw/`) + dézip (adm-zip) + helpers parsing AN |
| 1.4 | P0 | done | ETL : import députés AMO10 + groupes/organes + affiliations (577/12/588) |
| 1.4b | P1 | next | ETL : import acteurs historiques AMO30 → récupérer les 55k votes ignorés (députés non actifs) |
| 1.5 | P0 | done | ETL : import scrutins + votes individuels (7074 scrutins / 1,05M votes) |
| 1.6 | P1 | next | ETL : lien scrutin ↔ dossier législatif (dossiersLegislatifs + scrutins.dossier_id) |
| 1.7 | P1 | in-progress | Validation : effectifs par groupe OK ; reste cross-check nominatif vs NosDéputés |

## Phase 2 — Agrégation & API

| ID | Prio | Statut | Tâche |
|----|------|--------|-------|
| 2.0 | P0 | next | **(cloud-safe, sans DB)** Outiller les tests (vitest) + fonctions de calcul **pures** (niveaux heatmap 0–4, taux de participation, composantes indice de cohérence) avec tests unitaires sur fixtures. Base réutilisée ensuite par les jobs DB. |
| 2.1 | P0 | next | Job `activite_journaliere` (heatmap) — branche les fonctions pures de 2.0 sur la DB |
| 2.2 | P1 | next | Calcul des 3 taux de participation |
| 2.3 | P0 | next | API : recherche/liste député·es |
| 2.4 | P0 | next | API : fiche député·e + données heatmap |
| 2.5 | P0 | next | API : scrutin + votes par groupe |

## Phase 3 — Frontend POC

| ID | Prio | Statut | Tâche |
|----|------|--------|-------|
| 3.1 | P0 | next | Annuaire/recherche député·es (filtre groupe) |
| 3.2 | P0 | next | Fiche député·e : heatmap + votes + contexte + légende |
| 3.3 | P0 | next | Explorateur texte de loi (votes par groupe) |
| 3.4 | P0 | next | Page méthodologie + mentions légales + signaler une erreur |
| 3.5 | P1 | hitl | Déploiement Vercel + Supabase (validation humaine) |

## Phase 4 — Indice de cohérence v0

| ID | Prio | Statut | Tâche |
|----|------|--------|-------|
| 4.1 | P1 | next | Rattachement scrutins ↔ thèmes (1 thème pilote) |
| 4.2 | P1 | next | Cohérence vote / ligne de groupe (composante a) |
| 4.3 | P1 | next | Cohérence participation / thème revendiqué (composante c) |
| 4.4 | P0 | hitl | Validation manuelle échantillon + check-list juridique |
| 4.5 | P0 | hitl | Relecture humaine avant publication nominative |
