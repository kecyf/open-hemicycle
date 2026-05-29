# Open Hémicycle

> Voir ce que votre député·e **fait vraiment**, pas ce qu'il·elle dit.

**Open Hémicycle** est un observatoire citoyen, ouvert et symétrique, de l'activité parlementaire française. Il agrège les données publiques de l'Assemblée nationale pour rendre **lisible en quelques secondes** le travail réel des député·es : leurs votes, leur activité, et la **cohérence** entre leurs positions affichées et leurs actes — texte par texte, fait par fait, source par source.

Ce dépôt est **open source** (code) et **open data** (données dérivées), dans la lignée de [NosDéputés.fr](https://www.nosdeputes.fr) (Regards Citoyens) et [Datan.fr](https://datan.fr), dont il réutilise et complète le travail.

---

## Pourquoi ?

L'information existe déjà — elle est publique, sous licence ouverte — mais elle est **difficile d'accès pour le citoyen ordinaire**. Comprendre comment son ou sa député·e a voté sur un texte, ou mesurer l'écart entre un discours et un bulletin de vote, demande aujourd'hui une expertise et du temps.

Open Hémicycle a une promesse simple : **un citoyen tape le nom de son·sa député·e et comprend, en 3 secondes, ce qui s'y passe.**

## Ce que le projet fait (et ne fait pas)

| ✅ Ce qu'on fait | ❌ Ce qu'on ne fait pas |
|---|---|
| Visualiser les **votes** (individuels et par groupe), filtrables par texte et par parti | Mesurer la **présence physique en hémicycle** (cette donnée n'existe pas officiellement) |
| Mesurer une **activité parlementaire détectée** (votes, amendements, questions, interventions, commissions) | Publier des **scores moraux** ou des qualificatifs (« paresseux », « menteur »…) |
| Calculer un **indice de cohérence** factuel (écart entre positions affichées et votes) | Cibler **un seul camp** : la grille est identique pour tous les groupes |
| Croiser avec les déclarations **HATVP** (intérêts, lobbying) | Reproduire un **casier judiciaire** (hors périmètre) |
| Tout sourcer : **fait + date + lien vers le scrutin officiel** | Conclure à la place du lecteur |

> **Note importante sur la « présence ».** L'Assemblée nationale ne tient aucun relevé officiel de présence physique en séance, et la majorité des votes se font à main levée (donc absents de l'open data). Ce que nous affichons est une **activité parlementaire détectée**, jamais une « présence » au sens strict. Toute visualisation porte une légende explicite sur cette limite.

## Méthodologie défendable

Notre règle d'or : **on affiche des faits sourcés, jamais des jugements.** L'« indice de cohérence » met côte à côte deux faits vérifiables (une position affichée et un vote) et laisse le citoyen tirer ses propres conclusions. Voir [`docs/METHODOLOGY.md`](docs/METHODOLOGY.md) et [`docs/legal-guardrails.md`](docs/legal-guardrails.md).

## Sources de données

Source primaire : [data.assemblee-nationale.fr](https://data.assemblee-nationale.fr/) (Licence Ouverte Etalab 2.0). Compléments : NosDéputés.fr (ODbL), Datan, HATVP. Détail complet dans [`docs/data-sources.md`](docs/data-sources.md).

## État du projet

🚧 **Phase d'amorçage.** Le projet démarre. Voir [`ROADMAP.md`](ROADMAP.md) pour les jalons et [`tasks/`](tasks/) pour le backlog et le journal de bord.

## Stack (prévue)

`Next.js` · `PostgreSQL` (Supabase) · `Drizzle ORM` · `Tailwind` / `shadcn/ui` · `Recharts` + `react-activity-calendar` · ETL TypeScript. Déploiement `Vercel` + `Supabase`.

## Licences

- **Code** : [AGPL-3.0](LICENSE) — par cohérence avec l'écosystème civic tech français (NosDéputés, Tricoteuses).
- **Données dérivées** : Licence Ouverte / ODbL selon la source, avec attribution. Voir [`docs/data-sources.md`](docs/data-sources.md).

## Contribuer

Le projet est ouvert aux contributions. Voir [`CONTRIBUTING.md`](CONTRIBUTING.md). Une erreur dans les données ? Ouvrez une *issue* — le **droit de réponse et le signalement d'erreur** sont au cœur de la démarche.

---

*Ce projet est développé en grande partie par un agent autonome (voir [`AGENTS.md`](AGENTS.md)), sous supervision humaine. La transparence du processus fait partie de la transparence du produit.*
