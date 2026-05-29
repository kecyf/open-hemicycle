# Automation — réveil quotidien de l'agent

Open Hémicycle est conçu pour être développé par un agent autonome réveillé chaque jour. Deux façons de câbler ce réveil.

## Option A — Cursor Automation (recommandé)

Une Cursor Automation peut lancer un agent sur un planning (ex. tous les jours à 8h00).

1. Ouvre l'UI **Automations** de Cursor (sur cursor.com / dans l'app).
2. Crée une automation **planifiée** (cron quotidien).
3. Cible ce dépôt (`open-hemicycle`).
4. Comme prompt, colle le contenu de [`automation/daily-prompt.md`](daily-prompt.md) (ou pointe dessus).
5. Laisse l'agent travailler, journaliser et commiter ; relis les entrées « 🔔 Pour le superviseur » dans `tasks/JOURNAL.md`.

> Le superviseur humain garde la main : aucune publication/déploiement public ni dépense n'est faite sans validation (voir `AGENTS.md` §3).

## Option B — boucle locale (skill `loop`)

Pour un réveil piloté localement, utiliser la skill `loop` de Cursor : un shell d'arrière-plan qui réveille l'agent à intervalle fixe avec le prompt de `daily-prompt.md`.

## Option C — CI planifiée (plus tard)

Quand l'ETL sera stable, une GitHub Action `cron` quotidienne pourra rafraîchir les données (sans agent), pendant que l'agent ne travaille le code que sur déclenchement. À mettre en place en Phase 1+.

---

**Cadence recommandée au démarrage** : 1 réveil/jour. Augmenter si le backlog le justifie. Le but n'est pas de commiter pour commiter, mais d'avancer le jalon M1 (voir `ROADMAP.md`).
