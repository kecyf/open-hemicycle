---
name: daily-standup
description: Procédure de réveil quotidien de l'agent autonome Open Hémicycle. À lancer au début de chaque session de travail (manuelle ou déclenchée par une Cursor Automation) pour reprendre le fil, choisir l'objectif du jour, travailler, vérifier, et journaliser.
---

# Daily standup — Open Hémicycle

Tu es l'agent autonome qui développe Open Hémicycle. Le dépôt est ta mémoire : tu ne sais que ce qu'il contient. Suis cette procédure dans l'ordre.

## 0. Évaluer ton contexte d'exécution (à faire en premier)

Tu peux tourner dans deux contextes très différents. **Détecte-le avant de choisir une tâche**, sinon tu vas te bloquer.

- **Accès base de données** : `DATABASE_URL` est-il présent dans l'environnement ? Teste-le tôt (ex. un `SELECT now()`).
  - ✅ Présent → tu peux faire de l'ETL, des requêtes, des jobs d'agrégation.
  - ❌ Absent (cas fréquent en agent cloud : le `.env` local est gitignoré et n'est pas livré) → **ne prends pas** de tâche qui écrit/lit la base. Choisis une tâche **sans base** (voir liste ci-dessous) et note dans le journal qu'il faudrait fournir `DATABASE_URL` en secret de l'automation pour débloquer les tâches data.
- **MCP / outils** : tu n'as peut-être pas les serveurs MCP disponibles en local (Supabase, Vercel…). Ne suppose pas qu'ils sont là ; vérifie, et dégrade proprement.
- **Réseau** : `data.assemblee-nationale.fr` est public (pas de secret requis) → le téléchargement de dumps reste possible même sans DB, mais ne sert à rien si tu ne peux pas charger en base.

**Tâches « cloud-safe » (sans base, vérifiables par build/test/typecheck)** — à privilégier si la DB est absente :
- Logique pure testable : fonctions de calcul (niveaux de heatmap, taux de participation, composantes de l'indice de cohérence) avec **tests unitaires sur fixtures JSON** (extraits réels de `data/` non commités → recopier de petits échantillons en fixtures).
- Frontend : composants UI sur données de fixture/mock (annuaire, fiche, légende, heatmap), accessibilité, pages méthodologie / mentions légales / « signaler une erreur ».
- Outillage : config lint/typecheck/tests à l'échelle du monorepo, CI GitHub Actions.
- Documentation : méthodologie, garde-fous, data-sources, README.

Dans tous les cas : **un incrément testable et committé vaut mieux qu'une grosse tâche bloquée.**

## 1. Reprendre le fil (lecture)
- Lire `AGENTS.md` (manuel d'opération) si pas déjà en contexte.
- Lire la **dernière entrée** de `tasks/JOURNAL.md` : où en était-on, quels bloqueurs, quelle « prochaine étape » était notée.
- Lire `tasks/BACKLOG.md` : tâches `next` / `in-progress`.
- Survoler `ROADMAP.md` : sommes-nous alignés sur le jalon courant ?
- Repérer la **version courante** : `package.json` (root) + section `[Non publié]` de `CHANGELOG.md` (qu'est-ce qui est livré mais pas encore taggé ?).

## 2. Choisir l'objectif du jour
- Prendre la tâche **la plus prioritaire faisable en autonomie** (voir AGENTS.md §2).
- Si la seule tâche prioritaire requiert une décision humaine (AGENTS.md §3) : préparer la question, la consigner pour le superviseur, et prendre la tâche autonome suivante.
- Annoncer l'objectif du jour en une phrase.

## 3. Travailler
- Implémenter par petits incréments testables.
- Respecter les lignes rouges éditoriales (`.cursor/rules/editorial-guardrails.mdc`) et la méthodologie.
- Lancer des sous-agents pour la recherche si besoin, afin de préserver le contexte.

## 4. Vérifier (Definition of Done — AGENTS.md §4)
- Build / lint / typecheck OK.
- Comportement vérifié (exécution, test, capture).
- Méthodologie & attribution à jour si nécessaire.
- Check-list juridique si un indicateur sensible est touché.
- `CHANGELOG.md` à jour (section `[Non publié]` au minimum).

## 5. Journaliser (obligatoire — ne jamais sauter)
Ajouter une entrée datée en **tête** de `tasks/JOURNAL.md` avec ce format :

```markdown
## YYYY-MM-DD

🔔 Pour le superviseur : <décisions/validations attendues, ou "rien">

- **Objectif du jour** : ...
- **Fait** : ...
- **Appris** : ...
- **Bloqueurs** : ...
- **Prochaine étape** : ...
- **Commits** : <hashes ou résumé>
```

## 6. Commiter, versionner & livrer par PR
- Travailler sur une **branche** (`feat/`, `fix/`, `chore/`), jamais directement sur `main` (déployé en prod). Commits atomiques, messages Conventional Commits.
- Reporter l'avancée dans `CHANGELOG.md` (section `[Non publié]`).
- **Ouvrir une PR toi-même** (l'outil « Open Pull Request » est activé). `main` est protégée : seule la **CI verte** (`typecheck` + `test` + `build`) est requise pour merger. Ne jamais merger sur du rouge. Ne jamais force-push sur `main`. **Ne jamais t'auto-approuver.**
- **Choisir le mode de merge selon la nature du travail** (voir AGENTS.md §6 ter) :
  - **Travail sûr** (logique pure testée, docs, outillage, refactor non visible) → **active l'auto-merge** : `gh pr merge <n> --auto --squash`. La PR se merge seule dès CI verte, branche supprimée automatiquement. Tu n'attends personne.
  - **Indicateur sensible / nominatif** (AGENTS.md §3), **release majeure**, ou **nouvelle surface publique** → **PAS d'auto-merge**. **Demande le superviseur en reviewer** + **commente la PR** avec le flag « 🔔 superviseur » (décision attendue, contexte, lien scrutin/doc). Le merge est **HITL** : tu laisses la PR ouverte et tu enchaînes sur la tâche autonome suivante.
- Si un incrément cohérent est livré (nouvelle surface / job / indicateur), **couper une version** : déplacer `[Non publié]` → `[X.Y.Z] — date`, bumper `package.json` (root), `chore(release): vX.Y.Z`, tag annoté `vX.Y.Z`, `git push --tags` (voir AGENTS.md §6 bis). Release majeure ou indicateur sensible = merge **HITL**.
- **Avant de réécrire un module, vérifie qu'il n'existe pas déjà** (sur `main` ou dans une PR ouverte) : faute de merge, des indicateurs ont été réécrits sous plusieurs noms. Une PR ouverte non mergée = travail déjà fait, à reprendre, pas à refaire.

## 7. Remonter au superviseur
- Terminer la session par un résumé court : avancement, ce qui est en ligne/testable, et **les questions/validations en attente**.

## Règle d'or
Ne jamais terminer une session sans avoir écrit dans `tasks/JOURNAL.md`. Si tu es bloqué, journalise le blocage et la question — c'est aussi du progrès.
