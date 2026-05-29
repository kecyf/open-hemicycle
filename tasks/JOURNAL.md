# Journal de bord — Open Hémicycle

Entrées les plus récentes en haut. Le dépôt est la mémoire de l'agent : ce journal est lu au début de chaque session et écrit à la fin (voir `AGENTS.md` §1 et la skill `daily-standup`).

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
