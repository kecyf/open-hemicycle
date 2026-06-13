# Sources de données

Vérifié au 29/05/2026, législature courante **XVIIe** (juin 2024 →).

## Source primaire

**[data.assemblee-nationale.fr](https://data.assemblee-nationale.fr/)** — Licence Ouverte Etalab 2.0.
Pas d'API REST officielle : modèle **fichiers (ZIP JSON/XML) + URLs unitaires + index journalier**.

| Jeu | URL (17e lég.) | Format | Volume approx. |
|---|---|---|---|
| Scrutins (votes individuels) | `/static/openData/repository/17/loi/scrutins/Scrutins.json.zip` | JSON | ~22 Mo (~7 000 scrutins) |
| Députés actifs | `/static/openData/repository/17/amo/deputes_actifs_mandats_actifs_organes/AMO10_deputes_actifs_mandats_actifs_organes.json.zip` | JSON | ~5 Mo (~577) |
| Historique députés (depuis XIe) | `/static/openData/repository/17/amo/tous_acteurs_mandats_organes_xi_legislature/AMO30_tous_acteurs_tous_mandats_tous_organes_historique.json.zip` | JSON | ~13 Mo |
| Amendements | `/static/openData/repository/17/loi/amendements_div_legis/Amendements.json.zip` | JSON | ~260 Mo |
| Dossiers législatifs | `/static/openData/repository/17/loi/dossiers_legislatifs/Dossiers_Legislatifs.json.zip` | JSON | ~9 Mo |
| Débats séance (Syceron) | `/static/openData/repository/17/vp/syceronbrut/syseron.xml.zip` | XML | ~47 Mo |
| Réunions / agenda | `/static/openData/repository/17/vp/reunions/Agenda.json.zip` | JSON | ~7 Mo |
| Questions écrites | `/static/openData/repository/17/questions/questions_ecrites/Questions_ecrites.json.zip` | JSON | ~39 Mo |
| Schémas XSD | `/static/openData/repository/SCHEMAS/Schemas.zip` | XSD | ~1 Mo (doc 2016) |
| Index publications du jour | `https://www.assemblee-nationale.fr/dyn/opendata/list-publication/publication_j.csv` | CSV | temps réel (~1 min) |

**Identifiants** : `PA*` acteurs, `PO*` organes (groupes/commissions), `VTANR5L17V*` scrutins, `AMANR5*` amendements. Clés de jointure : `acteurRef`, `organeRef`, `dossierLegislatif`.

⚠️ **Ne pas utiliser le miroir `data.gouv.fr` de l'AN comme source live** : il est figé vers juin 2022.

## Compléments

| Source | Usage | Licence | Notes |
|---|---|---|---|
| [NosDéputés.fr](https://www.nosdeputes.fr) ([API](https://github.com/regardscitoyens/nosdeputes.fr/blob/master/doc/api.md)) | Cross-check, indicateurs d'activité pré-calculés | **ODbL 1.0** | Ajouter `/json`,`/xml`,`/csv` aux URLs. *Share-alike*. Commandes : `pnpm etl validate:nosdeputes` (effectifs groupe + échantillon nominatif) ; `pnpm etl audit:dossiers-scrutins` (inventaire hors-ligne des dossiers porteurs de scrutins, sans DB). |
| [Datan](https://datan.fr) ([data.gouv](https://www.data.gouv.fr/organizations/datan)) | Scores participation/loyauté (comparaison) | Licence Ouverte | MàJ hebdo |
| [@tricoteuses/assemblee](https://www.npmjs.com/package/@tricoteuses/assemblee) | ETL : download, clean, schémas TS | **AGPL-3.0** | Très actif. Attention licence (copyleft). |
| [HATVP open data](https://www.hatvp.fr/open-data/) | Déclarations d'intérêts/patrimoine | Licence Ouverte | CSV + XML |
| [HATVP répertoire lobby (AGORA)](https://www.hatvp.fr/open-data-repertoire/) | Représentants d'intérêts | Licence Ouverte | JSON consolidé (MàJ nocturne) |

## Faisabilité par fonctionnalité

| Fonctionnalité | Faisable | Limite clé |
|---|---|---|
| Votes par parti / par loi | ✅ | scrutins **publics électroniques** uniquement |
| Heatmap d'activité | ✅ | proxy d'activité, **pas une présence** |
| Taux de participation aux votes | ✅ | solennels ≠ tous les votes |
| Présence en commission | ✅ partiel | seulement réunions avec CR |
| Présence physique hémicycle | ❌ | **donnée inexistante** |
| Cohérence vote / ligne de groupe | ✅ | — |
| Cohérence position publique / vote | ⚠️ | rattachement position↔scrutin délicat (validation manuelle requise) |
| Conflits d'intérêts (HATVP) | ✅ | matching député↔déclaration imparfait |

## Attribution (à afficher sur le site)

> Données issues de l'Assemblée nationale (data.assemblee-nationale.fr, Licence Ouverte Etalab 2.0), de NosDéputés.fr (Regards Citoyens, ODbL), de la HATVP et de Datan. Open Hémicycle remercie ces projets dont il réutilise et complète le travail.
