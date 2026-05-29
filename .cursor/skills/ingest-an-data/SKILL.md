---
name: ingest-an-data
description: Récupérer et charger les données ouvertes de l'Assemblée nationale (data.assemblee-nationale.fr) dans la base Open Hémicycle. Utiliser pour tout travail d'ingestion ETL : télécharger un dump, le parser, le valider, le charger, ou ajouter un nouveau jeu de données.
---

# Ingestion des données ouvertes de l'Assemblée nationale

## Source et principes
- **Source primaire UNIQUE** : `data.assemblee-nationale.fr`. Ne PAS utiliser le miroir `data.gouv.fr` de l'AN (figé ~juin 2022).
- Licence : Licence Ouverte Etalab 2.0 → attribution obligatoire.
- Modèle : fichiers ZIP (JSON/XML) + URLs unitaires + index journalier. Pas d'API REST officielle.
- Législature courante : **17** (juin 2024 →).

## URLs de référence
Voir le tableau complet dans `docs/data-sources.md`. Core MVP :
- Scrutins : `/static/openData/repository/17/loi/scrutins/Scrutins.json.zip`
- Députés actifs (AMO10) : `/static/openData/repository/17/amo/deputes_actifs_mandats_actifs_organes/AMO10_deputes_actifs_mandats_actifs_organes.json.zip`
- Dossiers législatifs : `/static/openData/repository/17/loi/dossiers_legislatifs/Dossiers_Legislatifs.json.zip`
- Débats (Syceron, XML) : `/static/openData/repository/17/vp/syceronbrut/syseron.xml.zip`
- Index du jour : `https://www.assemblee-nationale.fr/dyn/opendata/list-publication/publication_j.csv`

Préfixe : `https://data.assemblee-nationale.fr`

## Procédure ETL
1. **EXTRACT** — télécharger le ZIP dans `data/raw/` (jamais commité). Retry avec backoff.
2. **VALIDATE** — parser + valider avec un schéma (Zod). Logguer les anomalies (archives parfois invalides côté AN).
3. **TRANSFORM** — normaliser les identifiants (`PA*`, `PO*`, `VTANR5L17V*`, `AMANR5*`), résoudre les FK (`acteurRef`, `organeRef`, `dossierLegislatif`).
4. **LOAD** — UPSERT idempotent (`ON CONFLICT DO UPDATE`) via Drizzle.
5. **HISTORISER** — relations temporelles (affiliations de groupe, mandats) en SCD type 2 (`valid_from`/`valid_to`).
6. **AGRÉGER** — recalculer `activite_journaliere` (cf. METHODOLOGY §2).
7. **AUDITER** — consigner le run (date, nb enregistrements, erreurs) dans une table `sync_runs`.

## Outils
- Réutiliser si pertinent `@tricoteuses/assemblee` (npm, schémas TS) — ⚠️ licence AGPL-3.0 (copyleft, compatible avec notre code AGPL).
- Cross-check possible via l'API NosDéputés (ODbL) — pas comme source primaire.

## Pièges connus
- Scrutins = votes **publics électroniques** uniquement (votes à main levée absents).
- Pas de donnée de **présence physique** : on agrège une **activité détectée**.
- Identifiants stables mais changements de groupe en cours de législature → bien historiser.
- Gros volumes : amendements ~260 Mo. Paginer / streamer le parsing.

## Definition of done d'une ingestion
- Données chargées et comptées (log de `sync_runs`).
- Schéma de validation en place.
- Idempotence vérifiée (relancer ne duplique pas).
- Attribution de la source documentée.
