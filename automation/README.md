# Automation — réveil quotidien de l'agent

Open Hémicycle est conçu pour être développé par un agent autonome réveillé chaque jour. Trois façons de câbler ce réveil.

## Option A — Cursor Automation (recommandé)

Une Cursor Automation peut lancer un agent sur un planning (ex. tous les jours à 8h00).

1. Ouvre l'UI **Automations** de Cursor (sur cursor.com / dans l'app).
2. Crée une automation **planifiée** (cron quotidien, ex. `0 8 * * *`, TZ Europe/Paris).
3. Cible ce dépôt (`open-hemicycle`).
4. Comme prompt, colle le contenu de [`automation/daily-prompt.md`](daily-prompt.md) (ou pointe dessus).
5. Active l'outil **Open Pull Request** et les permissions GitHub App (Pull requests = write).
6. Fournis `DATABASE_URL` dans **Cloud Agents → Secrets** (rôle limité `oh_agent`, jamais `postgres`).
7. L'agent travaille, journalise, ouvre une PR et auto-merge le travail sûr ; relis les entrées « 🔔 Pour le superviseur » dans `tasks/JOURNAL.md`.

> Le superviseur humain garde la main : indicateurs sensibles, release majeure et nouvelle surface publique = merge HITL (voir `AGENTS.md` §3 et §6 ter).

## Option B — boucle locale (skill `loop`)

Pour un réveil piloté localement, utiliser la skill `loop` de Cursor : un shell d'arrière-plan qui réveille l'agent à intervalle fixe avec le prompt de `daily-prompt.md`.

## Option C — CI planifiée ETL (en place)

Un workflow GitHub Actions rafraîchit les données **additives** chaque nuit, **avant** le standup agent :

- Fichier : [`.github/workflows/etl-refresh.yml`](../.github/workflows/etl-refresh.yml)
- Cron : `30 4 * * *` UTC (~06:30 Paris) + déclenchement manuel (`workflow_dispatch`)
- Commandes : `download` → `ingest:deputes` → `ingest:acteurs-historique` → `backfill:votes` → `ingest:dossiers` → `ingest:scrutins` → `seed:themes`
- **Exclut** `job:activite` (DELETE + rebuild de `activite_journaliere` → HITL ou run agent explicite)
- Compteurs avant/après dans le job summary (`pnpm etl stats`)

**Secret requis (action superviseur)** : `DATABASE_URL` dans GitHub → Settings → Secrets → Actions, chaîne pooler Supabase avec le rôle **`oh_agent`**.

## Smoke prod post-merge

Après chaque merge sur `main`, le workflow [`.github/workflows/post-merge-smoke.yml`](../.github/workflows/post-merge-smoke.yml) vérifie que https://open-hemicycle.vercel.app répond en HTTP 200 sur `/`, `/deputes`, `/scrutins`, `/themes`. Un échec est repris en priorité par l'étape « reprise » (§0 bis) du daily standup.

---

**Cadence recommandée au démarrage** : 1 réveil/jour agent + 1 refresh ETL nocturne. Le but n'est pas de commiter pour commiter, mais d'avancer le jalon M1 (voir `ROADMAP.md`).
