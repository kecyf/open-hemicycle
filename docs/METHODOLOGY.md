# Méthodologie

Ce document définit **comment** Open Hémicycle calcule ce qu'il affiche. Il est public et destiné à être cliquable depuis chaque indicateur du site. Une méthodologie opaque transforme un observatoire en tract ; la nôtre est ouverte et critiquable.

> **Statut** : v0 (amorçage). Les formules ci-dessous sont des propositions de travail, à valider sur données réelles et à confronter aux méthodes existantes (Datan, NosDéputés) avant publication.

---

## 1. Principes de calcul

1. **Tout indicateur est reproductible** à partir des données sources publiques + du code de ce dépôt.
2. **Aucun indicateur n'est un jugement.** On mesure des écarts, des fréquences, des participations — jamais une « qualité » ou une « moralité ».
3. **Tout indicateur affiche son périmètre** (quels scrutins, quelle période, quelles exclusions) et son **incertitude**.
4. **Le contexte est une donnée de premier rang**, pas une note de bas de page (ministre, délégation de vote, entrée tardive en mandat, etc.).

---

## 2. Activité parlementaire détectée (heatmap)

### Ce que c'est

Une agrégation **par jour et par député·e** des actes parlementaires *détectables* dans l'open data. **Ce n'est pas une présence.**

### Sources d'activité

| Acte | Source | Poids (proposé, v0) |
|---|---|---|
| Participation à un scrutin public | dataset Scrutins | 1 |
| Dépôt / cosignature d'amendement | dataset Amendements | 2 |
| Question écrite / orale | datasets Questions | 1 |
| Intervention en séance (orateur) | CR Syceron | 3 |
| Présence enregistrée en commission | CR commission / Réunions | 2 |

### Score journalier

```
score_jour = 1·(nb_votes) + 2·(nb_amendements) + 1·(nb_questions)
           + 3·(nb_interventions) + 2·(nb_presences_commission)
```

### Niveau (couleur de la case, style GitHub)

Seuils par quantiles recalculés sur la population (pas de seuils arbitraires figés), niveaux 0–4.

### Limites affichées obligatoirement

- Les votes à main levée (majorité des votes) ne sont pas dans l'open data → sous-comptage du « vote ».
- Les ministres, les président·es de commission, les membres du Bureau ont des profils d'activité atypiques → toujours signalé.
- L'absence de case ≠ absence de travail (circonscription, réunions de groupe non documentées).

---

## 3. Participation aux votes

Trois taux distincts, **affichés ensemble** (jamais un seul isolé — c'est l'erreur qui a valu à d'autres des polémiques) :

1. **Scrutins solennels** — votes les plus visibles et programmés (taux typiquement élevé).
2. **Scrutins liés à la commission** du·de la député·e.
3. **Tous les scrutins publics** en séance (taux typiquement bas, et c'est normal : agendas simultanés).

Pour chaque taux : `nb_votes_exprimés / nb_scrutins_du_périmètre`, avec distinction explicite **pour / contre / abstention / non-votant**. Un non-vote n'est **jamais** assimilé à une opposition.

---

## 4. Indice de cohérence (cœur du projet)

### Définition factuelle

L'indice de cohérence mesure l'**écart entre des positions affichées et des votes effectifs**, sur un **thème** donné. Il ne mesure pas l'honnêteté ; il mesure une **distance entre un dire et un faire**, tous deux sourcés.

### Composantes (v0, à raffiner)

#### a) Cohérence avec la ligne de groupe
```
sur les scrutins du thème T :
  taux_alignement = nb_votes_alignés_sur_position_majoritaire_du_groupe / nb_votes_exprimés
```
Factuel, déjà calculé par Datan (« loyauté »). On le réutilise/recalcule pour cross-check.

#### b) Cohérence position publique ↔ vote
La composante distinctive. Nécessite une **source de positions affichées** structurée :
- déclarations en séance (CR Syceron),
- communiqués / programmes (sourcés, datés),
- prises de position publiques vérifiables.

```
pour chaque couple (position_publique_p, scrutin_s) du même thème T :
  écart = 1 si direction(vote_s) ≠ direction(position_p), sinon 0
indice_incohérence_T = moyenne(écart) pondérée par la proximité thématique
```

> ⚠️ **Point dur à résoudre** : rattacher une position publique à un scrutin précis, et qualifier la « direction » d'une position, est délicat et potentiellement contestable. Cette composante ne sera publiée **qu'après** validation manuelle d'un échantillon et mise en place du droit de réponse. Tant qu'elle n'est pas robuste, on s'en tient à (a) et (c).

#### c) Cohérence présence/revendication thématique
```
sur les scrutins d'un thème T que le·la député·e revendique publiquement :
  taux_participation_T comparé à son taux_participation_global
```
Un écart négatif marqué (très présent en général, absent précisément sur son thème de prédilection) est un **fait** affichable, sans qualificatif.

### Règles de publication de l'indice de cohérence

- **Jamais** d'agrégat en un seul chiffre « note d'honnêteté » mis en avant en page d'accueil.
- **Toujours** au niveau d'un thème, avec le détail des scrutins cliquables.
- **Toujours** avec le contexte (mandat, fonction, délégations).
- **Toujours** avec un lien « contester / signaler une erreur ».
- Affichage **symétrique** : la même grille pour tous les groupes, sans tri par défaut « top des incohérents ».

---

## 5. Thèmes

Les scrutins sont rattachés à des **thèmes** pour permettre de suivre un sujet de bout en bout.

### Implémentation actuelle (pilote)

- **Rattachement au niveau du dossier législatif** : un scrutin hérite du thème de son dossier, via le lien officiel scrutin → dossier publié par l'Assemblée nationale. Tables `themes` et `dossiers_themes`.
- **Classification manuelle et conservatrice** : un dossier n'entre dans un thème que si son **titre officiel (verbatim AN)** concerne sans ambiguïté le cœur du thème. **En cas de doute, on n'inclut pas.** Un dossier peut n'appartenir à aucun thème.
- **Source de vérité versionnée et auditable** : le mapping complet (thème → dossiers, avec leur titre officiel justifiant le rattachement) vit dans `packages/etl/src/data/themes.ts` ; toute modification passe par une PR. La base n'est qu'une projection de ce fichier (`pnpm --filter @open-hemicycle/etl seed:themes`).
- **Phase pilote** : deux thèmes — `budget-finances` (« Budget & finances publiques ») et `securite-immigration` (« Sécurité & immigration »). La liste s'étoffera progressivement.
- Un thème est un **regroupement neutre**, jamais un jugement ; le périmètre est restreint, symétrique et public.

### Méthodes futures envisagées (par ordre de préférence)
1. Métadonnées thématiques des dossiers législatifs (quand exploitables).
2. Classification assistée (mots-clés / modèle), **avec relecture humaine** et thème toujours rattaché à une source.
3. Jamais de thème « deviné » sans trace vérifiable.

---

## 6. Gestion de l'incertitude et des erreurs

- Chaque indicateur affiche `n` (taille d'échantillon) et sa période.
- Les données AN peuvent contenir des erreurs / archives invalides : un **statut des données** est publié.
- Toute correction signalée et vérifiée est tracée publiquement (journal de corrections).

---

## 7. Ce qu'on ne calculera pas

- Un « classement des pires députés ».
- Un score de moralité, d'intelligence, de mérite.
- Toute métrique qui assimile absence = opposition, ou activité = qualité.
