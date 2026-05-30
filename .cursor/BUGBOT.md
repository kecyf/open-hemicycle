# Guide de review automatisée — Open Hémicycle

Instructions pour la revue automatique des PR. Open Hémicycle traite de **personnes publiques** à partir de **données publiques** : le risque dominant est **éditorial et juridique**, pas seulement technique. Priorise ces points.

## 1. Garde-fous éditoriaux (bloquant — priorité absolue)
Référence : `docs/legal-guardrails.md` et `.cursor/rules/editorial-guardrails.mdc`. Signale toute introduction de :
- **Adjectif moral** sur une personne (« hypocrite », « menteur », « paresseux », « absentéiste », « député fantôme »…) dans le code, l'UI, les commentaires, les commits ou la doc.
- **Score unique** présenté comme une « note de moralité / d'honnêteté », ou **classement « top des pires »** affiché par défaut.
- Assimilation **non-vote = opposition** (les positions pour / contre / abstention / non-votant doivent rester distinctes).
- **Donnée de vie privée ou de santé**.
- **Asymétrie** de traitement entre groupes politiques.
- Un chiffre ou une affirmation **sans source** (la règle est : fait + source + date + lien officiel).

## 2. Justesse des données et de la méthodologie
- Les libellés issus de l'Assemblée nationale doivent rester **verbatim** (jamais reformulés).
- Tout changement d'un indicateur doit être reflété dans `docs/METHODOLOGY.md`.
- Vérifier les limites assumées (ex. ventilation par **groupe actuel** ≠ groupe à la date du scrutin ; « activité détectée » ≠ « présence »).
- Attention aux requêtes SQL/Drizzle : jointures sur l'affiliation courante (`valid_to IS NULL`), risques de double comptage, index manquants sur de gros volumes (votes ~1M lignes).

## 3. Sécurité & accès données
- La couche `lib/queries.ts` est **serveur uniquement** : la connexion porte tous les droits, ne jamais l'exposer côté client.
- Pas de secret en clair (`.env` jamais commité). Pas de données brutes dans le repo (`data/raw/`).

## 4. Technique
- Régressions `typecheck` / `test` / `build` (la CI les attrape, mais signale les causes probables).
- Cohérence du versionnage : une capacité visible livrée doit apparaître dans `CHANGELOG.md`.

En cas de doute éditorial : **la prudence gagne** — demande une relecture humaine (HITL) plutôt que d'approuver.
