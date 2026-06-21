# Taxonomie des thèmes — méthode de sélection neutre

Document de référence pour la tâche backlog **4.7** et la section 5 de [`METHODOLOGY.md`](METHODOLOGY.md).

**Dernière mise à jour** : 2026-06-16.

---

## 1. Problème : choisir des thèmes est un acte éditorial

L'atlas thématique d'Open Hémicycle regroupe des scrutins par sujet. **La liste des thèmes n'est pas neutre par nature** : retenir « immigration » et pas « culture » revient à dire qu'un sujet mérite plus d'attention qu'un autre.

Les quatre thèmes pilotes (`budget-finances`, `securite-immigration`, `agriculture`, `defense`) ont été choisis pour valider la chaîne technique. Ils ne constituent **pas** une nomenclature exhaustive ni symétrique.

---

## 2. Principe retenu : ancrage institutionnel

La taxonomie cible est calquée sur les **8 commissions permanentes** de l'Assemblée nationale, telles que définies à l'**article 36 du Règlement** de l'Assemblée nationale.

| # | Thème (slug) | Commission permanente AN |
|---|--------------|--------------------------|
| 1 | `affaires-culturelles-education` | Affaires culturelles et de l'éducation |
| 2 | `affaires-economiques` | Affaires économiques |
| 3 | `affaires-etrangeres` | Affaires étrangères |
| 4 | `affaires-sociales` | Affaires sociales |
| 5 | `defense-forces-armees` | Défense nationale et des forces armées |
| 6 | `developpement-durable-amenagement-territoire` | Développement durable et de l'aménagement du territoire |
| 7 | `finances-controle-budgetaire` | Finances, de l'économie générale et du contrôle budgétaire |
| 8 | `lois-constitutionnelles-legislation` | Lois constitutionnelles, de la législation et de l'administration générale de la République |

**Source institutionnelle** : [Fiche de synthèse n°16 — Les commissions permanentes](https://www.assemblee-nationale.fr/dyn/synthese/organisation-assemblee-nationale/les-commissions-permanentes) (Assemblée nationale).

### Pourquoi c'est anti-biais

1. **Liste figée** : on ne choisit pas « les sujets qui font débat » mais les compétences parlementaires officielles, identiques pour toutes les législatures depuis la réforme de 2009 (passage de 6 à 8 commissions).
2. **Symétrie** : les 8 thèmes ont le même statut, le même ordre d'affichage (Règlement), aucun n'est mis en avant par défaut.
3. **Traçabilité** : chaque thème est lié à un organe `PO*` vérifiable dans les dumps AMO10 de `data.assemblee-nationale.fr`.
4. **Pas de jugement** : les libellés sont ceux de l'institution, pas des reformulations éditoriales.

### Limites assumées

- **Pas une taxonomie « politiques publiques »** : les commissions recoupent mal certains sujets transversaux (ex. immigration = lois + affaires sociales). Un dossier peut relever de plusieurs commissions ; la classification reste **conservatrice** (un seul thème principal, cf. §4).
- **Commission des affaires européennes** : organe permanent mais **non législatif** au sens strict ; non retenue dans la nomenclature v1 (8 commissions législatives). Extension possible si méthode publiée.
- **~80 % des scrutins sans dossier** : la taxonomie seule ne suffit pas ; la couche d'enrichissement LLM (tâche 4.8) complétera le rattachement.

---

## 3. Règles de rattachement dossier → thème

Inchangées par rapport au pilote, mais appliquées à la nouvelle nomenclature :

1. **Niveau dossier législatif** : un scrutin hérite du thème de son dossier (lien officiel AN).
2. **Classification conservatrice** : un dossier n'entre dans un thème que si son **titre officiel (verbatim AN)** concerne sans ambiguïté le cœur du thème. **En cas de doute, on n'inclut pas.**
3. **Commission saisie** : si le dossier indique une commission saisie (`PO*`), on peut l'utiliser comme **signal** (pas comme règle automatique) pour proposer un rattachement — toujours validé par titre officiel ou relecture.
4. **Source de vérité versionnée** : le mapping vit dans le dépôt (`packages/etl/src/data/themes.ts` puis migration vers slugs taxonomie) ; toute modification passe par une PR.
5. **Fallback « non classé »** : un scrutin sans rattachement vérifiable reste accessible via l'explorateur général, sans être forcé dans un thème.

---

## 4. Migration depuis les thèmes pilotes

| Slug pilote (déprécié) | Slug taxonomie cible |
|------------------------|----------------------|
| `budget-finances` | `finances-controle-budgetaire` |
| `securite-immigration` | `lois-constitutionnelles-legislation` |
| `agriculture` | `affaires-economiques` |
| `defense` | `defense-forces-armees` |

La migration des slugs en base et en URL (`/themes`, `/scrutins?theme=`) est **progressive** : les slugs pilotes restent redirigés vers les URLs canoniques taxonomie. La projection DB (`pnpm etl seed:themes`) utilise désormais les **slugs taxonomie** ; les lignes pilotes dépréciées sont détachées (sans suppression de la table `themes`).

Correspondance implémentée dans `packages/core/src/data/theme-taxonomie.ts` (`PILOT_TO_TAXONOMIE_SLUG`).

---

## 5. Vérification

```bash
pnpm etl validate:taxonomie   # structure + unicité + correspondance pilote
pnpm etl validate:themes      # fichier seed themes.ts aligné sur la taxonomie
pnpm test                     # tests vitest (packages/core)
```

Les UID `PO*` sont vérifiés contre le dump AMO10 (`pnpm etl download` puis extraction `json/organe/`, type `COMPER`).

---

## 6. Prochaines étapes (hors 4.7)

- **4.8** : classification LLM des scrutins sans dossier → thème taxonomie, sortie versionnée.
- **4.9** : page atlas `/themes/[slug]` avec positionnement par groupe.
- Ingestion des mandats commission (`PO*`) pour le périmètre « participation commission » (METHODOLOGY §3).
