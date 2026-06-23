# Couche d'enrichissement LLM — classification scrutin → thème

Document méthodologique pour la tâche **4.8** (Open Hémicycle). Complète [`METHODOLOGY.md`](METHODOLOGY.md) §5 et [`theme-taxonomy.md`](theme-taxonomy.md).

---

## Objectif

Rattacher les scrutins **sans dossier législatif** (~80 % du corpus) à un thème de la taxonomie institutionnelle (8 commissions permanentes AN), de façon **figée, versionnée et auditable**.

Le modèle **classe des faits publics** (titre/objet d'un scrutin). Il ne produit **aucun jugement** sur une personne ou un groupe.

---

## Périmètre et garde-fous

| Règle | Application |
|-------|-------------|
| Classer, jamais juger | Sortie = slug taxonomie ou « non classé » + confiance + justification factuelle |
| Taxonomie figée | 8 slugs `theme-taxonomie.ts` uniquement ; pas de thème ad hoc |
| Seuil de confiance | `< 0,75` → **non classé** (cf. `CONFIDENCE_THRESHOLD` dans core) |
| Ambiguïté / texte transversal | `theme_slug = null` (règle conservatrice, cf. METHODOLOGY §5) |
| Sortie figée | Écriture unique en base ; le site lit la table, pas d'appel LLM à chaud |
| Versionnage | `(scrutin_id, prompt_version)` unique ; prompt v1 dans `prompt-v1.ts` |
| Traçabilité | Colonnes : `model_id`, `prompt_version`, `confidence`, `justification`, `classified_at` |
| Symétrie | Même grille pour tous les scrutins ; pas de traitement différencié par groupe |

---

## Pipeline technique

1. **Entrée** : `uid_an`, `titre`, `objet` (sources AN officielles).
2. **Prompt v1** : liste exhaustive des 8 thèmes + consignes JSON (`packages/etl/src/enrichissement/prompt-v1.ts`).
3. **Modèle par défaut** : `google/gemini-2.0-flash-001` via [OpenRouter](https://openrouter.ai/) (`temperature = 0`).
4. **Parse + filtre** : `parseLlmClassificationResponse` → `resolveClassification` (core).
5. **Persistance** : table `scrutins_classifications` (upsert idempotent).
6. **Mesure** : échantillon-or `classification-gold-sample.ts` + `pnpm etl validate:enrichissement`.
7. **Lecture atlas (à venir)** : `resolveEffectiveThemeSlug` (core) — rattachement dossier prioritaire, sinon classification LLM si confiance ≥ seuil.

Le job `classify:scrutins` **ignore** les scrutins déjà classifiés pour la `prompt_version` courante (rejeu idempotent).

### Commandes

```bash
# Sans DB ni clé API — valide structure + benchmark offline
pnpm etl validate:enrichissement

# Live (OPENROUTER_API_KEY + DATABASE_URL + migration appliquée)
pnpm etl classify:scrutins --limit=50
pnpm etl classify:scrutins --dry-run --limit=5
```

---

## Échantillon-or

15 scrutins annotés manuellement (`packages/core/src/data/classification-gold-sample.ts`) :

- 12 cas « classés » (titres officiels AN ou paraphrase fidèle) ;
- 3 cas « non classé » (motion de censure, résolution UE ambiguë, texte DUE fourre-tout).

Précision cible publiée : **≥ 80 %** sur l'échantillon-or avant extension du job en production.

---

## Migration base (HITL)

La table `scrutins_classifications` est définie dans `packages/db/src/schema.ts`. **L'application de la migration en production requiert validation superviseur** (AGENTS.md §3 — DDL).

Fichier SQL idempotent : `packages/db/drizzle/0001_scrutins_classifications.sql`.

```bash
# Vérifier la connexion et l'état de la migration
pnpm etl check:db

# Appliquer en prod (HITL) — Supabase SQL Editor ou psql
# \i packages/db/drizzle/0001_scrutins_classifications.sql
```

Après application : `pnpm etl check:db` doit afficher `table classif. : OK`.

---

## Secrets requis

| Variable | Usage |
|----------|--------|
| `OPENROUTER_API_KEY` | Appels classification live (secret superviseur) |
| `DATABASE_URL` | Persistance (`oh_agent` recommandé en cloud) |

Documentées dans `.env.example`.

---

## Limites connues

- Classification au **niveau scrutin**, pas dossier — héritage dossier → thème reste prioritaire quand le lien existe.
- Le modèle peut se tromper : le seuil + l'échantillon-or + le signalement utilisateur limitent le risque.
- Revue humaine sur cas limites et avant extension à l'ensemble du corpus.

---

## Références

- [`VISION.md`](../VISION.md) — section « couche d'enrichissement »
- [`docs/legal-guardrails.md`](legal-guardrails.md)
- [`docs/theme-taxonomy.md`](theme-taxonomy.md)
