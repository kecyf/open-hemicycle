# Changelog — Open Hémicycle

Toutes les évolutions notables du projet sont consignées ici.

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).
Versionnage [SemVer](https://semver.org/lang/fr/) : on reste en `0.x` tant que le POC public n'est pas complet (jalon **M1**). `1.0.0` marquera le premier POC public complet (recherche député·e + heatmap + explorateur de texte + 1er indice de cohérence sourcé).

Chaque version est aussi un tag git annoté (`git tag -l`). Le journal détaillé des sessions vit dans [`tasks/JOURNAL.md`](tasks/JOURNAL.md) ; le backlog dans [`tasks/BACKLOG.md`](tasks/BACKLOG.md).

Catégories : `Ajouté` · `Modifié` · `Corrigé` · `Supprimé` · `Données` (chargements/ré-ingestions) · `Garde-fous` (éditorial/juridique).

---

## [Non publié]

---

## [0.9.0] — 2026-06-12

Cohérence thème revendiqué (4.3 backend), cross-check NosDéputés (1.7), boucle data réparée (cron ETL + refresh juin), smoke post-merge stabilisé.

### Ajouté
- **Cross-check NosDéputés (1.7)** : `compareGroupEffectifs` / `summarizeDeputeCrossCheck` dans `@open-hemicycle/core` (4 tests) ; commande `pnpm etl validate:nosdeputes` (effectifs par groupe + échantillon nominatif, jointure `id_an` → `PA*`).
- **Cohérence participation / thème revendiqué (4.3)** : `computeComparaisonParticipationTheme` dans `@open-hemicycle/core` (METHODOLOGY §4.c) — 4 tests vitest.
- Mapping auditable des revendications thématiques (`packages/core/src/data/themes-revendiques.ts`, pilote vide).
- Requêtes `getComparaisonParticipationTheme` / `getComparaisonsParticipationThemesRevendiques` ; composant `ParticipationTheme` préparé mais **non branché** sur la fiche (publication nominative → HITL).

### Données
- Ré-ingestion AN (31 mai → 11 juin 2026) : **7 397 scrutins** (+192), **1 148 995 votes** (+25 085) ; heatmap reconstruite (**71 910** lignes, max jour 2026-06-11).
- Secret `DATABASE_URL` posé dans GitHub Actions ; cron ETL Refresh validé (`workflow_dispatch` success).

### Corrigé
- **Smoke post-merge** : poll parallèle de toutes les routes (40 × 20 s, ~13 min) au lieu d'un sleep fixe + vérif séquentielle — évite les faux négatifs pendant le déploiement Vercel.

---

## [0.8.0] — 2026-06-10

Participation aux votes (3 périmètres), alignement groupe (logique + requête), import AMO30, et boucle d'autonomie agent (reprise, cron ETL, smoke prod).

### Ajouté
- **Boucle d'autonomie** : étape « reprise » (§0 bis) dans la skill `daily-standup` ; prompt `automation/daily-prompt.md` aligné sur le protocole PR/auto-merge.
- **CI** : workflow `etl-refresh.yml` (cron quotidien, ingestion additif/idempotent, compteurs avant/après) ; workflow `post-merge-smoke.yml` (vérif routes prod après merge `main`).
- **ETL** : commande `stats` (compteurs députés/scrutins/votes pour les jobs CI).
- **Requête alignement groupe (4.2)** : `getTauxAlignementGroupe` dans `apps/web/lib/queries.ts` (filtre thème optionnel, affiliation courante) ; composant `AlignementGroupe` préparé mais **non branché** sur la fiche (publication nominative → HITL).
- **ETL AMO30** : commandes `ingest:acteurs-historique` (complète les députés absents d'AMO10) et `backfill:votes` (ré-insère les votes ignorés, idempotent).
- **`@open-hemicycle/core`** : trois taux de participation aux votes (solennel, commission, tous) selon METHODOLOGY §3 — 5 tests vitest.
- **Fiche député·e** : bloc « Participation aux votes » (les 3 périmètres affichés ensemble) ; périmètre commission en attente d'ingestion des organes.
- **`@open-hemicycle/core`** : logique pure du taux d'alignement sur la ligne de groupe (METHODOLOGY §4.a) — `positionMajoritaireGroupe`, `voteAligneSurGroupe`, `computeTauxAlignementGroupe` + 4 tests vitest sur fixture JSON.

### Données
- Import AMO30 (lég. 17) : **68 députés** historiques ajoutés (645 total) ; **55 010 votes** récupérés (1 123 910 total, 0 ignoré).

---

## [0.7.0] — 2026-05-30

Regroupement des scrutins par **thème** (classification éditoriale, manuelle et auditable) — premier pas vers l'indice de cohérence par thème. Inclut aussi la mise en place du cycle de livraison par PR + CI.

### Ajouté
- **Thèmes** : tables `themes` + `dossiers_themes`, rattachement au niveau du dossier législatif (un scrutin hérite du thème de son dossier).
- ETL `seed:themes` : (re)pose la classification depuis un fichier **versionné et auditable** (`packages/etl/src/data/themes.ts`), source de vérité unique.
- Page **`/themes`** (liste des thèmes + nombre de scrutins) ; filtre `?theme=` sur l'explorateur de scrutins ; pastilles de thème cliquables sur le détail d'un scrutin ; lien « Thèmes » dans le pied de page.
- Méthodologie : section dédiée à la classification thématique (règle conservatrice, périmètre, lien vers le mapping auditable).
- **CI GitHub Actions** (`typecheck` + `test` + `build`) sur chaque PR et push `main`.
- **Cycle de livraison par PR** documenté (AGENTS.md §6 ter + skill standup) : branche → PR → CI verte → review automatisée → merge.
- Guide de **review automatisée** (`.cursor/BUGBOT.md`, priorité aux garde-fous éditoriaux) + gabarit de PR.

### Données
- Schéma (additif) : tables `themes`, `dossiers_themes` (RLS + lecture publique).
- Pilote : 2 thèmes — `budget-finances` (2 dossiers, ~168 scrutins) et `securite-immigration` (1 dossier, ~101 scrutins).

### Garde-fous
- Classification **conservatrice** (un dossier n'entre dans un thème que si son titre officiel le justifie sans ambiguïté) ; thème = regroupement neutre, jamais un jugement ; mapping public et traçable par PR ; périmètre symétrique.

### Corrigé
- Typecheck du package `@open-hemicycle/db` (ajout `@types/node`, tsconfig `noEmit`) — le monorepo typecheck désormais entièrement au vert.

---

## [0.6.0] — 2026-05-30

Lien scrutin ↔ dossier législatif : prérequis du regroupement par thème (donc de l'indice de cohérence). Capture aussi le résultat officiel des scrutins.

### Ajouté
- ETL `ingest:dossiers` : import des dossiers législatifs (2 609 dossiers de la 17ᵉ lég.) avec titre, procédure parlementaire et URL officielle du dossier.
- Rattachement automatique des scrutins à leur dossier (`scrutins.dossier_id` via `objet.dossierLegislatif.dossierRef`) — 1 375 scrutins liés à 40 dossiers.
- Capture du résultat officiel `sort` (adopté / rejeté) pour les 7 205 scrutins.
- Web : badge résultat (Adopté/Rejeté) sur la liste et le détail des scrutins ; bloc « Dossier législatif » avec lien vers la page officielle du dossier.

### Données
- Schéma (additif) : `scrutins.sort`, `dossiers_legislatifs.procedure`, `dossiers_legislatifs.url_an`.
- Re-ingestion scrutins (dump frais : 7 205 scrutins).

### Garde-fous
- Résultat `sort` affiché verbatim (terme officiel AN), sans interprétation des règles de majorité (renvoi à la source). Lien dossier vers la page officielle.

---

## [0.5.0] — 2026-05-30

Socle garde-fous public : le site expose désormais sa méthodologie, ses mentions légales et un canal de signalement, condition pour que des surfaces de données nominatives soient en ligne.

### Ajouté
- Footer global (`SiteFooter`) sur toutes les pages : navigation + attribution sources & licence.
- Page `/methodologie` fidèle à `docs/METHODOLOGY.md` (chaque indicateur explicité et lié).
- Page `/mentions-legales` : éditeur, sources & licences (Etalab 2.0 / ODbL), RGPD, immunité parlementaire, garde-fous éditoriaux.
- Page `/signaler` : correction de donnée et droit de réponse via issues GitHub pré-remplies (traçable).

### Garde-fous
- Satisfait l'exigence « méthodologie liée + droit de réponse accessible » de `docs/legal-guardrails.md`.

## [0.4.0] — 2026-05-30

Explorateur de scrutins : 2ᵉ grande surface produit.

### Ajouté
- Page `/scrutins` : liste paginée filtrable (solennels / motions de censure / ordinaires), libellé verbatim + décompte officiel.
- Page `/scrutins/[uid]` : ventilation des votes par groupe (barres empilées + compteurs), lien vers l'analyse officielle AN.
- Requêtes serveur `listScrutins` / `countScrutins` / `getScrutinDetail` + helpers de formatage.

### Garde-fous
- Libellés AN verbatim, lien source officielle, date affichée ; pas d'assertion adoption/rejet (champ `sort` non capté) ; disclaimer non-votant ≠ absence ; ventilation rattachée au groupe actuel (limite affichée).

## [0.3.0] — 2026-05-29

Heatmap d'activité (façon « contributions GitHub »), vertical slice complet.

### Ajouté
- Package `@open-hemicycle/core` : fonctions pures testées (vitest) — `scoreJour`, `computeSeuilsNiveaux` (quantiles population), `niveauPourScore`, helpers participation.
- Job ETL `job:activite` agrégeant les votes exprimés par (député × jour, TZ Europe/Paris).
- Composant `ActivityHeatmap` rendu serveur (sans dépendance externe) sur la fiche député·e + légende/disclaimer.

### Données
- `activite_journaliere` : 66 080 lignes (576 députés, 2024-10-08 → 2026-05-29), seuils 2 / 9 / 22.

## [0.2.0] — 2026-05-29

Le site devient vivant : annuaire et fiches sur vraies données.

### Ajouté
- Couche requêtes serveur lecture seule (Drizzle) : `listGroupes`, `listDeputes`, `getDeputeBySlug`, `getVoteStats`, `getGlobalCounts`.
- Pages `/deputes` (annuaire 577, filtre par groupe) et `/deputes/[slug]` (fiche : répartition des votes, taux d'exprimés, lien fiche AN).
- ETL : import députés (AMO10) + groupes/organes + affiliations ; import scrutins + votes individuels (17e législature).
- Composants `DataNotice` (POC, données partielles) et `ActivityDisclaimer`.

### Données
- Chargement initial Supabase : 577 députés, 12 groupes, 588 affiliations, 7 074 scrutins, 1 056 062 votes individuels.

### Corrigé
- Prod : `DATABASE_URL` posé sur les 3 cibles Vercel (production/preview/development) + redeploy (les `/deputes` renvoyaient 500).

### Limite connue
- 55 010 votes ignorés (acteurs hors AMO10) → nécessite l'import AMO30 (suivi en 1.4b).

## [0.1.0] — 2026-05-29

Amorçage et infrastructure live : le projet existe, est documenté et déployé.

### Ajouté
- Documentation fondatrice : `README`, `VISION`, `docs/METHODOLOGY`, `docs/legal-guardrails`, `docs/data-sources`, `CONTRIBUTING`, `LICENSE` (AGPL-3.0).
- Harness agentique : `AGENTS.md`, `.cursor/rules/` (garde-fous + conventions), `.cursor/skills/` (`daily-standup`, `ingest-an-data`), `ROADMAP`, `tasks/`.
- Squelette monorepo pnpm (`apps/web` Next.js 16, `packages/etl`, `packages/db`) + schéma Drizzle (10 tables).
- Infra : Supabase (Postgres 17, RLS + policies de lecture publique) + Vercel auto-déployé depuis GitHub.

### En ligne
- Landing publique : <https://open-hemicycle.vercel.app>

[Non publié]: https://github.com/kecyf/open-hemicycle/compare/v0.6.0...HEAD
[0.6.0]: https://github.com/kecyf/open-hemicycle/releases/tag/v0.6.0
[0.5.0]: https://github.com/kecyf/open-hemicycle/releases/tag/v0.5.0
[0.4.0]: https://github.com/kecyf/open-hemicycle/releases/tag/v0.4.0
[0.3.0]: https://github.com/kecyf/open-hemicycle/releases/tag/v0.3.0
[0.2.0]: https://github.com/kecyf/open-hemicycle/releases/tag/v0.2.0
[0.1.0]: https://github.com/kecyf/open-hemicycle/releases/tag/v0.1.0
