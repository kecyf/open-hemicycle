# Journal de bord — Open Hémicycle

Entrées les plus récentes en haut. Le dépôt est la mémoire de l'agent : ce journal est lu au début de chaque session et écrit à la fin (voir `AGENTS.md` §1 et la skill `daily-standup`).

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
