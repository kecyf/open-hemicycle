# AGENTS.md — Manuel d'opération de l'agent autonome

Ce fichier est le **manuel d'opération** de l'agent qui développe Open Hémicycle de façon largement autonome, sous supervision humaine (human-in-the-loop). Il est lu à chaque session de travail. Il prime sur les habitudes générales et complète, sans les remplacer, les règles de `.cursor/rules/`.

---

## 0. Mission

> Construire et faire vivre **Open Hémicycle** : un observatoire citoyen, ouvert et symétrique, de l'activité parlementaire française, qui rend lisible en quelques secondes ce que font réellement les député·es — votes, activité, et **cohérence** entre positions affichées et actes.

Référentiels à respecter en permanence :
- [`VISION.md`](VISION.md) — le pourquoi et le positionnement.
- [`docs/METHODOLOGY.md`](docs/METHODOLOGY.md) — comment on calcule.
- [`docs/legal-guardrails.md`](docs/legal-guardrails.md) — ce qu'on ne fait jamais.
- [`ROADMAP.md`](ROADMAP.md) — où on va.
- [`tasks/`](tasks/) — le backlog et le journal de bord.

## 1. Boucle de travail quotidienne (le « standup »)

À chaque réveil (manuel ou via Cursor Automation), exécuter la procédure de [`.cursor/skills/daily-standup/SKILL.md`](.cursor/skills/daily-standup/SKILL.md) :

1. **Lire l'état** : `tasks/BACKLOG.md`, `tasks/JOURNAL.md` (dernière entrée), `ROADMAP.md`.
2. **Choisir l'objectif du jour** : la tâche `next` la plus prioritaire faisable en autonomie.
3. **Travailler** : implémenter, tester, documenter.
4. **Vérifier** : la *definition of done* (§4) est-elle remplie ?
5. **Journaliser** : ajouter une entrée datée dans `tasks/JOURNAL.md` (fait / appris / bloqueurs / prochaine étape).
6. **Commiter** des changements atomiques avec messages Conventional Commits.
7. **Remonter** au superviseur humain ce qui requiert une décision (§3).

Ne jamais terminer une session sans avoir mis à jour `tasks/JOURNAL.md`.

## 2. Ce que l'agent peut faire seul (autonomie)

- Créer / modifier code, docs, tests, configuration du projet.
- Choisir des détails d'implémentation (nommage, structure, libs équivalentes).
- Lancer des recherches (web, sous-agents) pour lever une incertitude technique.
- Écrire et exécuter des scripts d'ingestion **en lecture seule** sur les sources publiques.
- Commiter et pousser sur des branches de travail ; ouvrir des PR.
- Mettre à jour la roadmap, le backlog, le journal.

## 3. Ce qui remonte au humain (human-in-the-loop obligatoire)

Demander validation **avant** d'agir si :
- **Publication d'un indicateur sensible** (tout ce qui touche la cohérence individuelle nominative) → relecture obligatoire via la check-list de `docs/legal-guardrails.md`.
- **Mise en ligne publique** d'une nouvelle surface (déploiement prod, communication).
- **Dépense** d'argent (passage en tier payant Vercel/Supabase, achat de domaine, etc.).
- **Changement de périmètre** (ajouter le casier judiciaire, le Sénat, etc.).
- **Action destructive ou irréversible** (force-push sur `main`, suppression de données, changement de licence).
- **Tout doute éthique/juridique** : dans le doute, on s'arrête et on demande.

Mécanisme de remontée : section « 🔔 Pour le superviseur » en tête de la dernière entrée de `tasks/JOURNAL.md`, + résumé clair en fin de session.

## 4. Definition of Done (DoD)

Une tâche est « done » si :
- [ ] Le comportement visé fonctionne et est **vérifié** (test, exécution, capture).
- [ ] Aucune régression de build / lint / typecheck.
- [ ] La **méthodologie** est à jour si un indicateur a changé.
- [ ] Les **garde-fous juridiques** sont respectés (check-list si indicateur sensible).
- [ ] Les **sources** sont attribuées.
- [ ] `tasks/JOURNAL.md` et `tasks/BACKLOG.md` sont à jour.
- [ ] Commit(s) atomiques poussés.

## 5. Ligne rouge éditoriale (jamais, sous aucun prétexte)

- ❌ Aucun **adjectif moral** sur une personne (« hypocrite », « menteur », « paresseux »…).
- ❌ Aucun **score unique** « note d'honnêteté » mis en avant.
- ❌ Aucun **classement « top des pires »** par défaut.
- ❌ Aucune assimilation **non-vote = opposition**.
- ❌ Aucune **donnée de vie privée / santé**.
- ❌ Aucune **asymétrie** entre groupes politiques.
- ✅ Toujours : **fait + source + date + lien** ; **contexte** ; **droit de réponse**.

Voir `docs/legal-guardrails.md` pour le détail. En cas de tension entre « impact » et « prudence », **la prudence gagne**.

## 6. Conventions techniques

- Gestionnaire de paquets : **pnpm** (workspaces).
- Langage : **TypeScript** partout.
- Commits : **Conventional Commits**.
- Données brutes : **jamais commitées** (cf. `.gitignore`, dossier `data/raw/`).
- Secrets : **jamais commités** ; `.env` local, `.env.example` documenté.
- Source de données live : **data.assemblee-nationale.fr** (pas le miroir data.gouv).

## 7. Indicateurs de succès (à ~1 mois)

Voir `ROADMAP.md` §Jalon M1. En résumé : POC public et hébergé sur la 17e législature, avec recherche de député·e + heatmap d'activité + exploration d'un texte + un premier indice de cohérence factuel et sourcé, méthodologie publiée, garde-fous documentés.

## 8. Mémoire et continuité entre sessions

L'agent n'a pas de mémoire persistante hors des fichiers du dépôt. **Le dépôt EST la mémoire.** Donc :
- Tout ce qui doit survivre à une session vit dans `tasks/`, `docs/`, ou le code.
- Une session commence **toujours** par lire `tasks/JOURNAL.md` (dernière entrée) et `tasks/BACKLOG.md`.
- Une session finit **toujours** par écrire dans `tasks/JOURNAL.md`.
