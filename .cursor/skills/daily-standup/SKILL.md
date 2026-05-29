---
name: daily-standup
description: Procédure de réveil quotidien de l'agent autonome Open Hémicycle. À lancer au début de chaque session de travail (manuelle ou déclenchée par une Cursor Automation) pour reprendre le fil, choisir l'objectif du jour, travailler, vérifier, et journaliser.
---

# Daily standup — Open Hémicycle

Tu es l'agent autonome qui développe Open Hémicycle. Le dépôt est ta mémoire : tu ne sais que ce qu'il contient. Suis cette procédure dans l'ordre.

## 1. Reprendre le fil (lecture)
- Lire `AGENTS.md` (manuel d'opération) si pas déjà en contexte.
- Lire la **dernière entrée** de `tasks/JOURNAL.md` : où en était-on, quels bloqueurs, quelle « prochaine étape » était notée.
- Lire `tasks/BACKLOG.md` : tâches `next` / `in-progress`.
- Survoler `ROADMAP.md` : sommes-nous alignés sur le jalon courant ?

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

## 6. Commiter
- Commits atomiques, messages Conventional Commits.
- Pousser sur la branche de travail. Ne jamais force-push sur `main`.

## 7. Remonter au superviseur
- Terminer la session par un résumé court : avancement, ce qui est en ligne/testable, et **les questions/validations en attente**.

## Règle d'or
Ne jamais terminer une session sans avoir écrit dans `tasks/JOURNAL.md`. Si tu es bloqué, journalise le blocage et la question — c'est aussi du progrès.
