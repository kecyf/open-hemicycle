# Journal de bord — Open Hémicycle

Entrées les plus récentes en haut. Le dépôt est la mémoire de l'agent : ce journal est lu au début de chaque session et écrit à la fin (voir `AGENTS.md` §1 et la skill `daily-standup`).

---

## 2026-07-08 — Delta classify par run dans historique admin (4.8)

🔔 Pour le superviseur :
1. **`DATABASE_URL` cloud** : format OK mais **auth toujours en échec** (`password authentication failed for user "oh_agent"`) — copier la chaîne **identique** à GitHub Actions Secrets (ETL Refresh vert) dans Cursor Cloud Agents → Secrets.
2. **`OPENROUTER_API_KEY`** : absent en cloud **et** en GitHub Actions — ajouter dans les deux pour `classify:scrutins` autonome (cloud) ou via **Actions → Classify Scrutins (LLM)** / bouton `/admin` (workflow_dispatch).
3. **PR #19 (4.3b revendications)** : toujours DRAFT HITL — relecture superviseur requise avant merge (indicateur nominatif).

- **Objectif du jour** : afficher le delta de classifications par run GH Actions dans l'historique `/admin` (4.8) — tâche cloud-safe pendant blocage secrets.
- **Contexte** : `main` à jour (#48 historique runs enrichi) ; `pnpm etl check:db` → auth oh_agent KO ; OpenRouter absent ; PR #19 HITL ; pas de PR CI rouge.
- **Fait** :
  - **Core** : `extractClassifyStatsFromLogs`, `computeClassifyRunDelta`, `formatClassifyRunDeltaLabel`, `formatWorkflowRunDuration` ; 8 tests vitest.
  - **Admin** : historique runs affiche delta backlog (`+N classifiés · M en attente`) et durée ; parsing logs GH Actions via API (runs terminés, non dry_run).
  - **CI locale** : `typecheck` ✓, `test` ✓ (111/111), `build` ✓.
- **Appris** : `parseClassifyStatsLine` (veille) se branche enfin sur l'UI — le superviseur voit l'impact de chaque run classify sans ouvrir les logs GitHub.
- **Bloqueurs** : auth `oh_agent` cloud ; `OPENROUTER_API_KEY` (GH + cloud) ; relecture HITL PR #19.
- **Prochaine étape** : superviseur ajoute `OPENROUTER_API_KEY` en GH Secrets → lancer classify via `/admin` ou GH Actions (100/run, delay 500ms) ; sync `DATABASE_URL` cloud ; relecture PR #19.
- **Livraison** : PR en cours (auto-merge — outillage admin, non nominatif).
- **Commits** : `feat(admin): delta classify par run dans historique GH Actions (4.8)`.

---

## 2026-07-07 — Historique runs classify enrichi + auto-refresh admin (4.8)

🔔 Pour le superviseur :
1. **`DATABASE_URL` cloud** : format OK mais **auth toujours en échec** (`password authentication failed for user "oh_agent"`) — copier la chaîne **identique** à GitHub Actions Secrets (ETL Refresh vert) dans Cursor Cloud Agents → Secrets.
2. **`OPENROUTER_API_KEY`** : absent en cloud **et** en GitHub Actions — ajouter dans les deux pour `classify:scrutins` autonome (cloud) ou via **Actions → Classify Scrutins (LLM)** / bouton `/admin` (workflow_dispatch).
3. **PR #19 (4.3b revendications)** : toujours DRAFT HITL — relecture superviseur requise avant merge (indicateur nominatif).

- **Objectif du jour** : enrichir le pilotage classify sur `/admin` — paramètres des runs GH Actions + rafraîchissement auto pendant un run (4.8), tâche cloud-safe pendant blocage secrets.
- **Contexte** : `main` à jour (#47 dispatch classify) ; `pnpm etl check:db` → auth oh_agent KO ; OpenRouter absent ; PR #19 HITL ; pas de PR CI rouge.
- **Fait** :
  - **Core** : `parseClassifyStatsLine` (ligne stdout `classify:stats`) + `formatClassifyRunInputsLabel` ; 5 tests vitest.
  - **Admin** : historique runs affiche `limit` / `delay_ms` / `dry_run` ; `ClassifyRefreshPoller` (refresh 30 s si run en cours) ; cache runs GH 30 s.
  - **CI locale** : `typecheck` ✓, `test` ✓ (103/103), `build` ✓.
- **Appris** : l'API GitHub `listWorkflowRuns` expose les `inputs` workflow_dispatch — utile pour auditer les fournées classify depuis l'admin sans ouvrir chaque run.
- **Bloqueurs** : auth `oh_agent` cloud ; `OPENROUTER_API_KEY` (GH + cloud) ; relecture HITL PR #19.
- **Prochaine étape** : superviseur ajoute `OPENROUTER_API_KEY` en GH Secrets → lancer classify via `/admin` ou GH Actions (100/run, delay 500ms) ; sync `DATABASE_URL` cloud ; relecture PR #19.
- **Livraison** : PR en cours (auto-merge — outillage admin, non nominatif).
- **Commits** : `feat(admin): paramètres runs classify + auto-refresh (4.8)`.

---

## 2026-07-06 — Dispatch classify depuis /admin (4.8)

🔔 Pour le superviseur :
1. **`DATABASE_URL` cloud** : format OK mais **auth toujours en échec** (`password authentication failed for user "oh_agent"`) — copier la chaîne **identique** à GitHub Actions Secrets (ETL Refresh vert) dans Cursor Cloud Agents → Secrets.
2. **`OPENROUTER_API_KEY`** : absent en cloud **et** en GitHub Actions — ajouter dans les deux pour `classify:scrutins` autonome (cloud) ou via **Actions → Classify Scrutins (LLM)** / bouton `/admin` (workflow_dispatch).
3. **PR #19 (4.3b revendications)** : toujours DRAFT HITL — relecture superviseur requise avant merge (indicateur nominatif).

- **Objectif du jour** : déclenchement classify depuis `/admin` via GitHub API (4.8) — tâche cloud-safe pendant blocage secrets.
- **Contexte** : `main` à jour (#46 progression classify admin) ; `pnpm etl check:db` → auth oh_agent KO ; OpenRouter absent ; PR #19 HITL ; ETL Refresh + smoke prod verts (homepage 200 ; `/themes` 504 transitoire observé) ; pas de PR CI rouge.
- **Fait** :
  - **Core** : `parseClassifyDispatchInputs` (validation limit/delay_ms/dry_run) + 6 tests vitest.
  - **Admin** : bouton « Lancer classify (GH Actions) » sur panneau enrichissement ; route `POST /api/admin/classify` ; garde-fou run en cours ; état vide runs + lien run lancé.
  - **CI locale** : `typecheck` ✓, `test` ✓ (98/98), `build` ✓.
- **Appris** : le superviseur peut piloter classify depuis `/admin` sans quitter le dashboard — contournement utile tant que les secrets Cloud Agents ne sont pas synchronisés (le workflow utilise les secrets GitHub Actions).
- **Bloqueurs** : auth `oh_agent` cloud ; `OPENROUTER_API_KEY` (GH + cloud) ; relecture HITL PR #19.
- **Prochaine étape** : superviseur ajoute `OPENROUTER_API_KEY` en GH Secrets → lancer classify via `/admin` ou GH Actions (100/run, delay 500ms) ; sync `DATABASE_URL` cloud ; relecture PR #19.
- **Livraison** : PR en cours (auto-merge — outillage admin, non nominatif).
- **Commits** : `feat(admin): dispatch classify workflow depuis /admin (4.8)`.

---

## 2026-07-05 — Progression classify admin + historique runs GH Actions (4.8)

🔔 Pour le superviseur :
1. **`DATABASE_URL` cloud** : format OK mais **auth toujours en échec** (`password authentication failed for user "oh_agent"`) — copier la chaîne **identique** à GitHub Actions Secrets (ETL Refresh vert) dans Cursor Cloud Agents → Secrets.
2. **`OPENROUTER_API_KEY`** : absent en cloud **et** en GitHub Actions — ajouter dans les deux pour `classify:scrutins` autonome (cloud) ou via **Actions → Classify Scrutins (LLM)** (workflow_dispatch).
3. **PR #19 (4.3b revendications)** : toujours DRAFT HITL — relecture superviseur requise avant merge (indicateur nominatif).

- **Objectif du jour** : pilotage classify sur `/admin` — barre de progression + estimation runs + historique GH Actions (4.8), tâche cloud-safe pendant blocage secrets.
- **Contexte** : `main` à jour (#45 backlog classify admin) ; `pnpm etl check:db` → auth oh_agent KO ; OpenRouter absent ; PR #19 HITL ; ETL Refresh + smoke prod verts ; pas de PR CI rouge.
- **Fait** :
  - **Core** : `computeClassifyProgressSummary` (% + runs estimés à batch 100) + 5 tests vitest.
  - **Admin** : barre de progression classify, estimation runs restants, liste des 5 derniers runs workflow « Classify Scrutins (LLM) » via GitHub API.
  - **CI locale** : `typecheck` ✓, `test` ✓ (92/92), `build` ✓.
- **Appris** : le panneau admin permet de suivre l'avancement classify et l'historique des runs sans accès DB cloud agent — utile pendant la sync secrets.
- **Bloqueurs** : auth `oh_agent` cloud ; `OPENROUTER_API_KEY` (GH + cloud) ; relecture HITL PR #19.
- **Prochaine étape** : superviseur ajoute `OPENROUTER_API_KEY` en GH Secrets → lancer workflow classify (100/run, delay 500ms) ; sync `DATABASE_URL` cloud ; relecture PR #19.
- **Livraison** : PR en cours (auto-merge — outillage admin, non nominatif).
- **Commits** : `feat(admin): progression classify + historique runs GH Actions (4.8)`.

---

## 2026-07-04 — Backlog classify admin + lien workflow GH Actions (4.8)

🔔 Pour le superviseur :
1. **`DATABASE_URL` cloud** : format OK mais **auth toujours en échec** (`password authentication failed for user "oh_agent"`) — copier la chaîne **identique** à GitHub Actions Secrets (ETL Refresh vert) dans Cursor Cloud Agents → Secrets.
2. **`OPENROUTER_API_KEY`** : absent en cloud **et** en GitHub Actions — ajouter dans les deux pour `classify:scrutins` autonome (cloud) ou via **Actions → Classify Scrutins (LLM)** (workflow_dispatch).
3. **PR #19 (4.3b revendications)** : toujours DRAFT HITL — relecture superviseur requise avant merge (indicateur nominatif).

- **Objectif du jour** : visibilité backlog classify sur `/admin` (4.8) — tâche cloud-safe pendant blocage secrets.
- **Contexte** : `main` à jour (#44 workflow classify) ; `pnpm etl check:db` → auth oh_agent KO ; OpenRouter absent ; PR #19 HITL ; ETL Refresh + smoke prod verts.
- **Fait** :
  - **DB** : `getClassifyBacklogStats` + `computeClassifyBacklog` extraits dans `@open-hemicycle/db` (partagé ETL + admin).
  - **Admin** : panneau enrichissement affiche scrutins sans dossier / classifiés / en attente ; lien direct workflow GitHub Actions classify.
  - **CI locale** : `typecheck` ✓, `test` ✓ (87/87), `build` ✓.
- **Appris** : le superviseur peut piloter l'extension classify depuis `/admin` (backlog live) + GH Actions sans attendre le fix secrets cloud agent.
- **Bloqueurs** : auth `oh_agent` cloud ; `OPENROUTER_API_KEY` (GH + cloud) ; relecture HITL PR #19.
- **Prochaine étape** : superviseur ajoute `OPENROUTER_API_KEY` en GH Secrets → lancer workflow classify (100/run, delay 500ms) ; sync `DATABASE_URL` cloud ; relecture PR #19.
- **Livraison** : PR en cours (auto-merge — outillage admin, non nominatif).
- **Commits** : `feat(admin): backlog classify + lien workflow GH Actions (4.8)`.

---

## 2026-07-03 — Workflow GH Actions classify + contournement secrets cloud (4.8)

🔔 Pour le superviseur :
1. **`DATABASE_URL` cloud** : format OK mais **auth toujours en échec** (`password authentication failed for user "oh_agent"`) — copier la chaîne **identique** à GitHub Actions Secrets (ETL Refresh vert) dans Cursor Cloud Agents → Secrets.
2. **`OPENROUTER_API_KEY`** : absent en cloud **et** en GitHub Actions — ajouter dans les deux pour `classify:scrutins` autonome (cloud) ou via **Actions → Classify Scrutins (LLM)** (workflow_dispatch, pas de cron).
3. **PR #19 (4.3b revendications)** : toujours DRAFT HITL — relecture superviseur requise avant merge (indicateur nominatif).

- **Objectif du jour** : débloquer l'extension classify live malgré secrets cloud KO — workflow GitHub Actions + tests offline backlog.
- **Contexte** : `main` à jour (#43 retry/pacing) ; `pnpm etl check:db` → auth oh_agent KO ; OpenRouter absent ; PR #19 HITL ; pas de PR CI rouge.
- **Fait** :
  - **CI** : workflow `.github/workflows/classify-scrutins.yml` (workflow_dispatch, limit/delay_ms/dry_run, backlog avant/après).
  - **ETL** : `computeClassifyBacklog` extrait + 3 tests vitest ; script npm `classify:stats`.
  - **DB** : message `check:db` oriente vers GitHub Actions Secrets en cas d'auth échouée.
  - **Docs** : `automation/README.md`, `enrichissement-llm.md` (section GH Actions).
  - **CI locale** : `typecheck` ✓, `test` ✓ (87/87), `build` ✓.
- **Appris** : GitHub Actions a un `DATABASE_URL` fonctionnel (ETL Refresh) mais le secret Cloud Agent n'est pas synchronisé — le workflow classify permet au superviseur de lancer des runs sans attendre le fix cloud.
- **Bloqueurs** : auth `oh_agent` cloud ; `OPENROUTER_API_KEY` (GH + cloud) ; relecture HITL PR #19.
- **Prochaine étape** : superviseur ajoute `OPENROUTER_API_KEY` en GH Secrets → lancer workflow classify (100/run, delay 500ms) ; sync `DATABASE_URL` cloud ; relecture PR #19.
- **Livraison** : PR en cours (auto-merge — outillage CI, non nominatif).
- **Commits** : `feat(ci): workflow GitHub Actions classify:scrutins (4.8)`.

---

## 2026-07-02 — Retry OpenRouter + pacing classify:scrutins (4.8)

🔔 Pour le superviseur :
1. **`DATABASE_URL` cloud** : format OK mais **auth en échec** (`password authentication failed for user "oh_agent"`) — synchroniser le secret Cursor Cloud Agents avec la chaîne `.env.oh_agent` (identique à GitHub Actions, qui fonctionne).
2. **`OPENROUTER_API_KEY` cloud** : absent — copier depuis `.env` local pour `classify:scrutins` autonome.
3. **PR #19 (4.3b revendications)** : toujours DRAFT HITL — relecture superviseur requise avant merge (indicateur nominatif).

- **Objectif du jour** : extension cloud-safe du job `classify:scrutins` (retry, pacing, stats backlog) en attendant les secrets cloud.
- **Contexte** : `main` à jour (#42 GRANTs oh_agent) ; DB cloud KO (auth) ; OpenRouter absent ; PR #19 HITL en attente ; pas de PR bloquante CI rouge.
- **Fait** :
  - **ETL** : `withRetry` backoff (429/5xx) sur OpenRouter ; `--delay-ms` pour espacer les appels ; `classify:stats` (sans dossier / classifiés / en attente) ; backlog affiché au démarrage du job.
  - **Tests** : 7 tests vitest `retry` ; CI locale `typecheck` ✓, `test` ✓ (84/84), `build` ✓.
  - **Docs** : `enrichissement-llm.md` mis à jour (commandes `classify:stats`, `--delay-ms`).
- **Appris** : le secret cloud agent n'est toujours pas aligné sur GitHub Actions (auth oh_agent) — bloque classify live depuis l'automation malgré le format URL correct.
- **Bloqueurs** : secrets cloud (DATABASE_URL + OpenRouter) ; relecture HITL PR #19.
- **Prochaine étape** : superviseur sync secrets → `classify:stats` puis runs `classify:scrutins --limit=100 --delay-ms=500` jusqu'à couvrir le backlog (~7150 restants) ; relecture PR #19.
- **Livraison** : PR en cours (auto-merge — outillage ETL, non nominatif).
- **Commits** : `feat(etl): retry OpenRouter + pacing classify:scrutins (4.8)`.

---

## 2026-07-01 (après-midi) — Déblocage prod : GRANTs oh_agent + classify + ETL cron

🔔 Pour le superviseur :
1. **`DATABASE_URL` cloud (Cursor Automation)** : le secret GitHub Actions fonctionne (ETL Refresh **vert** manuel) ; **copier la même chaîne `.env.oh_agent` dans Cursor Cloud Agents → Secrets** — l'agent cloud échouait encore sur auth (mot de passe obsolète côté cloud).
2. **`OPENROUTER_API_KEY` cloud** : absent en cloud — **copier depuis `.env` local** vers Cursor Cloud Secrets pour `classify:scrutins` autonome.
3. **PR #19 (4.3b revendications)** : toujours DRAFT HITL — relecture superviseur requise avant merge (indicateur nominatif).

- **Objectif** : débloquer au maximum en autonomie (GRANTs, classification live, cron ETL, seed taxonomie).
- **Fait** :
  - **DB prod** : `GRANT DELETE` sur `affiliations_groupe` + `mandats` pour `oh_agent` (cause racine cron ETL rouge) ; fichier `0002_oh_agent_grants.sql` ; `check:db` vérifie les grants.
  - **Données** : `seed:themes` (8 thèmes taxonomie) ; `classify:scrutins --limit=100` → **650 classifications** en prod ; `ingest:deputes` OK avec `oh_agent`.
  - **CI** : ETL Refresh manuel **success** (run #28510690130).
  - **Docs** : `automation/README.md` (table secrets `.env.oh_agent` + OpenRouter).
- **Appris** : le mot de passe cloud agent ≠ GitHub Actions — deux secrets à synchroniser ; le blocage cron n'était pas l'auth mais l'absence de DELETE (42501).
- **Bloqueurs restants** : secrets cloud agent (DATABASE_URL + OPENROUTER) ; relecture HITL PR #19.
- **Prochaine étape** : superviseur sync secrets cloud → automation peut classifier en autonomie ; relecture PR #19 ; extension `classify:scrutins` (≈650/7800 sans dossier).
- **Livraison** : PR en cours (grants SQL + diagnostic — auto-merge).

---

## 2026-07-01 — Readiness enrichissement LLM admin + transparence DataNotice (4.8)

🔔 Pour le superviseur :
1. **`DATABASE_URL` cloud** : format OK, rôle `oh_agent` détecté mais **auth en échec** (`password authentication failed for user "oh_agent"`) — mettre à jour le mot de passe du secret. Panneaux `/admin` (DB + enrichissement) affichent l'état en direct. `pnpm etl check:db` pour vérifier. Bloque `seed:themes` et `classify:scrutins` depuis le cloud.
2. **Migration `scrutins_classifications`** : SQL prêt (`0001`) — **application prod = HITL** (DDL). Après application + secrets OK → `pnpm etl classify:scrutins --limit=50`.
3. **`OPENROUTER_API_KEY`** : absent en cloud — badge + panneau readiness sur `/admin` ; requis pour classification live.
4. **PR #19 (4.3b revendications)** : toujours DRAFT HITL — relecture superviseur requise avant merge (indicateur nominatif).

- **Objectif du jour** : panneau readiness enrichissement LLM sur `/admin` (4.8) + transparence dossier/classification assistée sur le bandeau DataNotice.
- **Contexte** : `main` à jour (#40 index thèmes + diagnostic DB) ; DB cloud KO (auth oh_agent) ; PR #19 HITL en attente ; pas de PR bloquante CI rouge.
- **Fait** :
  - **Admin** : `EnrichmentStatusPanel` (checklist migration+secrets, prompt/modèle, compteur classifications) ; badge `OpenRouter API` ; `checkDatabase` expose `classificationsCount`.
  - **Web** : `DataNotice` distingue dossier législatif (prioritaire) vs classification assistée (déploiement progressif).
  - **CI locale** : `pnpm typecheck` ✓, `pnpm test` ✓ (77/77), `pnpm build` ✓.
- **Appris** : les 3 bloqueurs 4.8 (DB, migration, OpenRouter) sont désormais visibles côte à côte dans l'admin — même pattern que le diagnostic DB de la veille.
- **Bloqueurs** : mot de passe `oh_agent` + OpenRouter (superviseur) ; application migration DDL (HITL) ; relecture PR #19.
- **Prochaine étape** : superviseur corrige secrets → migration DDL → `seed:themes` + run pilote `classify:scrutins` ; relecture HITL PR #19.
- **Livraison** : PR en cours (auto-merge — outillage admin + transparence bandeau, non nominatif).
- **Commits** : `feat(admin): panneau readiness enrichissement LLM (4.8)` ; `feat(db): compteur classifications dans checkDatabase` ; `fix(web): transparence dossier/LLM dans DataNotice`.

---

## 2026-06-30 — Index thèmes aligné + diagnostic DB admin (4.8)

🔔 Pour le superviseur :
1. **`DATABASE_URL` cloud** : format OK, rôle `oh_agent` détecté mais **auth en échec** (`password authentication failed for user "oh_agent"`) — mettre à jour le mot de passe du secret. Le panneau `/admin` affiche désormais l'état en direct. `pnpm etl check:db` pour vérifier. Bloque `seed:themes` et `classify:scrutins` depuis le cloud.
2. **Migration `scrutins_classifications`** : SQL prêt (`0001`) — **application prod = HITL** (DDL). Après application + secrets OK → `pnpm etl classify:scrutins --limit=50`.
3. **`OPENROUTER_API_KEY`** : absent en cloud — requis pour classification live.
4. **PR #19 (4.3b revendications)** : toujours DRAFT HITL — relecture superviseur requise avant merge (indicateur nominatif).

- **Objectif du jour** : aligner les compteurs `/themes` sur la logique dossier+LLM (4.8) + diagnostic DB visible dans l'admin.
- **Contexte** : `main` à jour (#39 transparence liste scrutins) ; DB cloud KO (auth oh_agent) ; PR #19 HITL en attente ; pas de PR bloquante CI rouge.
- **Fait** :
  - **Web** : `listThemes()` utilise `getThemeScrutinSourceCounts` (cohérent avec atlas/liste/fiche) ; panneau `DbStatusPanel` sur `/admin` (format, connexion, rôle, migration).
  - **DB** : `checkDatabase` extrait dans `@open-hemicycle/db` (partagé ETL + admin).
  - **Docs** : `enrichissement-llm.md` étapes 9–10 (liste scrutins + index thèmes).
  - **CI locale** : `pnpm typecheck` ✓, `pnpm test` ✓ (77/77), `pnpm build` ✓.
- **Appris** : l'index `/themes` sous-comptait les scrutins (dossier seul) — incohérence corrigée avant le premier run LLM prod.
- **Bloqueurs** : mot de passe `oh_agent` + OpenRouter (superviseur) ; application migration DDL (HITL) ; relecture PR #19.
- **Prochaine étape** : superviseur corrige secrets → migration DDL → `seed:themes` + run pilote `classify:scrutins` ; relecture HITL PR #19.
- **Livraison** : PR en cours (auto-merge — alignement compteurs + outillage admin, non nominatif).
- **Commits** : `fix(web): aligner compteurs themes sur dossier+LLM (4.8)` ; `feat(admin): panneau diagnostic DATABASE_URL` ; `refactor(db): extraire checkDatabase partagé`.

---

## 2026-06-29 — Liste scrutins : transparence source thématique (4.8)

🔔 Pour le superviseur :
1. **`DATABASE_URL` cloud** : format OK, rôle `oh_agent` détecté mais **auth en échec** (`password authentication failed for user "oh_agent"`) — mettre à jour le mot de passe du secret. `pnpm etl check:db` pour vérifier. Bloque `seed:themes` et `classify:scrutins` depuis le cloud.
2. **Migration `scrutins_classifications`** : SQL prêt (`0001`) — **application prod = HITL** (DDL). Après application + secrets OK → `pnpm etl classify:scrutins --limit=50`.
3. **`OPENROUTER_API_KEY`** : absent en cloud — requis pour classification live.
4. **PR #19 (4.3b revendications)** : toujours DRAFT HITL — relecture superviseur requise avant merge (indicateur nominatif).

- **Objectif du jour** : transparence source sur la liste scrutins filtrée par thème (4.8).
- **Contexte** : `main` à jour (#38 cron ETL) ; DB cloud KO (auth oh_agent) ; PR #19 HITL en attente ; pas de PR bloquante CI rouge.
- **Fait** :
  - **Web** : composant partagé `ThemeScrutinSourceNote` ; `/scrutins?theme=…` affiche le décompte dossier / classification assistée ; lien vers l'atlas du thème ; refactor atlas pour réutiliser le composant.
  - **CI locale** : `pnpm typecheck` ✓, `pnpm test` ✓ (77/77), `pnpm build` ✓.
- **Appris** : le rôle cloud est passé de `postgres` à `oh_agent` (progrès) mais le mot de passe reste invalide — le diagnostic `check:db` distingue bien format / auth / migration.
- **Bloqueurs** : mot de passe `oh_agent` + OpenRouter (superviseur) ; application migration DDL (HITL) ; relecture PR #19.
- **Prochaine étape** : superviseur corrige secrets → migration DDL → `seed:themes` + run pilote `classify:scrutins` ; relecture HITL PR #19.
- **Livraison** : PR en cours (auto-merge — enrichissement transparence existante, non nominatif).
- **Commits** : `feat(web): transparence source dossier/LLM sur liste scrutins (4.8)`.

---

## 2026-06-28 — Fiche scrutin : source thématique dossier/LLM (4.8)

🔔 Pour le superviseur :
1. **`DATABASE_URL` cloud** : format OK mais **auth toujours en échec** (`password authentication failed for user "postgres"`) — mettre à jour le secret avec le rôle **`oh_agent`** et un mot de passe valide. `pnpm etl check:db` pour vérifier. Bloque `seed:themes` et `classify:scrutins` depuis le cloud.
2. **Migration `scrutins_classifications`** : SQL prêt (`0001`) — **application prod = HITL** (DDL). Après application + secrets OK → `pnpm etl classify:scrutins --limit=50`.
3. **`OPENROUTER_API_KEY`** : absent en cloud — requis pour classification live.
4. **PR #19 (4.3b revendications)** : toujours DRAFT HITL — relecture superviseur requise avant merge (indicateur nominatif).

- **Objectif du jour** : transparence source sur la fiche scrutin (dossier vs classification assistée, 4.8).
- **Contexte** : `main` à jour (#35 décompte source atlas) ; DB cloud KO (auth postgres) ; PR #19 HITL en attente ; pas de PR bloquante CI rouge.
- **Fait** :
  - **Web** : `ScrutinThemeLink` + `getScrutinDetail` lit la classification LLM si table présente et dossier non thématisé ; badge « classification assistée » sur `/scrutins/[uid]`.
  - **Docs** : `METHODOLOGY.md` §5 (classification assistée déployée progressivement) ; `enrichissement-llm.md` pipeline étape fiche scrutin.
  - **CI locale** : `pnpm typecheck` ✓, `pnpm test` ✓ (77/77), `pnpm build` ✓.
- **Appris** : la transparence source peut être préparée côté UI avant le premier run prod — les badges LLM n'apparaîtront qu'après migration + classification.
- **Bloqueurs** : credentials cloud DB + OpenRouter (superviseur) ; application migration DDL (HITL) ; relecture PR #19.
- **Prochaine étape** : superviseur corrige secrets → migration DDL → `seed:themes` + run pilote `classify:scrutins` ; relecture HITL PR #19.
- **Livraison** : PR en cours (auto-merge — enrichissement transparence existante, non nominatif).
- **Commits** : `feat(web): source thématique dossier/LLM sur fiche scrutin (4.8)`.

---

## 2026-06-27 — Atlas : décompte source dossier / classification LLM (4.8)

🔔 Pour le superviseur :
1. **`DATABASE_URL` cloud** : format OK mais **auth toujours en échec** (`password authentication failed for user "postgres"`) — mettre à jour le secret avec le rôle **`oh_agent`** et un mot de passe valide. `pnpm etl check:db` pour vérifier. Bloque `seed:themes` et `classify:scrutins` depuis le cloud.
2. **Migration `scrutins_classifications`** : SQL prêt (`0001`) — **application prod = HITL** (DDL). Après application + secrets OK → `pnpm etl classify:scrutins --limit=50`.
3. **`OPENROUTER_API_KEY`** : absent en cloud — requis pour classification live.
4. **PR #19 (4.3b revendications)** : toujours DRAFT HITL — relecture superviseur requise avant merge (indicateur nominatif).

- **Objectif du jour** : transparence source sur l'atlas thématique (dossier vs classification assistée, 4.8).
- **Contexte** : `main` à jour (#34 doc méthodologie) ; DB cloud KO (auth postgres) ; PR #19 HITL en attente ; pas de PR ouverte bloquante.
- **Fait** :
  - **Web** : `getThemeScrutinSourceCounts` + refactor `dossierThemeScrutinCondition` / `llmThemeScrutinCondition` ; page `/themes/[slug]` affiche le décompte par source (dégradation si migration absente).
  - **CI locale** : `pnpm typecheck` ✓, `pnpm test` ✓ (77/77), `pnpm build` ✓.
- **Appris** : l'UI atlas peut préparer la transparence LLM avant le premier run prod — le décompte LLM reste à 0 tant que la table n'est pas peuplée.
- **Bloqueurs** : credentials cloud DB + OpenRouter (superviseur) ; application migration DDL (HITL) ; relecture PR #19.
- **Prochaine étape** : superviseur corrige secrets → migration DDL → `seed:themes` + run pilote `classify:scrutins` ; relecture HITL PR #19.
- **Livraison** : PR en cours (auto-merge — enrichissement page atlas existante, non nominatif).
- **Commits** : `feat(web): décompte source dossier/LLM sur atlas thématique (4.8)`.

---

## 2026-06-26 — Rebase PR #19 (slugs taxonomie) + doc classification assistée (4.8)

🔔 Pour le superviseur :
1. **`DATABASE_URL` cloud** : format OK mais **auth toujours en échec** (`password authentication failed for user "postgres"`) — mettre à jour le secret avec le rôle **`oh_agent`** et un mot de passe valide. `pnpm etl check:db` pour vérifier. Bloque `seed:themes` et `classify:scrutins` depuis le cloud.
2. **Migration `scrutins_classifications`** : SQL prêt (`0001`) — **application prod = HITL** (DDL). Après application + secrets OK → `pnpm etl classify:scrutins --limit=50`.
3. **`OPENROUTER_API_KEY`** : absent en cloud — requis pour classification live.
4. **PR #19 (4.3b revendications)** : **rebasée sur `main`** + slugs migrés vers taxonomie (`affaires-economiques`, `defense-forces-armees`) — toujours DRAFT HITL ; **relecture superviseur requise** avant merge (indicateur nominatif).

- **Objectif du jour** : rebase PR #19 (slugs taxonomie 4.3b) + aligner pages méthodologie/thèmes sur la couche 4.8.
- **Contexte** : `main` à jour (#33 infra revendications) ; DB cloud KO ; PR #19 en conflit depuis merge #33.
- **Fait** :
  - **PR #19** : rebasée sur `main` (conflits CHANGELOG/BACKLOG résolus) ; slugs pilote → taxonomie ; `hasThemeRevendique` via `resolveThemeSlugForDb` ; `validate:revendications` OK (2 députés).
  - **Web** : page `/methodologie` §4 — taxonomie 8 commissions + classification assistée (dossier prioritaire) ; page `/themes` — copie alignée.
  - **CI locale** : `pnpm typecheck` ✓, `pnpm test` ✓ (77/77), `pnpm build` ✓.
- **Appris** : l'infra taxonomie (#33) permet de sourcer les revendications directement en slugs commissions ; la doc publique pouvait avancer sans DB.
- **Bloqueurs** : credentials cloud DB + OpenRouter (superviseur) ; application migration DDL (HITL) ; relecture PR #19.
- **Prochaine étape** : superviseur corrige secrets → migration DDL → `seed:themes` + run pilote `classify:scrutins` ; relecture HITL PR #19.
- **Livraison** : PR doc (auto-merge) ; PR #19 mise à jour (HITL, pas de merge).
- **Commits** : `docs(web): aligner méthodologie et thèmes sur taxonomie + LLM (4.8)` ; PR #19 poussée sur `cursor/proc-dure-daily-standup-c137`.

---

## 2026-06-25 — Infra revendications taxonomie + rebase PR #19 (4.3b/4.8)

🔔 Pour le superviseur :
1. **`DATABASE_URL` cloud** : format OK mais **auth toujours en échec** (`password authentication failed for user "postgres"`) — mettre à jour le secret avec le rôle **`oh_agent`** et un mot de passe valide. `pnpm etl check:db` pour vérifier. Bloque `seed:themes` et `classify:scrutins` depuis le cloud.
2. **Migration `scrutins_classifications`** : SQL prêt (`0001`) — **application prod = HITL** (DDL). Après application + secrets OK → `pnpm etl classify:scrutins --limit=50`.
3. **`OPENROUTER_API_KEY`** : absent en cloud — requis pour classification live.
4. **PR #19 (4.3b revendications)** : **rebasée sur `main`** (conflits CHANGELOG résolus) — toujours DRAFT HITL ; relecture superviseur requise avant merge. Migrer slugs pilote → taxonomie dans #19 après merge de l'infra (cette PR).

- **Objectif du jour** : infra cloud-safe 4.3b (slugs taxonomie) + durcissement offline 4.8 + rebase PR #19.
- **Contexte** : `main` à jour (#32 atlas LLM) ; DB cloud KO ; PR #19 en conflit depuis 10 jours.
- **Fait** :
  - **Core** : `isKnownThemeSlug` ; `validate:revendications` accepte taxonomie + pilotes dépréciés ; `hasThemeRevendique` résout via `resolveThemeSlugForDb`.
  - **Web** : `getComparaisonsParticipationThemesRevendiques` résout slugs DB taxonomie.
  - **Tests** : `validate/enrichissement.test.ts` (4 tests) ; `isKnownThemeSlug` + slug taxonomie dans revendications (73 tests core).
  - **PR #19** : rebasée sur `main`, poussée (`cursor/proc-dure-daily-standup-c137`).
  - **CI locale** : `pnpm typecheck` ✓, `pnpm test` ✓ (77/77), `pnpm build` ✓.
- **Appris** : l'infra taxonomie pour revendications peut avancer sans DB ; PR #19 reste sur slugs pilotes jusqu'à merge de l'infra.
- **Bloqueurs** : credentials cloud DB + OpenRouter (superviseur) ; application migration DDL (HITL) ; relecture PR #19.
- **Prochaine étape** : superviseur corrige secrets → migration DDL → `seed:themes` + run pilote `classify:scrutins` ; merge infra puis migrer slugs PR #19 → taxonomie ; relecture HITL PR #19.
- **Livraison** : PR en cours (auto-merge — infra pure, pas de surface nominative nouvelle).
- **Commits** : `feat(core): revendications et validate enrichissement alignés taxonomie (4.3b/4.8)`.

---

## 2026-06-24 — Lecture atlas : resolveEffectiveThemeSlug (4.8)

🔔 Pour le superviseur :
1. **`DATABASE_URL` cloud** : format OK mais **auth toujours en échec** (`password authentication failed for user "postgres"`) — mettre à jour le secret avec le rôle **`oh_agent`** et un mot de passe valide. `pnpm etl check:db` pour vérifier. Bloque `seed:themes` et `classify:scrutins` depuis le cloud.
2. **Migration `scrutins_classifications`** : SQL prêt (`0001`) — **application prod = HITL** (DDL). Après application + secrets OK → `pnpm etl classify:scrutins --limit=50`. L'atlas web bascule automatiquement sur les classifications LLM une fois la table peuplée (dégradation gracieuse tant qu'elle est absente).
3. **`OPENROUTER_API_KEY`** : absent en cloud — requis pour classification live.
4. **PR #19 (4.3b revendications)** : toujours DRAFT HITL — rebaser + relecture superviseur avant merge.

- **Objectif du jour** : brancher `resolveEffectiveThemeSlug` dans l'atlas web (couche 4.8).
- **Contexte** : `main` à jour (#31 durcissement offline) ; DB cloud KO ; PR #19 HITL en attente.
- **Fait** :
  - **Web** : `themeScrutinCondition` — filtre combiné dossier + classifications LLM (prompt v1, seuil 0,75) ; dégradation si table absente.
  - **Core** : `scrutinBelongsToEffectiveTheme` + 2 tests vitest.
  - **UI** : copie atlas mentionne classification assistée (lien méthodologie).
  - **Docs** : `enrichissement-llm.md` — lecture atlas documentée.
  - **CI locale** : `pnpm typecheck` ✓, `pnpm test` ✓ (71/71), `pnpm build` ✓.
- **Appris** : l'atlas peut déployer la logique LLM avant migration/run — comportement identique à l'existant tant que la table n'existe pas.
- **Bloqueurs** : credentials cloud DB + OpenRouter (superviseur) ; application migration DDL (HITL) ; relecture PR #19.
- **Prochaine étape** : superviseur corrige secrets → migration DDL → `seed:themes` + run pilote `classify:scrutins` ; rebaser PR #19.
- **Livraison** : PR en cours (auto-merge — logique requête, pas de surface nominative nouvelle).
- **Commits** : `feat(web): atlas lit resolveEffectiveThemeSlug (dossier > LLM)`.

---

## 2026-06-23 — Enrichissement LLM offline (4.8)

🔔 Pour le superviseur :
1. **`DATABASE_URL` cloud** : format OK mais **auth toujours en échec** (`password authentication failed for user "postgres"`) — mettre à jour le secret avec le rôle **`oh_agent`** et un mot de passe valide. `pnpm etl check:db` pour vérifier. Bloque `seed:themes` et `classify:scrutins` depuis le cloud.
2. **Migration `scrutins_classifications`** : SQL prêt (`0001`) — **application prod = HITL** (DDL). Après application + secrets OK → `pnpm etl classify:scrutins --limit=50`.
3. **`OPENROUTER_API_KEY`** : absent en cloud — requis pour classification live.
4. **PR #19 (4.3b revendications)** : toujours DRAFT HITL, **1 commit derrière `main`** — rebaser + relecture superviseur avant merge.

- **Objectif du jour** : durcir la couche 4.8 en mode cloud-safe (tests, CI, lecture atlas).
- **Contexte** : `main` à jour (#30 seed taxonomie) ; DB cloud KO ; PR #19 HITL en attente.
- **Fait** :
  - **Core** : `resolveEffectiveThemeSlug` (dossier > LLM) + `confidenceToBasisPoints` ; 7 tests vitest.
  - **ETL** : `classify:scrutins` ignore les scrutins déjà classifiés (prompt v1) ; 4 tests vitest (`classify-scrutin`, `prompt-v1`).
  - **CI** : `validate:taxonomie`, `validate:themes`, `validate:enrichissement` exécutés à chaque PR.
  - **Docs** : `enrichissement-llm.md` (lecture atlas + skip rejeu).
  - **CI locale** : `pnpm typecheck` ✓, `pnpm test` ✓ (69/69), `pnpm build` ✓, validates ✓.
- **Appris** : la couche 4.8 peut avancer sans DB ni OpenRouter — la CI bloque désormais toute régression sur l'échantillon-or.
- **Bloqueurs** : credentials cloud DB + OpenRouter (superviseur) ; application migration DDL (HITL) ; relecture PR #19.
- **Prochaine étape** : superviseur corrige secrets → `seed:themes` + run pilote `classify:scrutins` ; rebaser PR #19 ; brancher `resolveEffectiveThemeSlug` dans l'atlas web.
- **Livraison** : PR en cours (auto-merge — logique pure + outillage, pas de surface nominative nouvelle).
- **Commits** : `feat(core): resolveEffectiveThemeSlug + confidenceToBasisPoints` ; `feat(etl): skip déjà classifiés + tests vitest` ; `ci: validate ETL offline`.

---

## 2026-06-21 — Seed thèmes taxonomie (4.7)

🔔 Pour le superviseur :
1. **`DATABASE_URL` cloud** : format OK mais **auth toujours en échec** (`password authentication failed for user "postgres"`) — mettre à jour le secret avec le rôle **`oh_agent`** et un mot de passe valide. `pnpm etl check:db` pour vérifier. Bloque `seed:themes` en prod depuis le cloud.
2. **Migration `scrutins_classifications`** : SQL prêt (`0001`) — **application prod = HITL** (DDL). Après application + secrets OK → `pnpm etl classify:scrutins --limit=50`.
3. **`OPENROUTER_API_KEY`** : absent en cloud — requis pour classification live.
4. **PR #19 (4.3b revendications)** : rebasée sur `main` (2026-06-21) — toujours DRAFT HITL, relecture superviseur requise avant merge.

- **Objectif du jour** : finaliser migration 4.7 — basculer `seed:themes` sur slugs taxonomie (cloud-safe).
- **Contexte** : `main` à jour (#29 résolution web) ; DB cloud KO ; PR #19 HITL rebasée.
- **Fait** :
  - **ETL** `themes.ts` : 8 thèmes commissions AN, dossiers pilotes migrés vers slugs taxonomie.
  - **`seedThemes`** : détache les liens des slugs pilotes dépréciés (sans DELETE sur table `themes`).
  - **Core** `resolveThemeSlugForDb` : pilote → taxonomie pour requêtes DB.
  - **`pnpm etl validate:themes`** : vérifie l'alignement du fichier seed.
  - **PR #19** : rebasée sur `main`, conflits résolus, poussée.
  - **CI** : `pnpm typecheck` ✓, `pnpm test` ✓ (58/58), `pnpm build` ✓, `validate:themes` ✓, `validate:taxonomie` ✓.
- **Appris** : le code peut basculer sur taxonomie avant l'exécution prod — le prochain `seed:themes` (cron ou manuel) projetera les 8 thèmes et migrera les dossiers.
- **Bloqueurs** : credentials cloud DB + OpenRouter (superviseur) ; application migration DDL (HITL) ; relecture PR #19.
- **Prochaine étape** : superviseur corrige secrets → `pnpm etl seed:themes` en prod ; run pilote `classify:scrutins` ; merge HITL PR #19.
- **Livraison** : PR en cours (auto-merge — ETL + core, pas de surface nominative nouvelle).
- **Commits** : `feat(etl): seed:themes basculé sur slugs taxonomie (8 commissions)`.

---

## 2026-06-20 — Résolution slugs pilote → taxonomie (migration web)

🔔 Pour le superviseur :
1. **`DATABASE_URL` cloud** : format OK mais **auth toujours en échec** (`password authentication failed for user "postgres.lswnzmhzxyjfqhwgxhoa"`) — mettre à jour le secret avec le rôle **`oh_agent`** et un mot de passe valide. `pnpm etl check:db` pour vérifier.
2. **Migration `scrutins_classifications`** : SQL prêt (`0001`) — **application prod = HITL** (DDL). Après application + secrets OK → `pnpm etl classify:scrutins --limit=50`.
3. **`OPENROUTER_API_KEY`** : absent en cloud — requis pour classification live.
4. **PR #19 (4.3b revendications)** : toujours DRAFT HITL — à rebaser sur `main` avant relecture superviseur.

- **Objectif du jour** : migration progressive slugs pilote → taxonomie (couche web, cloud-safe).
- **Contexte** : `main` à jour (#28 check:db) ; DB cloud KO (rôle postgres invalide) ; PR #19 HITL en attente.
- **Fait** :
  - **Core** `theme-slug-resolution.ts` : `getCanonicalThemeSlug`, `resolveThemeSlugForDb`, `enrichThemeRowForDisplay` + 6 tests vitest.
  - **Web** : `/themes/[slug]` redirige les slugs pilotes vers l'URL canonique taxonomie ; `listThemes` / `getThemeAtlas` / filtres scrutins résolvent les deux formes de slug.
  - **CI** : `pnpm typecheck` ✓, `pnpm test` ✓ (58/58), `pnpm build` ✓.
- **Appris** : la migration peut avancer côté web sans toucher la DB — les slugs pilotes restent en base, la couche de résolution fait le pont.
- **Bloqueurs** : credentials cloud DB + OpenRouter (superviseur) ; application migration DDL (HITL) ; relecture PR #19.
- **Prochaine étape** : superviseur corrige secrets → `seed:themes` avec slugs taxonomie ; rebaser PR #19 ; run pilote `classify:scrutins`.
- **Livraison** : PR en cours (auto-merge — logique pure, pas de surface nominative nouvelle).
- **Commits** : `feat(core): résolution slugs pilote → taxonomie (migration progressive)`.

---

## 2026-06-19 — Migration DDL classif. + diagnostic DB (4.8)

🔔 Pour le superviseur :
1. **`DATABASE_URL` cloud** : format OK mais **auth toujours en échec** (`password authentication failed for user "postgres"`) — mettre à jour le secret avec le rôle **`oh_agent`** et un mot de passe valide. `pnpm etl check:db` permet de vérifier en une commande.
2. **Migration `scrutins_classifications`** : SQL prêt dans `packages/db/drizzle/0001_scrutins_classifications.sql` — **application en prod = HITL** (DDL). Après application + secrets OK → `pnpm etl classify:scrutins --limit=50`.
3. **`OPENROUTER_API_KEY`** : absent en cloud — requis pour classification live.
4. **PR #19 (4.3b revendications)** : toujours DRAFT HITL, **CONFLICTING** avec `main` — rebaser avant relecture.

- **Objectif du jour** : tâche backlog **4.8** — préparer migration DDL + diagnostic connexion DB (cloud-safe).
- **Contexte** : `main` à jour (atlas 4.9 + admin en prod, #25–#27) ; une seule PR ouverte (#19 HITL) ; DB cloud KO.
- **Fait** :
  - **Migration SQL** `0001_scrutins_classifications.sql` (idempotent, FK + index).
  - **`pnpm etl check:db`** : format URL, auth, compteur scrutins, présence table classif.
  - **Docs** : `docs/enrichissement-llm.md`, `.env.example` (rôle `oh_agent`).
  - **CI** : `pnpm typecheck` ✓, `pnpm test` ✓ (52/52), `pnpm build` ✓, `validate:enrichissement` ✓.
- **Appris** : le secret cloud utilise encore le rôle `postgres` (mot de passe invalide) malgré la consigne `oh_agent` — le diagnostic `check:db` le signale explicitement.
- **Bloqueurs** : credentials cloud DB + OpenRouter (superviseur) ; application migration DDL (HITL) ; relecture PR #19.
- **Prochaine étape** : superviseur applique migration + corrige secrets → run pilote `classify:scrutins` ; rebaser PR #19 ; configurer `GITHUB_ADMIN_TOKEN` + `CURSOR_API_KEY` pour admin complet.
- **Commits** : PR (auto-merge — outillage + SQL, pas de surface publique).

---

## 2026-06-18 — Ship atlas + admin en production

🔔 Pour le superviseur : `/admin` sur https://open-hemicycle.vercel.app/admin — OAuth GitHub (`kecyf`). Correctif boucle de redirection (signIn custom) déployé en #26.

- **Objectif** : résoudre conflits PR #22 + #23, livrer la version la plus avancée en prod.
- **Fait** : PR #25 mergée (atlas 4.9 + admin HITL + #24) ; #22/#23 fermées ; fix auth redirect loop.
- **Prochaine étape** : stabiliser la boucle (moins de PR qui s'empilent) ; configurer `GITHUB_ADMIN_TOKEN` + `CURSOR_API_KEY` pour l'admin complet.

---

## 2026-06-18 — Couche d'enrichissement LLM (4.8 fondations)

🔔 Pour le superviseur :
1. **`DATABASE_URL` cloud** : toujours en échec (`password authentication failed for user "postgres"`) — mettre à jour le secret avec le rôle `oh_agent` (mot de passe valide). Bloque `pnpm etl stats` / `classify:scrutins` depuis le cloud.
2. **`OPENROUTER_API_KEY`** : absent en cloud — requis pour classification live (secret superviseur).
3. **Migration `scrutins_classifications`** : schéma ajouté dans `packages/db/src/schema.ts` — application DDL en prod = **HITL** (AGENTS.md §3).
4. **PR #19 (4.3b revendications)** : toujours DRAFT HITL.

- **Objectif du jour** : tâche backlog **4.8** — fondations couche d'enrichissement LLM (classification scrutin → thème).
- **Contexte** : PR #23 ouverte (4.9 HITL, CI verte) ; `DATABASE_URL` cloud KO ; pas de clé OpenRouter.
- **Fait** :
  - **Core** `classification-scrutin.ts` : parse JSON LLM, seuil 0,75, métriques échantillon-or (10 tests vitest).
  - **Échantillon-or** 15 scrutins annotés + benchmark offline (86,7 % accuracy).
  - **ETL** : prompt v1, client OpenRouter, `validate:enrichissement`, job `classify:scrutins` (dry-run).
  - **Schéma** `scrutins_classifications` (versionné par prompt_version).
  - **Docs** : `docs/enrichissement-llm.md`, `METHODOLOGY.md` §5, `.env.example`.
  - **CI** : `pnpm typecheck` ✓, `pnpm test` ✓ (49/49), `pnpm build` ✓, `validate:enrichissement` ✓.
- **Appris** : la chaîne offline (gold + benchmark fixtures) permet de valider la méthode sans DB ni API ; 2 faux positifs simulés suffisent à tester les métriques FP/recall.
- **Bloqueurs** : credentials cloud DB + OpenRouter (superviseur) ; migration DDL HITL ; relecture PR #23.
- **Prochaine étape** : appliquer migration + corriger secrets → run pilote `classify:scrutins --limit=50` ; mesurer précision live sur échantillon-or ; enchaîner merge PR #23 (HITL).
- **Commits** : PR #24 (auto-merge).

---

## 2026-06-17 — Atlas thématique (4.9)

- **Objectif du jour** : page atlas `/themes/[slug]` (positionnement par groupe, non nominatif).
- **Fait** : `positionnement-theme.ts`, `getThemeAtlas`, `GroupeVentilationBar`, page atlas.
- **Commits** : PR #23 (HITL).

---

## 2026-06-16 — Espace admin HITL + hygiène boucle autonomie

- **Fait** : `/admin` (OAuth GitHub), dashboard PR/CI/HITL, `supervisor-inbox.md`, checklist post-PR, shadcn/ui.
- **Livraison** : PR #22 mergée → prod (HITL superviseur).

---

## 2026-06-16 — Taxonomie thématique neutre (4.7)

🔔 Pour le superviseur :
1. **`DATABASE_URL` cloud** : toujours en échec (`password authentication failed for user "postgres"`) — mettre à jour le secret Cursor Cloud avec le rôle `oh_agent` (ou mot de passe valide). Bloque ETL agent et `seed:themes` depuis le cloud.
2. **PR #19 (4.3b revendications pilote)** : toujours en DRAFT, CI verte, en attente relecture superviseur (HITL — pas d'auto-merge).
3. **Migration slugs taxonomie** : les 8 thèmes commissions sont définis en code mais les slugs pilotes restent actifs en base/URL — bascule DB à planifier (évite de casser les liens existants).

- **Objectif du jour** : tâche backlog **4.7** — taxonomie de thèmes neutre (nomenclature + méthode anti-biais).
- **Contexte** : PR #19 ouverte (HITL, ne pas dupliquer) ; `main` à jour (PR #20 mergée, 4.6 done) ; `DATABASE_URL` cloud KO → travail sans écriture DB.
- **Fait** :
  - **`theme-taxonomie.ts`** (core) : 8 thèmes = 8 commissions permanentes AN, UID `PO*` extraits du dump AMO10 (législature 17).
  - **`docs/theme-taxonomy.md`** : méthode de sélection anti-biais (ancrage institutionnel art. 36 Règlement, symétrie, limites, règles de rattachement, plan de migration pilote).
  - **`validateThemeTaxonomie`** + `pnpm etl validate:taxonomie` + 6 tests vitest.
  - **`METHODOLOGY.md` §5**, `data-sources.md`, `BACKLOG` (4.6→done, 4.7→done), `ROADMAP` mis à jour.
  - **CI locale** : `pnpm typecheck` ✓, `pnpm test` ✓ (39/39), `pnpm build` ✓, `validate:taxonomie` ✓.
- **Appris** : le dump AMO10 contient exactement 8 organes `COMPER` (commissions permanentes) avec des UID stables pour la 17e législature ; la taxonomie peut s'ancrer dessus sans choix éditorial ad hoc.
- **Bloqueurs** : credential `DATABASE_URL` cloud (superviseur) ; HITL PR #19 et UI 4.2/4.3.
- **Prochaine étape** : 4.8 (couche enrichissement LLM) ou migration slugs taxonomie en base ; corriger secret DB cloud ; relecture PR #19.
- **Commits** : PR (auto-merge — logique pure + docs, non nominatif, travail sûr).

---

## 2026-06-15 — 🧭 Réorientation produit : atlas thématique + couche d'enrichissement

🔔 Pour le superviseur : décision stratégique actée **avec** le superviseur (brainstorm de session). Aucune publication nominative engagée ; les nouveaux chantiers (4.6–4.9) sont **non nominatifs** donc autonomes. La cohérence dire/faire nominative reste HITL.

- **Contexte** : questionnement superviseur sur (1) une incohérence d'affichage homepage (645 vs 577) et (2) le positionnement produit (« score de confiance/honnêteté » vs garde-fous).
- **Décisions** (3 carrefours tranchés par le superviseur) :
  1. **Abandon du « score »** unique de confiance/honnêteté comme objet produit — confirme et renforce `METHODOLOGY.md` §4/§7. On fait *parler* la donnée par l'agrégation factuelle + sourcing + symétrie, pas par un verdict agrégé.
  2. **Produit phare = atlas des positionnements par thème** (niveau **groupe**, non nominatif). La cohérence dire/faire nominative (Produit B) devient une couche ultérieure, sous relecture juridique.
  3. **Entrée principale = le THÈME** (« sur l'immigration, qui vote quoi »), pas le député.
- **Nouveau positionnement de valeur** : au-delà de l'UI, la **couche d'enrichissement** qui structure la donnée brute (rattacher les ~80 % de scrutins sans dossier à un thème). Outil envisagé : classification par LLM (clé OpenRouter superviseur), **strictement encadrée** : classer jamais juger, sortie figée/versionnée/auditable (modèle+prompt+confiance+date), fallback « non classé », précision mesurée, humain sur cas limites. Ligne légale : enrichir les *métadonnées* (scrutins/thèmes), **jamais les personnes**.
- **Fait** :
  - `VISION.md` : phrase produit (atlas), étage 3 + valeur en deux couches, section « angle distinctif » réécrite (atlas maintenant / cohérence plus tard / « jamais de score »), nouvelle section « couche d'enrichissement », critères de succès M1 réordonnés (thème d'abord).
  - `ROADMAP.md` + `tasks/BACKLOG.md` : Phase 4 réorientée ; tâches **4.6** (cohérence effectifs 577/645), **4.7** (taxonomie thèmes neutre), **4.8** (enrichissement LLM versionné), **4.9** (page thème publique) — toutes `next`, non nominatives.
  - **4.6 implémentée** : `getGlobalCounts()` renvoie `deputesEnMandat` ; homepage + `/deputes` + `DataNotice` (live) affichent « en mandat / ayant siégé ». Diagnostic : **645** = `COUNT(*)` `deputes` (+68 AMO30) ; **577** = constante en dur obsolète.
- **Prochaine étape** : brainstorm 4.7 (méthode de sélection des thèmes neutre/anti-biais) avant code → 4.8 → 4.9. La méthodo `docs/METHODOLOGY.md` devra documenter la couche d'enrichissement avant publication de l'atlas.
- **Garde-fous** : symétrie de la **sélection des thèmes** identifiée comme nouveau risque de biais (choisir les thèmes EST un acte éditorial) → méthode neutre publiée requise.
- **Commits** : PR (auto-merge — docs + fix effectifs non nominatif, travail sûr).

---

## 2026-06-14 — ✅ v0.10.0 + validation revendications

🔔 Pour le superviseur :
1. **`DATABASE_URL` cloud** : toujours en échec (`password authentication failed for user "postgres"`) — mettre à jour le secret Cursor Cloud avec le rôle `oh_agent` (ou mot de passe postgres valide). Bloque `pnpm etl stats` / `seed:themes` depuis l'agent.
2. **Prod `/themes`** : PR #17 mergée après le cron ETL du 13/06 (08:02 UTC < merge 08:28 UTC) — les thèmes `agriculture` et `defense` ne sont pas encore en base prod (2 thèmes visibles). Le prochain cron `etl-refresh` (04:30 UTC) ou un `workflow_dispatch` manuel exécutera `seed:themes`.
3. **Publication 4.2 / 4.3 UI** : inchangé — check-list `docs/legal-guardrails.md` §7 (HITL).
4. **Revendications pilote (4.3b)** : outillage `validate:revendications` prêt ; premières entrées à sourcer (relecture superviseur des sources avant merge).

- **Objectif du jour** : release v0.10.0 (4.1b mergée) + outillage validation revendications thématiques.
- **Contexte** : aucune PR ouverte ; `main` à jour (PR #17) ; `DATABASE_URL` cloud KO → tâche data sans écriture DB.
- **Fait** :
  - **`validateRevendicationsThematiques`** (core) : slugs thèmes pilotes, URL HTTP(S), date ISO, unicité député×thème — 4 tests vitest.
  - **`pnpm etl validate:revendications`** : vérifie `themes-revendiques.ts` (sans DB).
  - **`theme-slugs.ts`** : slugs pilotes miroir de `themes.ts`.
  - **Release `v0.10.0`** : CHANGELOG, `package.json`, BACKLOG, ROADMAP.
  - **Docs** : `METHODOLOGY.md`, `data-sources.md`.
  - **CI locale** : `pnpm typecheck` ✓, `pnpm test` ✓ (33/33), `pnpm build` ✓.
- **Appris** : le cron ETL du 13/06 a tourné *avant* le merge de #17 — décalage merge/cron à surveiller après chaque release thématique.
- **Bloqueurs** : credential `DATABASE_URL` cloud (superviseur) ; HITL UI 4.2/4.3.
- **Prochaine étape** : corriger secret DB cloud ; vérifier `/themes` prod après cron ; sourcer 1–2 revendications pilote (4.3b) ; HITL UI 4.2/4.3.
- **Commits** : PR à ouvrir (auto-merge — outillage + release, pas de surface publique nominative).

---

## 2026-06-13 — 🗂️ Extension thématique + fix `resolveRawDir`

🔔 Pour le superviseur :
1. **`DATABASE_URL` cloud** : présent mais **auth échoue** (`password authentication failed for user "postgres"`) — le secret Cursor Cloud semble utiliser un mot de passe obsolète ou le rôle `postgres` au lieu de `oh_agent`. À corriger pour débloquer `seed:themes` en prod et les runs ETL agent.
2. **Publication 4.2 / 4.3 UI** : inchangé — check-list `docs/legal-guardrails.md` §7 (HITL).
3. **Après merge** : lancer `pnpm etl seed:themes` (ou `ingest:all`) avec un `DATABASE_URL` valide pour projeter les 4 thèmes en base.

- **Objectif du jour** : extension classification thématique (4.1b) + outillage audit hors-ligne.
- **Contexte** : aucune PR ouverte ; `DATABASE_URL` format OK mais connexion refusée → tâche data sans écriture DB.
- **Fait** :
  - **Audit** : `pnpm etl audit:dossiers-scrutins` — 56 dossiers porteurs de votes, 1 570 scrutins liés (dump 13 juin).
  - **Thèmes** (`themes.ts`) : +`agriculture` (DLR5L17N54085, 416 scrutins), +`defense` (DLR5L17N54083, 291 scrutins) ; comptes 2025 ajoutés à `budget-finances`.
  - **Fix `resolveRawDir()`** : 5× `..` depuis `download.ts` (pointait sur `packages/` → dumps dans `packages/data/raw`).
  - **`.gitignore`** : `packages/data/` (filet de sécurité).
  - **Docs** : `METHODOLOGY.md`, `data-sources.md`, `BACKLOG` (4.1b done), `ROADMAP`, `CHANGELOG`.
  - **CI locale** : `pnpm typecheck` ✓, `pnpm test` ✓ (29/29), `pnpm build` ✓.
- **Appris** : le correctif DATA_RAW_DIR du 12/06 était incomplet (4 `..` au lieu de 5 depuis un fichier) ; l'extension thématique peut se faire hors-ligne via l'audit.
- **Bloqueurs** : credential `DATABASE_URL` cloud (superviseur).
- **Prochaine étape** : corriger secret DB cloud ; `seed:themes` post-merge ; HITL UI 4.2/4.3 ; revendications pilote sourcées.
- **Commits** : PR à ouvrir (auto-merge — outillage + classification versionnée, pas de surface publique nominative).
---

## 2026-06-12 (fin de session) — 🧹 Chemin data/raw ETL corrigé

🔔 Pour le superviseur : rien de bloquant — migration `oh_agent`, Bugbot, HITL UI 4.2/4.3 inchangés (cf. entrée après-midi).

- **Objectif** : corriger les ~38k fichiers untracked dans l'UI Cursor (`packages/etl/data/raw/acteurs-historique/`).
- **Cause** : `DATA_RAW_DIR="./data/raw"` résolu depuis le cwd `packages/etl/` au lieu de la racine du monorepo.
- **Fait** :
  - **`resolveRawDir()`** dans `download.ts` — chemin absolu depuis la racine du repo.
  - **`.gitignore`** : `packages/etl/data/` + `**/data/raw/` (filet de sécurité).
  - Dossier parasite supprimé localement (~429 Mo).
  - PR ouverte (auto-merge, travail sûr).
- **Prochaine étape** : run agent demain — reprendre backlog autonome (extension thématique, cross-check ND local, etc.).

---

## 2026-06-12 (après-midi) — 🔁 Boucle data réparée + smoke stabilisé

🔔 Pour le superviseur :
1. **Rôle `oh_agent`** : secret GitHub Actions posé avec la chaîne `postgres` (mot de passe `oh_agent` absent du `.env`) — à migrer quand le credential est disponible ; idem Cursor Cloud Agents.
2. **Publication 4.2 / 4.3 UI** : composants prêts, non branchés — check-list `docs/legal-guardrails.md` §7 (HITL).
3. **Bugbot** : toujours à activer sur le repo.
4. **Revendications pilote** : remplir `themes-revendiques.ts` avec entrées sourcées avant affichage nominatif 4.3.

- **Objectif** : débloquer cron ETL, rafraîchir données figées au 30 mai, fiabiliser smoke post-merge.
- **Contexte** : audits 12 juin — boucle code stable (PR #12/#13), boucle data cassée (0 secret Actions, ETL cron en échec).
- **Fait** :
  - **Secret `DATABASE_URL`** posé dans GitHub Actions (cron ETL débloqué).
  - **ETL Refresh** : `workflow_dispatch` success ; ingestion locale + CI — **7 397 scrutins** (max **2026-06-11**), **1 148 995 votes**, heatmap **71 910** lignes (max jour 2026-06-11).
  - **Smoke** : `post-merge-smoke.yml` — poll parallèle 40×20 s (~13 min) au lieu de sleep 90 s + routes séquentielles.
  - **Hygiène** : branche remote `chore/journal-pr12` supprimée.
- **Appris** : le smoke détectait bien les pannes (échecs 10–12 juin) mais personne ne regardait Actions ; données figées = conséquence directe du secret manquant, pas du cache download.
- **Bloqueurs** : credential `oh_agent` (migration sécurité) ; HITL UI 4.2/4.3.
- **Prochaine étape** : cron nightly automatique ; bascule `oh_agent` quand dispo ; HITL UI 4.2/4.3.
- **Commits** : PR #14 (auto-merge, smoke vert)

---

## 2026-06-12 — ✅ 1.7 : outil cross-check NosDéputés

🔔 Pour le superviseur :
1. **Secret `oh_agent`** : basculer `DATABASE_URL` cloud + GitHub Actions (tâches 0.8) — toujours en attente.
2. **Publication 4.2 / 4.3 UI** : composants prêts mais non branchés — validation check-list `docs/legal-guardrails.md` §7 requise (merge HITL).
3. **Cross-check NosDéputés live** : l'API `nosdeputes.fr` répond de façon instable depuis la VM cloud (`fetch failed` / reset TCP). Relancer `pnpm etl validate:nosdeputes` en local ou ajouter à la CI quand l'accès réseau est fiable.

- **Objectif du jour** : tâche 1.7 — cross-check nominatif vs NosDéputés (outillage + premier run).
- **Contexte** : `DATABASE_URL` présent ✓ (`pnpm etl stats` : 645 députés, 1 123 910 votes) ; aucune PR ouverte ; `main` à jour (PR #12 mergée).
- **Fait** :
  - **`nosdeputes-crosscheck.ts`** (core) : jointure `id_an` → `PA*`, comparaison effectifs groupe, synthèse écarts nominatifs — 4 tests vitest.
  - **`validate:nosdeputes`** (ETL) : charge 577 députés en mandat (`mandats.fin IS NULL`), tente API NosDéputés (reprises + fallback `/deputes/json`), affiche effectifs + échantillon 30.
  - **Docs** : `docs/data-sources.md` (commande documentée).
  - **CI locale** : `pnpm typecheck` ✓, `pnpm test` ✓ (29/29), `pnpm build` ✓.
  - **Run live** : DB OK (577 en mandat) ; API NosDéputés inaccessible depuis cloud → exit 2 (comportement attendu, pas de faux positif).
- **Appris** : le goulot du cross-check externe est réseau/API (pas la logique) ; 577 en mandat = cohérent AMO10.
- **Bloqueurs** : API NosDéputés depuis cloud ; secrets `oh_agent` (superviseur).
- **Prochaine étape** : exécuter `validate:nosdeputes` en local pour boucler 1.7 ; sourcer revendications pilote ; HITL UI 4.2/4.3.
- **Commits** : PR à ouvrir (auto-merge — outillage testé, pas de surface publique)

---

## 2026-06-11 — 📐 4.3 : participation thème revendiqué (composante c, backend)

🔔 Pour le superviseur :
1. **Secret `oh_agent`** : basculer `DATABASE_URL` cloud + GitHub Actions (tâches 0.8) — toujours en attente.
2. **Revendications thématiques** : le mapping `themes-revendiques.ts` est vide (pilote) — ajouter les premières entrées sourcées (URL + date) via PR avant tout affichage nominatif.
3. **Publication 4.2 / 4.3 UI** : composants `AlignementGroupe` et `ParticipationTheme` prêts mais **non branchés** sur la fiche — validation check-list `docs/legal-guardrails.md` §7 requise (merge HITL).

- **Objectif du jour** : tâche 4.3 — couche participation thème vs global (backend, sans surface nominative nouvelle).
- **Contexte** : `DATABASE_URL` présent en cloud ✓ (645 députés, 1 123 910 votes via `pnpm etl stats`) ; aucune PR ouverte ; branche `cursor/proc-dure-daily-standup-65bf`.
- **Fait** :
  - **`computeComparaisonParticipationTheme`** dans `@open-hemicycle/core/participation-theme.ts` — écart thème − global, décomptes séparés (non-vote ≠ opposition).
  - **`themes-revendiques.ts`** : structure auditable pour revendications sourcées (liste vide, entrées par PR).
  - **`getComparaisonParticipationTheme`** / **`getComparaisonsParticipationThemesRevendiques`** dans `apps/web/lib/queries.ts`.
  - **Composant `ParticipationTheme`** : libellés conformes garde-fous (fait statistique, source revendication, lien méthodologie).
  - **METHODOLOGY** §4.c : implémentation pilote documentée.
  - **Vérifié live** : député test `alain-david-1008`, thème `budget-finances` — taux thème 100 % (2/2), global 100 % (452/452), écart 0.
  - **CI locale** : `pnpm typecheck` ✓, `pnpm test` ✓ (25/25), `pnpm build` ✓.
- **Appris** : la composante (c) se branche comme (a) — le goulot est le **mapping des revendications sourcées**, pas le calcul.
- **Bloqueurs** : secrets `oh_agent` (superviseur) ; revendications pilote à sourcer.
- **Prochaine étape** : sourcer 1–2 revendications pilote ; validation HITL pour brancher 4.2/4.3 sur la fiche ; tâche 1.7 (cross-check NosDéputés) ou extension classification thématique.
- **Commits** : PR à ouvrir (auto-merge prévu — travail sûr, backend seulement)

---

## 2026-06-10 (après-midi) — 🔁 Boucle d'autonomie : reprise, cron ETL, smoke prod

🔔 Pour le superviseur :
1. **Secret `DATABASE_URL` cloud** : basculer sur le rôle limité `oh_agent` (Cursor Cloud Agents → Secrets) — toujours en attente.
2. **Secret GitHub Actions** : créer `DATABASE_URL` (rôle `oh_agent`) pour activer le cron ETL nightly (tâche backlog 0.8).
3. **Bugbot** : activer sur le repo — la PR #9 n'a reçu aucune review automatisée malgré `.cursor/BUGBOT.md`.
4. **Décision 4.2 UI** : brancher `AlignementGroupe` sur la fiche député (check-list `docs/legal-guardrails.md` §7) — reportée volontairement hors de cette session.

- **Objectif** : boucler la boucle d'autonomie quotidienne (infra, pas de surface nominative).
- **Contexte** : enquête post-run du 2026-06-10 matin (PR #9 mergée avec succès) ; plan validé par le superviseur.
- **Fait** :
  - **Prompt** `automation/daily-prompt.md` aligné sur AGENTS.md §6 ter (push-avant-PR, auto-merge, HITL).
  - **Skill standup §0 bis** : étape « reprise » (PR ouvertes/CI rouge, branches orphelines, anti-travail-jumeau, smoke prod).
  - **Workflow `etl-refresh.yml`** : cron 04:30 UTC, ingestion additif (exclut `job:activite`), compteurs avant/après via `pnpm etl stats`.
  - **Workflow `post-merge-smoke.yml`** : vérif HTTP 200 sur `/`, `/deputes`, `/scrutins`, `/themes` après merge `main`.
  - **ETL** : commande `stats` pour les compteurs DB.
  - **Docs** : `automation/README.md` Option C opérationnelle ; BACKLOG (0.6, 3.5 → done ; 0.8 hitl) ; ROADMAP (participation cochée).
  - **Hygiène git** : pull main, branches locales mergées supprimées, stash orphelin (typo AGENTS.md) droppé.
- **Appris** : la boucle code fonctionne (run matin = preuve) ; les trous restants sont protocole (reprise), data (cron ETL), et garde-fous (Bugbot, oh_agent).
- **Bloqueurs** : secrets `oh_agent` (cloud + GitHub Actions) = action superviseur.
- **Prochaine étape** : merge PR infra → release 0.8.0 ; configurer secrets ; activer Bugbot ; décision UI 4.2.
- **Commits** : PR #10 (auto-merge, CI verte)

---

## 2026-06-10 — 📐 4.2 : requête alignement groupe + composant préparé (HITL UI)

🔔 Pour le superviseur :
1. **Publication nominative 4.2** : requête SQL + composant `AlignementGroupe` prêts ; **pas branchés** sur `/deputes/[slug]` — merge de cette PR = backend seulement. Pour afficher l'indicateur sur la fiche, valider via check-list `docs/legal-guardrails.md` §7 puis ouvrir une PR dédiée (merge HITL).
2. **Secret `oh_agent`** : toujours en attente — connexion cloud utilise encore `postgres` (645 députés, 1 123 910 votes vérifiés).
3. **Heatmap députés historiques** : `job:activite` reconstruit la table (`DELETE` puis insert) → HITL si souhaité en prod.

- **Objectif du jour** : tâche 4.2 — couche requête alignement groupe (backend, sans surface nominative nouvelle).
- **Contexte** : `DATABASE_URL` présent en cloud ✓ ; aucune PR ouverte sur `main`.
- **Fait** :
  - **`getTauxAlignementGroupe`** dans `apps/web/lib/queries.ts` — ventilation groupe par scrutin (affiliation courante), filtre `themeSlug` optionnel, délègue à `computeTauxAlignementGroupe` (core).
  - **Composant `AlignementGroupe`** : libellés conformes garde-fous (fait statistique, pas jugement ; lien méthodologie ; limite affiliation courante).
  - **Vérifié live** : député test `alain-david-1008` — taux global ~91,6 % (451 exprimés / 413 alignés) ; thème budget 100 % (2/2).
  - **CI locale** : `pnpm typecheck` ✓, `pnpm test` ✓ (21/21), `pnpm build` ✓.
- **Appris** : la logique pure 4.2a mergée en juin se branche en ~80 lignes de requête ; le goulot reste la **décision éditoriale** pour l'affichage nominatif, pas le calcul.
- **Bloqueurs** : aucun technique ; publication UI = HITL.
- **Prochaine étape** : validation superviseur pour brancher `AlignementGroupe` sur la fiche (par thème pilote ?) ; bascule secret `oh_agent` ; extension classification thématique (4.3).
- **Commits** : PR #9 (auto-merge, CI verte)

---

## 2026-06-09 (soir) — 🔒 Politique d'écriture en prod + hygiène de la boucle

🔔 Pour le superviseur : suite au 1er run autonome (qui a **écrit en prod** seul : 577→645 députés, +55 010 votes, vérifié et bénin). Action **à finaliser de ton côté** : basculer le secret `DATABASE_URL` du cloud sur le **rôle limité `oh_agent`** (étapes en bas). Le code ne change pas, juste les droits de la connexion cloud.

- **Fait** :
  - **Garde-fou DB** : création du rôle Postgres **`oh_agent`** (login, `nosuperuser`, `nocreatedb`, `nocreaterole`, **`bypassrls`**) avec **INSERT/SELECT/UPDATE uniquement** sur les 12 tables `public` (+ default privileges). **Aucun DELETE/TRUNCATE/DDL** → un job buggé ne peut pas détruire la prod. Vérifié au catalogue.
  - **Politique** inscrite dans `AGENTS.md` §2/§3 et la skill §6 : ETL **additif/idempotent = autonome** (compteurs journalisés) ; **DELETE/TRUNCATE/DDL/migration/reconstruction = HITL**. Le code ETL **peut auto-merger** (la donnée est écrite au *run*, pas au *merge* ; le vrai garde-fou est le rôle limité, pas une revue de merge).
  - **Hygiène boucle** : ordre **push-avant-PR** (corrige le « Failed to open Pull Request » du 1er run) + **une branche par run** documentés.
  - **Nettoyage** : suppression des branches mortes (`feat/amo30-import`, `chore/gitignore-etl-data-dir`, `cursor/proc-dure-daily-standup-b61e`) ; PR #6 (instructions Cloud env, section lue par l'agent cloud) remise à jour et passée en auto-merge.
- **Appris** : donner `DATABASE_URL` au cloud = donner des droits d'écriture prod, utilisés en autonomie dès le 1er run. La bonne place du garde-fou est **permissions + exécution** (rôle limité, additif/idempotent), pas le merge.
- **Bloqueurs** : bascule du secret sur `oh_agent` (HITL, credential).
- **Prochaine étape** : finaliser le secret `oh_agent` ; mettre à jour l'instruction de l'automation (push-avant-PR + politique ETL). Puis voie produit : UI 4.2 (HITL).

---

## 2026-06-09 — 📥 ETL AMO30 : 55k votes récupérés (1.4b)

🔔 Pour le superviseur : rien — travail ETL/outillage, merge auto prévu. Prochaine étape sensible : **UI alignement groupe (4.2)** → HITL avant publication nominative. Optionnel : relancer `job:activite` pour inclure les 68 députés historiques dans la heatmap.

- **Objectif du jour** : tâche 1.4b — import acteurs historiques AMO30 + récupération des votes ignorés.
- **Contexte** : `DATABASE_URL` présent en cloud ✓ (connexion vérifiée : 1 068 900 votes / 577 députés au départ). Premier run autonome avec pouvoir de PR.
- **Fait** :
  - **`ingest:acteurs-historique`** : module `acteurs-historique.ts` — complète les députés lég. 17 absents d'AMO10 (mandats terminés), additif (n'écrase pas AMO10).
  - **`backfill:votes`** : ré-insère les votes manquants (idempotent, `onConflictDoNothing`).
  - **Exécution live** : 68 députés ajoutés (645 total) · **55 010 votes** récupérés (1 123 910 total, **0 ignoré**).
  - **Vérifié** : `pnpm -r typecheck` ✓, `pnpm test` ✓ (21/21), `pnpm build` ✓.
- **Appris** : AMO30 contient 645 députés lég. 17 (vs 577 actifs AMO10) — l'écart de 68 personnes correspond exactement aux 55 010 votes ignorés lors de l'import initial.
- **Bloqueurs** : aucun.
- **Prochaine étape** : branchement requête SQL + affichage alignement groupe sur fiche (4.2, **HITL**) ; extension classification thématique ; relancer `job:activite` si heatmap des députés historiques souhaitée.
- **Commits** : `a926f1e` (feat etl AMO30 + backfill)

---

## 2026-06-09 (suite) — 🔁 Boucle de livraison fermée + nettoyage

🔔 Pour le superviseur : la chaîne d'automation est réparée de bout en bout. Reste **2 réglages dashboard** de ton côté pour l'autonomie complète : (1) l'outil « Open Pull Request » sur l'Automation (fait par toi) + permission GitHub App ; (2) secret `DATABASE_URL` dans Cloud Agents → Secrets (pour débloquer l'ETL/data en cloud).

- **Fait** :
  - **GitHub** : auto-merge activé + suppression auto des branches mergées ; `main` protégée (CI `Typecheck · Test · Build` verte requise, pas de review bloquante pour ne pas figer l'auto-merge, bypass admin conservé).
  - **Consolidation mergée** : PR #4 (2.2 participation + 4.2a alignement) → `main` (`b7ebb0e`). CI verte. PR #3 fermée (remplacée).
  - **Nettoyage** : suppression des 11 branches `cursor/proc-dure-...` consommées + `feat/participation-taux` + `feat/alignement-groupe-core`. Restent `main` + branches de travail vivantes. Les doublons jamais mergés (`coherence.ts`, `coherence-groupe.ts`) disparaissent avec leurs branches.
  - **Boucle scellée dans le harness** (cette PR) : `AGENTS.md` §6 ter + skill `daily-standup` §6 décrivent le nouveau protocole — ouvrir la PR soi-même, **auto-merge sur le travail sûr** (`gh pr merge --auto --squash`), **HITL + reviewer demandé + commentaire** sur le sensible, jamais d'auto-approbation. Ajout d'un garde-fou anti-doublon (vérifier qu'un module n'existe pas déjà avant de le réécrire).
- **Appris** : la panne n'était pas la génération de code mais la **livraison** (token sans droit PR + aucun merge des PR vertes). Une automation sans fermeture de boucle empile du travail jumeau au lieu de cumuler du progrès.
- **Bloqueurs** : permission GitHub App « Pull requests = write » + secret `DATABASE_URL` (réglages dashboard, côté superviseur).
- **Prochaine étape** : 1er run autonome avec pouvoir de PR (demain 08:00) à observer ; reprendre la voie produit (4.2 UI sous HITL, AMO30 1.4b, extension thématique).

---

## 2026-06-09 — 🧹 Consolidation des travaux d'automation de juin (PR unique de review)

🔔 Pour le superviseur : enquête sur l'automation cloud → **deux ruptures de boucle** identifiées : (1) le token de l'automation n'a **pas le droit `createPullRequest`** (l'agent pushe une branche chaque matin puis s'arrête, en notant « ouvrir PR manuellement ») ; (2) **rien ne merge les PR vertes** (PR #3 mergeable depuis 7 j, jamais mergée ; pas de branch protection ni de review Bugbot active). Effet de bord : faute de merge, l'agent repartait chaque jour d'un `main` figé au 02/06, ne voyait pas son travail de la veille, et **réécrivait le même indicateur 4.2a sous 3 noms** (`coherence.ts` → `coherence-groupe.ts` → `alignement-groupe.ts`). Cette branche **consolide l'utile** dans une PR unique à reviewer. La plomberie (token/auto-merge) reste à décider (HITL).

- **Objectif** : recouper tout le travail réellement utile dispersé sur ~12 branches et le rassembler dans une seule PR analysable.
- **Fait** :
  - **Audit** des branches (merge-base + diff de contenu, md5) : tri travail réel vs bruit journal/docs vs branches périmées (basées sur le 29-30/05).
  - **Travail canonique retenu** (basé sur `main` actuel, non redondant) :
    - **2.2** — Taux de participation (3 périmètres, METHODOLOGY §3) : `@open-hemicycle/core/taux-participation.ts` + UI fiche député·e (`ParticipationRates`) + requêtes. (= PR #3, identique sur 3 branches.)
    - **4.2a** — Alignement vote / ligne de groupe (logique pure, METHODOLOGY §4.a) : `@open-hemicycle/core/alignement-groupe.ts`. (Identique sur 4 branches ; itération finale retenue.)
  - **Écarté** : `coherence.ts` (03/06) et `coherence-groupe.ts` (06/06) — itérations antérieures du **même** indicateur 4.2a, superflues une fois `alignement-groupe.ts` retenu.
  - **Intégration propre** : `PositionVote` ramené à **une seule source de vérité** (`participation.ts`) ; suppression des redéfinitions/réexports dans `taux-participation.ts` et `alignement-groupe.ts` (conflit de barrel `index.ts` corrigé).
  - **Vérifié (séquence CI locale)** : `pnpm -r typecheck` ✓ (4/4), `pnpm -r test` ✓ (**21/21**), `build` web ✓.
- **Appris** : sans fermeture de boucle (merge), une automation quotidienne ne produit pas de progrès cumulé — elle produit du **travail jumeau** qui s'empile. Le blocage n'était pas la génération de code mais la **livraison**.
- **Bloqueurs** : droits du token automation (createPullRequest) ; absence d'auto-merge/branch-protection ; `DATABASE_URL` non fourni en cloud (tâches ETL/DB).
- **Prochaine étape** : review de cette PR → merge ; puis décider la correction durable de la chaîne (token, auto-merge, branch protection). Brancher l'UI de 4.2a reste **HITL** (indicateur nominatif, cf. 4.5).

---

## 2026-06-08 — 🔀 4.2 : PR alignement-groupe ouverte + CI vérifiée

🔔 Pour le superviseur : (1) **`DATABASE_URL` toujours absent** en automation cloud — fournir le secret dans l'automation Cursor pour débloquer ETL/DB (1.4b AMO30, branchement alignement en requête SQL, affichage fiche). (2) **PR alignement-groupe à ouvrir manuellement** (`feat/alignement-groupe-core` → `main`, CI locale verte) — logique pure uniquement, **aucune surface nominative** (merge sans HITL). (3) **PR #3** (`feat/participation-taux`, tâche 2.2) : CI verte depuis le 2026-06-02 — **merge recommandé** pour afficher les 3 taux sur la fiche député·e.

- **Objectif du jour** : reprendre 4.2 (session 2026-06-07) — finaliser livraison : CI locale + ouverture PR bloquée hier (permissions `gh`).
- **Fait** :
  - Reprise branche `feat/alignement-groupe-core` (commits `3e7bb5a`/`1ba013f`/`9535895`).
  - **Vérifié CI locale** : `pnpm install` + `pnpm -r typecheck` ✓ (4/4), `pnpm -r test` ✓ (16/16, dont 4 tests `alignement-groupe`), `pnpm --filter web build` ✓.
  - **PR à ouvrir manuellement** vers `main` (`gh pr create` refusé — permissions integration, même blocage qu'hier).
  - Journal mis à jour (cette entrée).
- **Appris** : l'incrément 4.2 « logique pure » était déjà complet hier ; la valeur du standup d'aujourd'hui = débloquer le cycle PR (CI + ouverture). PR #3 attend merge depuis 6 jours avec CI verte.
- **Bloqueurs** : `DATABASE_URL` absent → pas de requête SQL ni UI alignement sur fiche ; étape suivante 4.2 (ETL/UI) reste cloud-blocked.
- **Prochaine étape** : **ouvrir PR manuellement** (feat/alignement-groupe-core → main) → merge → branchement requête + affichage par thème sur fiche (HITL 4.5 avant publication nominative) ; merger PR #3 (2.2 participation) ; configurer `DATABASE_URL` en secret automation.
- **Commits** : entrée journal uniquement (code inchangé depuis 2026-06-07).

---

## 2026-06-07 — 📐 4.2 : logique pure alignement sur la ligne de groupe

🔔 Pour le superviseur : (1) **`DATABASE_URL` absent** en automation cloud — les tâches ETL/DB (1.4b AMO30, branchement alignement en base, job participation) restent bloquées tant que le secret n'est pas fourni dans l'automation. (2) PR **`feat/alignement-groupe-core`** ouverte — logique pure uniquement, **aucune surface nominative publiée** (pas de HITL requis pour ce merge). (3) PR #3 (`feat/participation-taux`, tâche 2.2) toujours en attente de merge — à traiter en priorité si on veut les 3 taux sur la fiche député·e.

- **Objectif du jour** : tâche 4.2 (cohérence vote / ligne de groupe, composante a) — incrément cloud-safe : fonctions pures testées, sans base.
- **Fait** :
  - **`@open-hemicycle/core`** : module `alignement-groupe.ts` conforme à METHODOLOGY §4.a — `positionMajoritaireGroupe` (modalité exprimée la plus fréquente ; égalité → `null`), `voteAligneSurGroupe`, `computeTauxAlignementGroupe` (taux + compteurs + scrutins exclus sans majorité claire).
  - Type partagé `PositionVote` ajouté à `participation.ts`.
  - **4 tests vitest** + fixture JSON `alignement-groupe.sample.json` (cas aligné, désaligné, égalité groupe, non-votant député·e).
  - **Vérifié** : `pnpm -r typecheck` ✓ (4/4), `pnpm -r test` ✓ (16/16), `build` web ✓.
  - Docs : `CHANGELOG`, `BACKLOG` (4.2 → in-progress), `ROADMAP` (v0.7.0 + thèmes done).
- **Appris** : une branche `feat/alignement-groupe-core` existait déjà (commit `6daee32`) mais sans PR — reprise et adaptation (import `PositionVote` depuis `participation.ts` plutôt que `taux-participation.ts` non mergé).
- **Bloqueurs** : `DATABASE_URL` absent → pas de branchement ETL ni affichage fiche pour l'instant.
- **Prochaine étape** : merge PR alignement-groupe → requête SQL + affichage sur fiche député·e par thème (HITL avant publication nominative, cf. 4.5) ; en parallèle traiter PR #3 (2.2 participation).
- **Commits** : `3e7bb5a` (feat core), `1ba013f` (docs) — branche `feat/alignement-groupe-core` poussée ; ouverture PR via `gh` refusée (permissions integration) → à ouvrir manuellement vers `main`.

---

## 2026-05-30 (fin d'après-midi, +2) — 🗂️ v0.7.0 : regroupement des scrutins par thème (pilote)

🔔 Pour le superviseur : feature **thèmes** livrée en PR (`feat/themes-pilote`) — première brique vers l'indice de cohérence par thème. Classification **manuelle, conservatrice et auditable** (mapping versionné dans le code, modifiable seulement par PR). Pilote volontairement restreint à **2 thèmes** et **3 dossiers** (titres officiels sans ambiguïté). Rien de nominatif, aucun jugement. La PR attend la CI verte + review Bugbot avant merge.

- **Objectif du jour** : tâche 4.1 (rattachement scrutins ↔ thèmes), avec 2 thèmes pilotes validés par le superviseur : « Budget & finances publiques » et « Sécurité & immigration ».
- **Fait** :
  - **Exploration** des 40 dossiers porteurs de votes → sélection conservatrice par titre officiel : `budget-finances` = `DLR5L17N52985` (fraudes sociales et fiscales) + `DLR5L17N53720` (responsabilité financière des opérateurs de l'État) ; `securite-immigration` = `DLR5L17N53284` (sécurité, rétention administrative, prévention des attentats).
  - **Schéma** : tables `themes` + `dossiers_themes` (RLS + lecture publique) ; rattachement au niveau du dossier (un scrutin hérite du thème de son dossier).
  - **ETL** : commande `seed:themes` qui (re)pose la classification depuis `packages/etl/src/data/themes.ts` (source de vérité versionnée et commentée) ; ajoutée à `ingest:all`.
  - **Web** : page `/themes` (liste + nb scrutins), filtre `?theme=` sur l'explorateur, pastilles cliquables sur le détail d'un scrutin, entrée « Thèmes » dans le footer.
  - **Méthodologie** : nouvelle section (UI + `docs/METHODOLOGY.md`) sur la classification thématique (règle conservatrice, périmètre pilote, mapping auditable).
  - **Vérifié en local** (navigateur dev) : `/themes` (Budget 168, Sécurité 101), filtre `?theme=securite-immigration` (101 scrutins), pastille « Sécurité & immigration » + lien dossier sur le scrutin solennel n°6318.
  - **Vérifié CI en local** : `pnpm -r typecheck` ✓ (4/4), `pnpm -r test` ✓ (12/12), `build` web ✓ (route `/themes` listée).
- **Appris** : aucun PLF/PLFSS dans les 40 dossiers porteurs de votes du dump courant → le thème budget repose surtout sur la loi anti-fraude ; le pilote prouve le pipeline (thème → dossier → scrutins → votes), l'exhaustivité viendra avec plus de dossiers liés.
- **Prochaine étape** : CI verte + review Bugbot → merge → tag `v0.7.0`. Puis 4.2 (cohérence vote / ligne de groupe) en s'appuyant sur ces thèmes.

---

## 2026-05-30 (après-midi, +2) — 🛡️ CI + cycle de PR review (le harness se discipline)

🔔 Pour le superviseur : (1) **v0.6.0 vérifiée en prod** — déploiement Vercel `READY` sur le SHA `2d40273`, contenu (badge résultat + dossier) servi, DB prod OK. (2) Mise en place d'un **cycle CI + PR review** : cette PR (`chore/ci-pr-workflow`) l'amorce elle-même. **À activer côté dashboard (action superviseur)** : Cursor **Bugbot** sur le repo + (optionnel) **branch protection** sur `main` (exiger CI verte + 1 review avant merge).

- **Objectif** : combler un trou identifié par le superviseur — je poussais en direct sur `main` (= prod) sans CI ni review. Risque de régression en prod.
- **Fait** :
  - **Vérif prod rigoureuse** : `list_deployments` Vercel → dernier déploiement prod `READY`, commit `2d40273` (= v0.6.0) ; routes 200 ; contenu v0.6.0 (Adopté/Rejeté + dossier) rendu live.
  - **CI GitHub Actions** (`.github/workflows/ci.yml`) : `typecheck` (4 packages) + `test` (vitest core) + `build` web, sur chaque PR et push `main` (concurrency cancel-in-progress). Build sans `DATABASE_URL` (pages `force-dynamic`).
  - **Process documenté** : `AGENTS.md` §6 ter (branche → PR → CI verte → review auto → merge ; HITL pour release majeure/indicateur sensible) + DoD §4 + skill `daily-standup`. Scripts root réels (`typecheck`/`test`/`build` récursifs).
  - **Review auto** : `.cursor/BUGBOT.md` (priorité garde-fous éditoriaux, justesse data, sécurité) + gabarit `.github/pull_request_template.md` (check-list DoD + garde-fous).
  - **Fix dette** : typecheck `@open-hemicycle/db` réparé (`@types/node` + tsconfig `noEmit`) → monorepo 100% vert.
  - **Vérifié en local** (séquence CI) : `pnpm -r run typecheck` ✓ (4/4), `pnpm -r run test` ✓ (12/12), `build` web ✓ sans DB.
- **Appris** : « poussé » ≠ « live et vérifié ». La preuve d'un déploiement prod = SHA du déploiement `READY` + contenu servi, pas un simple 200.
- **Bloqueurs** : aucun (activation Bugbot/branch-protection = côté superviseur, non bloquant).
- **Prochaine étape** : merger cette PR une fois CI verte ; puis reprendre la voie produit `0.7.0` (rattachement scrutins ↔ thèmes, 4.1) **via PR**.

---

## 2026-05-30 (après-midi, +2) — 🔗 v0.6.0 : lien scrutin ↔ dossier législatif (+ résultat officiel)

🔔 Pour le superviseur : v0.6.0 poussée → déploiement Vercel auto. Le lien scrutin↔dossier débloque la voie vers les thèmes (4.1) puis l'indice de cohérence. Décision à venir : **choix du thème pilote** (4.1).

- **Objectif** : tâche 1.6 — rattacher chaque scrutin à son dossier législatif (prérequis des thèmes), et au passage capter le résultat officiel `sort`.
- **Fait** :
  - **Sonde data** : sur 7 205 scrutins, le lien vit dans `objet.dossierLegislatif.dossierRef` (1 247→1 375 scrutins avec réf., 100 % résolus, 40 dossiers distincts) ; `referenceLegislative` toujours null ; `sort = {code,libelle}` présent partout (adopté 2 515 / rejeté 4 690).
  - **Schéma (additif, ALTER idempotents sur la live)** : `scrutins.sort`, `dossiers_legislatifs.procedure`, `dossiers_legislatifs.url_an`. Mis à jour aussi dans `schema.ts` (source de vérité).
  - **ETL** : nouveau `import/dossiers.ts` (`DLR5L{leg}*` → titre + procédure + URL officielle `dyn/{leg}/dossiers/{chemin}`), commande CLI `ingest:dossiers`, intégrée dans `ingest:all` **avant** scrutins. `import/scrutins.ts` capte `dossierRef`+`sort` et set `dossier_id` (map dossiers chargé au démarrage). Upsert étendu (`sort`, `dossier_id`).
  - **Chargé en base** : 2 609 dossiers L17 ; re-ingestion scrutins → 7 205 avec `sort`, 1 375 liés à un dossier (3 réfs non résolues, négligeable).
  - **Web** : badge résultat **Adopté/Rejeté** (couleur informative, terme verbatim) sur `/scrutins` et le détail ; bloc « Dossier législatif » avec lien vers la page officielle du dossier. Disclaimer synthèse ajusté (le résultat est désormais affiché et sourcé).
  - **Vérifié** : typecheck (etl+web) + build Turbopack verts ; en local, `/scrutins` & `/scrutins?type=solennel` 200 (badges), détail `VTANR5L17V6753` 200 → « Adopté », dossier Nouvelle-Calédonie + lien AN, ventilation par groupe. Captures OK. URLs dossier (forme chemin ET forme uid) → 200.
- **Appris** : seulement 40 dossiers concentrent les 1 375 scrutins nominatifs (≈ gros textes très débattus) — c'est exactement la matière utile pour les thèmes. `titreChemin` vaut parfois l'uid `DLR*` : l'URL AN résout dans les deux cas.
- **Bloqueurs** : aucun.
- **Prochaine étape** : `0.7.0` = **rattachement scrutins ↔ thèmes (4.1)** sur un thème pilote (en attente du choix superviseur), puis composante « cohérence vote/ligne de groupe » (4.2). En parallèle : AMO30 (1.4b) et 3 taux de participation (2.2).

---

## 2026-05-30 (après-midi, +2) — 🏷️ Versioning + mise au net roadmap, et 1er push public

🔔 Pour le superviseur : **push effectué** sur `main` (3 commits produit + ce commit de release) → déploiement Vercel auto déclenché. C'était ta consigne explicite. À surveiller : que `/scrutins`, `/methodologie`, `/mentions-legales`, `/signaler` répondent 200 en prod.

- **Objectif** : refléter l'état réel dans roadmap/tasks, **introduire le versionnage** dans le harness pour tracker versions et avancées, pousser, documenter.
- **Fait** :
  - **Versionnage SemVer + `CHANGELOG.md`** (format *Keep a Changelog*) : historique reconstruit depuis git en 5 versions — `0.1.0` amorçage+infra, `0.2.0` données+annuaire/fiches, `0.3.0` heatmap, `0.4.0` scrutins, `0.5.0` garde-fous publics. `package.json` (root) bumpé `0.0.0 → 0.5.0`.
  - **Harness** : `AGENTS.md` §6 bis (règles de versionnage : `[Non publié]` pendant le travail, couper une version + tag annoté `vX.Y.Z` à chaque incrément cohérent, `1.0.0` = M1) + ajout à la DoD §4 ; skill `daily-standup` mise à jour (lire la version au réveil, reporter dans le CHANGELOG, couper/tagger au commit).
  - **Tags git annotés** `v0.1.0..v0.5.0` posés sur les commits correspondants et poussés.
  - **Mise au net** : `ROADMAP.md` (Phase 2 « scrutin par groupe » + Phase 3 « explorateur » & « méthodo/mentions » passés `[x]`, en-tête version courante) ; `README.md` état du projet (« amorçage » → POC public `0.5.0`) ; `BACKLOG.md` (2.4 → done, note versionnage).
  - **Push** : `main` poussé (les 3 commits produit en attente + ce `chore(release)`), tags poussés.
- **Appris** : le dépôt manquait d'un fil « version » lisible d'un coup d'œil ; le CHANGELOG comble le trou entre le JOURNAL (narratif, daté) et le BACKLOG (tâches). SemVer `0.x` évite de sur-promettre avant le POC complet (`1.0.0` = M1).
- **Bloqueurs** : aucun.
- **Prochaine étape** : `0.6.0` visé = **lien scrutin ↔ dossier législatif (1.6)**, prérequis des thèmes donc de l'indice de cohérence ; puis AMO30 (1.4b) et 3 taux de participation (2.2).

---

## 2026-05-30 (après-midi, +2) — ⚖️ Pages méthodologie + mentions légales + signaler une erreur

- **Objectif** : poser le socle garde-fous côté public (tâche 3.4) maintenant que deux surfaces de données nominatives sont en ligne — méthodologie liée, mentions légales/RGPD, droit de réponse accessible.
- **Fait** :
  - **Footer global** (`SiteFooter`, monté dans `layout.tsx`) → liens Accueil / Député·es / Scrutins / Méthodologie / Mentions légales / Signaler / GitHub + attribution sources & licence, présent sur **toutes** les pages. Footer dédié de la landing supprimé (anti-doublon).
  - **`/methodologie`** : fidèle à `docs/METHODOLOGY.md` (principes, activité détectée + score/quantiles + limites, 3 taux de participation, indice de cohérence à venir + règles de publication, incertitude/corrections, « ce qu'on ne calcule pas »). Lien vers le doc versionné.
  - **`/mentions-legales`** : éditeur/nature (indépendant, AGPL-3.0), sources & licences (Etalab 2.0, ODbL share-alike), RGPD (base légale mission d'intérêt public, minimisation, **aucune donnée privée/santé**, droit de rectification), immunité parlementaire (art. 26), garde-fous éditoriaux (no adjectif, no score unique, no top-pires, non-vote ≠ opposition, symétrie), droit de réponse.
  - **`/signaler`** : deux parcours (corriger une donnée / droit de réponse) via **issues GitHub pré-remplies** (labels `correction` / `droit-de-reponse`, gabarit page+donnée+source) + explication du traitement public et tracé. Pas d'email inventé : canal = issues publiques (traçabilité).
- **Garde-fous** : tout le contenu reste factuel et symétrique ; la page méthodo rend chaque indicateur cliquable/critiquable ; le signalement satisfait l'exigence « droit de réponse accessible » de `legal-guardrails.md` §7.
- **Vérifié** : typecheck + build verts (3 nouvelles routes statiques ○) ; en local, `/methodologie` `/mentions-legales` `/signaler` → 200 ; footer (méthodo/mentions/signaler) présent sur `/scrutins` ; liens issues pré-remplis corrects (`issues/new?labels=…`). Capture méthodo OK.
- **Bloqueurs** : aucun.
- **Prochaine étape** : (a) lien scrutin ↔ dossier législatif (1.6, préalable aux thèmes) ; (b) AMO30 (1.4b, 55k votes manquants) ; (c) calcul des 3 taux de participation (2.2) ; (d) capter `sort` (adopté/rejeté) des scrutins. Décision en attente : **push/déploiement prod** (HITL).

---

## 2026-05-30 (après-midi, +2) — 🗳️ Explorateur de scrutins : liste + votes par groupe

- **Objectif** : ouvrir la 2ᵉ grande surface produit (tâches 2.5 / 3.3) — explorer les scrutins publics et la ventilation des votes par groupe, en respectant les garde-fous (fait + source + date + lien).
- **Contexte** : l'automation quotidienne (0.6) n'a pas tourné ce matin — elle est restée `hitl` (sauvegarde Glass = action superviseur). Décision : on continue en mode accompagné, sans automation.
- **Fait** :
  - **Sonde data** (jetable) : 7 074 scrutins, **tous** avec titre/objet/date/type (oct. 2024 → mai 2026). `titre` == `objet` (on n'affiche qu'un libellé). Types : ordinaire 7 004 / solennel 48 / motion de censure 22. Validé la requête de ventilation par groupe (join `votes → affiliations courantes → groupes`, ~500 ms, couleurs incluses).
  - **Requêtes serveur** (`apps/web/lib/queries.ts`) : `listScrutins({type,limit,offset})`, `countScrutins(type)` (pagination), `getScrutinDetail(uidAn)` → métadonnées + ventilation par groupe (pour/contre/abstention/non-votant + total nominatif).
  - **Helpers** (`apps/web/lib/scrutin-format.ts`) : `typeLabel`, `urlScrutinOfficiel(numero)`, `capitalize`, `dateFr` (TZ Europe/Paris), couleurs positions partagées avec la fiche député.
  - **Pages** : `/scrutins` (liste paginée 30/page, filtres Tous/Solennels/Motions de censure/Ordinaires, libellé verbatim + décompte officiel) ; `/scrutins/[uid]` (synthèse officielle, votes par groupe en barres empilées + compteurs, lien analyse officielle AN). Landing : CTA « Explorer les scrutins » + chantier passé « En ligne ».
- **Garde-fous appliqués** :
  - Libellés AN **verbatim** (jamais reformulés), **lien source** vers l'analyse officielle par numéro (`/dyn/17/scrutins/{numero}`), date affichée.
  - **Pas d'assertion d'adoption/rejet** (on n'a pas capté le champ `sort` ni les règles de majorité → renvoi à la source).
  - **Disclaimer non-votant** : pour les scrutins ordinaires, l'AN ne liste nominativement que les exprimés + quelques non-votants → l'absence d'un nom n'est PAS un relevé d'absence physique.
  - **Limite affichée** : ventilation rattachée au groupe *actuel* (pas celui de la date du scrutin) — honnête sur l'approximation.
- **Vérifié** : typecheck + build Turbopack verts ; en local (`next start`), `/scrutins` 200, `/scrutins?type=solennel` 200, détail `VTANR5L17V7040` 200 (titre, synthèse, RN/LFI-NFP, lien officiel `…/scrutins/7040`), 404 sur uid inexistant.
- **Appris** : `next lint` est cassé sous Next 16 via pnpm (interprète « lint » comme un dossier) → la vérif ESLint passe par `next build`. À retenir pour la DoD.
- **Bloqueurs** : aucun.
- **Prochaine étape** : (a) page méthodologie + mentions légales + « signaler une erreur » (3.4) ; (b) lien scrutin ↔ dossier législatif (1.6, préalable aux thèmes) ; (c) AMO30 (1.4b, 55k votes manquants) ; (d) capter le champ `sort` (adopté/rejeté) à la prochaine ré-ingestion des scrutins.

---

## 2026-05-29 (nuit, +2) — 📊 Heatmap d'activité (votes-only) de bout en bout

- **Objectif** : rendre visible l'activité parlementaire façon « GitHub contributions », vertical slice complet (calcul pur → job → UI), v1 votes-only assumée.
- **Fait** :
  - **Nouveau package `@open-hemicycle/core`** (fonctions PURES, sans dépendance base/réseau, **testé vitest**) : `scoreJour` (poids METHODOLOGY §2), `computeSeuilsNiveaux` (quantiles q25/q50/q75 **sur la population** → couleurs comparables entre fiches), `niveauPourScore` (0–4), helpers participation (`votesExprimes`/`tauxExpression`, non-vote ≠ opposition). **12 tests verts.**
  - **Job ETL `job:activite`** (`packages/etl/src/jobs/activite.ts`) : agrège en SQL les votes exprimés par (député × jour, fuseau Europe/Paris), calcule les seuils population, reconstruit `activite_journaliere`. Branché au CLI (+ inclus dans `ingest:all`).
  - **Exécuté sur la DB live** : **66 080 lignes** (576 députés, 2024-10-08 → 2026-05-29). Seuils **2 / 9 / 22** votes. Distribution niveaux équilibrée (n1≈19,2k / n2≈15,0k / n3≈15,4k / n4≈16,4k).
  - **UI** : composant `ActivityHeatmap` **rendu serveur, sans dépendance externe** (grille semaines × jours, étiquettes mois, légende Moins→Plus, tooltips date+nb votes), branché sur la fiche au-dessus des positions de vote. Légende méthodo + disclaimer « pas une présence ».
  - **Vérifié** : build Turbopack + typecheck + lint verts ; en local, fiche `aurelie-trouve-95164` → section heatmap + 130 cases colorées (niveau>0).
- **Appris** :
  - Échelle de couleur **population-wide** (et non par individu) = condition pour comparer deux fiches honnêtement ; c'est ce que dit METHODOLOGY §2 (quantiles sur la population).
  - Heatmap maison = zéro risque SSR/bundle vs lib client, et colle aux design tokens. Suffisant pour un POC.
- **Bloqueurs** : aucun.
- **Prochaine étape** : (a) explorateur de scrutin/texte (votes par groupe) ; (b) enrichir le score (amendements/questions/interventions) quand les datasets seront ingérés ; (c) AMO30 (55k votes manquants) ; (d) lien scrutin↔dossier (préalable aux thèmes / indice de cohérence).

---

## 2026-05-29 (nuit) — 🚀 Le site devient vivant : annuaire + fiches sur vraies données

- **Objectif** : « ship fast » — brancher le web sur la base pour transformer la landing morte en vrai produit, en assumant que la data est encore partielle.
- **Fait** :
  - **Web ↔ DB câblé** : `@open-hemicycle/db` ajouté en dépendance de `apps/web` + `transpilePackages` (le package db est en TS source, imports `.ts`) + `serverExternalPackages: ["postgres"]`. `allowImportingTsExtensions` ajouté au tsconfig web.
  - **Couche requêtes serveur** (`apps/web/lib/queries.ts`, lecture seule) : `listGroupes` (effectifs courants), `listDeputes(groupeId?)`, `getDeputeBySlug`, `getVoteStats` (répartition pour/contre/abstention/non-votant + taux d'expression), `getGlobalCounts`.
  - **Pages** : `/deputes` (annuaire 577, filtre par groupe avec couleurs officielles + effectifs) ; `/deputes/[slug]` (fiche : entête groupe, barre de répartition des votes, 4 compteurs, taux d'exprimés, lien fiche AN officielle) ; landing mise à jour (CTA « Explorer les député·es », 3 compteurs live, chantier annuaire passé « En ligne »).
  - **Honnêteté assumée** : composant `DataNotice` (bandeau « données partielles — POC ») sur landing + annuaire + fiche, et `ActivityDisclaimer` (un non-votant ≠ une absence ; pas de relevé de présence physique).
  - **Vérifié en local** : `next build` (Turbopack) vert, typecheck vert, lint vert ; `next start` → `/` 200 (compteurs réels), `/deputes` 200 (581 cartes), `/deputes/abdelkader-lahmar-41729` 200 (groupe LFI + répartition de votes correcte).
- **Appris** :
  - Toutes les pages data sont en `force-dynamic` (rendu serveur à la demande) → pas de dépendance DB au build, données toujours fraîches.
  - `next` du `node_modules/.bin` est un wrapper shell : le lancer directement (shebang), pas via `node --env-file` ; sourcer `.env` avec `set -a; . .env; set +a`.
- **Incident prod résolu** : après push, `/deputes` renvoyait 500 en prod (logs Vercel : `DATABASE_URL manquant`). La var n'était en réalité présente **que** pour preview/development, pas pour production (l'ajout CLI prod de la session précédente n'avait pas pris). Corrigé via l'API REST Vercel (`POST /v10/projects/:id/env?upsert=true`, `target:["production","preview","development"]`) puis **redeploy** (`POST /v13/deployments`, `meta.action=redeploy`) — une modif d'env ne s'applique qu'aux nouveaux déploiements. **Vérifié live** : `/`, `/deputes` (581 cartes), fiche → 200, compteurs réels affichés.
  - ⚠️ **Note d'exploitation** : toujours vérifier qu'une var Vercel est bien cochée pour **les 3 cibles** ; le `vercel env add` non-interactif peut ne poser que certaines cibles. Vérif rapide = logs runtime (`get_runtime_logs`).
- **Bloqueurs** : aucun.
- **Prochaine étape** : (a) job `activite_journaliere` + heatmap GitHub-style sur la fiche (besoin des fonctions pures 2.0) ; (b) explorateur de scrutin/texte (votes par groupe) ; (c) AMO30 pour compléter les 55k votes manquants ; (d) lien scrutin↔dossier.

---

## 2026-05-29 (soir) — 🎉 1re ingestion réelle de bout en bout (POC données validé)

- **Objectif** : prouver toute la chaîne ETL → vraies données en base.
- **Fait** :
  - **ETL construit** : `packages/etl/src/lib/` (download+dézip adm-zip, helpers JSON AN, slug), `import/deputes.ts`, `import/scrutins.ts`, CLI étendu (`download`, `ingest:deputes`, `ingest:scrutins`, `ingest:all`). Typecheck vert.
  - **Compris la structure AN réelle** (JSON issus de XML : `arrayify` + `anText` pour gérer objet/array/`#text`). Acteur → `etatCivil`, `mandats.mandat[]` (GP / ASSEMBLEE) ; organe GP → `libelle`/`libelleAbrev`/`couleurAssociee` ; scrutin → `ventilationVotes.organe[].groupes.groupe[].vote.decompteNominatif.{pours,contres,abstentions,nonVotants}.votant[]`.
  - **Chargé en base (live Supabase)** : **577 députés**, **12 groupes** (couleurs officielles), **588 affiliations**, 577 mandats, **7 074 scrutins**, **1 056 062 votes individuels**.
  - **Vérifié** : effectifs par groupe cohérents avec le réel (RN 123, EPR 92, LFI-NFP 72, SOC 69, DR 49…) ; sanity-check Braun-Pivet = 6 986 non-votants/7 074 (le perchoir ne vote pas) → positions bien capturées.
- **Appris** :
  - tsx pas au root en monorepo pnpm → lancer depuis `packages/etl` avec `node --env-file=../../.env --import tsx` + `DATA_RAW_DIR` absolu pour réutiliser `data/raw`.
  - `allowImportingTsExtensions`+`noEmit` requis dans le tsconfig ETL (imports `.ts`) ; `drizzle-orm` doit être dép. directe de l'ETL (pnpm strict).
  - Insertion 1,05 M lignes : batch 5000 + `onConflictDoNothing` → ~200 s sur Supabase eu-west-3. OK pour un chargement initial ; l'incrémental viendra.
- **Limite connue** : **55 010 votes ignorés** (acteurRef hors AMO10 = députés non actifs / suppléants partis). → nécessite **AMO30** (acteurs historiques) pour 100 % de complétude. Tâche ajoutée au backlog (1.4b).
- **Bloqueurs** : aucun.
- **Réveil quotidien** : formulaire Glass Automations pré-rempli (cron `0 8 * * *`, TZ Europe/Paris, repo `kecyf/open-hemicycle`, prompt = boucle `daily-standup`). ⚠️ L'API backend des automations n'est pas appelable depuis l'agent → création via l'UI Glass ; **sauvegarde finale = action superviseur** (compute cloud récurrent). Tant que non sauvegardé, réveil possible en local via la skill `loop`.
- **Prochaine étape** : (a) brancher le web sur la DB (server components Drizzle) pour afficher de vrais chiffres sur la landing ; (b) job `activite_journaliere` (heatmap) ; (c) lien scrutin↔dossier (1.6) ; (d) AMO30 (1.4b).

---

## 2026-05-29 (fin d'après-midi) — DATABASE_URL branché → ETL débloqué

- **Objectif** : récupérer les credentials DB et les câbler partout.
- **Fait** :
  - `DATABASE_URL` (Transaction pooler IPv4, `prepare:false`) renseigné dans `.env` local par le superviseur.
  - **Connexion live vérifiée** : `SELECT now()` OK + 10 tables publiques bien présentes.
  - **Vercel** : `DATABASE_URL` posé en **Production** (CLI) puis **Preview + Development** (API REST Vercel, `upsert=true`). Les 3 environnements OK.
  - `.env.example` / `.env` clarifiés : pour Drizzle, **`DATABASE_URL` suffit** (connexion Postgres directe = tous droits + bypass RLS). Le `service_role`/`sb_secret_…` n'est utile **que** pour le SDK supabase-js (PostgREST), inutile à l'ETL → marqué optionnel.
- **Appris** :
  - `vercel env add` (CLI v54) en non-TTY : exige `--value … --yes`, et pour **preview** réclame un git-branch (`git_branch_required`) qu'il ne sait pas contourner proprement → passer par l'**API REST** (`POST /v10/projects/:id/env`, `target:["preview"|"development"]`).
- **Bloqueurs** : levés. L'ingestion réelle peut commencer.
- **Prochaine étape** : 1er script ETL (download `data/raw/` + dézip + validation Zod), puis import députés AMO10 + groupes/affiliations, puis scrutins + votes (17e).

---

## 2026-05-29 (après-midi) — Infrastructure live : Supabase + Vercel

🔔 Pour le superviseur :
- **Coût engagé** : le projet Supabase tourne sur l'org payante `kvncyf` → **~10 $/mois** (validé via ta consigne « gère Supabase en autonomie »).
- **À COMPLÉTER par toi (non récupérable via MCP)** : dans le dashboard Supabase → Project Settings → Database, récupère la **connection string** (pooler) et la clé **service_role**, puis renseigne `DATABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` dans le `.env` local **et** dans les env vars Vercel. C'est requis pour l'ETL (écritures) — bloquant pour l'ingestion réelle.

- **Objectif** : brancher l'infra (Option A) — Supabase + déploiement Vercel auto-lié à GitHub.
- **Fait** :
  - **Supabase** : projet `open-hemicycle` créé (ref `lswnzmhzxyjfqhwgxhoa`, région eu-west-3/Paris, Postgres 17). Schéma initial appliqué : 10 tables, **RLS activée** + policies de lecture publique. Advisor sécurité : **0 problème**.
  - **Drizzle** : `packages/db` (schéma + client) en place, miroir du schéma live.
  - **Web** : landing Next.js déployable, build vert. Montée forcée à **Next 16** (Vercel bloque les Next 15 vulnérables).
  - **Vercel** : projet `connivence/open-hemicycle` créé, **repo GitHub connecté** (auto-déploiement actif), env vars publiques (URL + publishable) en Production, **Root Directory = apps/web** corrigé via API.
  - **En ligne** : https://open-hemicycle.vercel.app (HTTP 200).
- **Appris** :
  - Le MCP `deploy_to_vercel` ne déploie pas lui-même → passage par le CLI Vercel (déjà authentifié comme `kvncyf`).
  - Monorepo : le 1er build git a échoué (« No Next.js version detected ») car la Root Directory n'était pas réglée ; corrigée à `apps/web` via l'API Vercel.
- **Bloqueurs** : ETL bloqué tant que `DATABASE_URL` / `service_role` ne sont pas fournis (voir 🔔).
- **Prochaine étape** : récupérer les credentials DB → écrire le 1er script d'ingestion réel (députés AMO10 + scrutins) → premières lignes en base → API + fiche député.
- **Commits** : `40001be` (schéma + web), `1b61a2c` (Next 16).

---

## 2026-05-29 — Amorçage du projet

🔔 Pour le superviseur :
- **Décisions prises avec toi** : nom = `open-hemicycle` ; GitHub public sous `kecyf` ; framing = « indice de cohérence » factuel.
- **À valider quand tu pourras** : (1) créer le projet Supabase et me donner accès (ou m'autoriser à le créer via MCP Supabase) ; (2) confirmer qu'on peut viser un déploiement public Vercel au MVP ; (3) un nom de domaine éventuel (payant → HITL).

- **Objectif du jour** : poser les fondations — vision, méthodologie, garde-fous, harness agentique, et structure de dépôt — puis publier un premier repo GitHub public.
- **Fait** :
  - Étude de faisabilité consolidée (3 axes : sources de données, concurrence, technique).
  - Documentation fondatrice : `README.md`, `VISION.md`, `docs/METHODOLOGY.md`, `docs/legal-guardrails.md`, `docs/data-sources.md`, `CONTRIBUTING.md`, `LICENSE` (AGPL-3.0).
  - Harness agentique : `AGENTS.md`, `.cursor/rules/` (garde-fous éditoriaux + conventions), `.cursor/skills/` (`daily-standup`, `ingest-an-data`).
  - Gestion de projet : `ROADMAP.md`, `tasks/BACKLOG.md`, ce journal.
  - Squelette monorepo + repo GitHub + automation : en cours dans cette même session.
- **Appris** :
  - La « présence physique en hémicycle » n'existe pas en open data → on parle d'« activité détectée ». Point structurant.
  - L'écosystème (NosDéputés ODbL, Datan GPL) est réutilisable et complémentaire, pas concurrent.
  - Le risque central est éditorial/juridique → d'où les garde-fous comme fondation, pas comme ajout.
- **Bloqueurs** :
  - MCP `cursor-app-control` (move_agent_to_root) indisponible en cours de session → travail mené en chemins absolus dans `~/Developer/open-hemicycle`. Sans impact sur le livrable.
- **Prochaine étape** : tâche `0.4` — squelette monorepo pnpm (`apps/web` Next.js, `packages/etl`), puis `0.5` push GitHub, puis `1.1`/`1.2` Supabase + schéma Drizzle.
- **Commits** : voir l'historique git de la session d'amorçage.
