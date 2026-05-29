# Journal de bord — Open Hémicycle

Entrées les plus récentes en haut. Le dépôt est la mémoire de l'agent : ce journal est lu au début de chaque session et écrit à la fin (voir `AGENTS.md` §1 et la skill `daily-standup`).

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
