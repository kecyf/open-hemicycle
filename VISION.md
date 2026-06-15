# Vision — Open Hémicycle

## La phrase

> **Voir ce que votre député·e fait vraiment, pas ce qu'il·elle dit.**

Un observatoire citoyen, ouvert et symétrique, qui rend lisible en quelques secondes **comment chaque groupe et chaque élu·e se positionne sur les grands sujets de société** — fait par fait, source par source.

**Le produit, concrètement** : un **atlas des positionnements par thème**. On entre par un grand sujet (immigration, écologie, budget, santé…), on voit comment chaque groupe a voté, c'est sourcé, symétrique, et chaque chiffre se déplie en scrutins cliquables. Objectif : qu'un citoyen *constate par lui-même* un positionnement au lieu de le croire sur parole — un antidote factuel aux affirmations invérifiables.

## Le problème

La donnée parlementaire française est **publique, ouverte, et à jour** (data.assemblee-nationale.fr, 17e législature). Mais elle est **illisible pour le citoyen ordinaire** :

- Les votes sont publiés en dumps XML/JSON bruts, par scrutin, avec des identifiants techniques.
- Comprendre la position d'un·e député·e sur un *thème* (et non un scrutin isolé) demande d'agréger des dizaines de votes.
- L'écart entre un discours public et un comportement de vote n'est nulle part mis en évidence simplement.

Résultat : l'information de contrôle démocratique existe, mais reste l'apanage de journalistes spécialisés et de chercheurs. **Le citoyen qui veut savoir ce que fait « son » député n'a pas d'outil grand public fluide.**

## Le positionnement (et pourquoi ce n'est pas « concurrentiel »)

Tout cet écosystème vit sous **licences ouvertes** dont la philosophie *est* la réutilisation. On ne « bat » personne, on **complète** une chaîne d'utilité publique :

```
ÉTAGE 1 — LA DONNÉE BRUTE
  NosDéputés.fr (Regards Citoyens) — observatoire historique, API, AGPL.
  Refuse les palmarès. UX de 2012.
  → "la bibliothèque". On s'appuie dessus, on ne le refait pas.

ÉTAGE 2 — L'ANALYSE ÉDITORIALE
  Datan.fr — décrypte les scrutins, scores (loyauté, participation),
  comité scientifique. GPL. Ponctuel/éditorial.
  → "le média analytique".

ÉTAGE 3 — OPEN HÉMICYCLE  ← notre place
  Exploration grand public par thème + structuration sémantique
  de la donnée brute. Personne ne l'occupe vraiment : ni outil
  grand public fluide, ni rattachement systématique des scrutins
  aux grands sujets de société.
```

Notre valeur tient en deux couches : (1) rendre **lisible en 3 secondes** ce qui demande aujourd'hui de l'expertise ; (2) une **couche d'enrichissement** qui structure la donnée brute là où les sources officielles s'arrêtent — typiquement, rattacher les ~80 % de scrutins sans dossier législatif à un thème lisible. C'est ce travail de structuration, autant que l'interface, qui fait la différence. On crédite explicitement les sources amont (l'ODbL nous y oblige, et c'est sain).

## L'angle distinctif : structurer la donnée pour la rendre parlante

Notre différenciation se construit en deux temps, du plus immédiat au plus ambitieux.

### 1. L'atlas thématique (le produit qui fait parler la donnée — maintenant)

La donnée brute existe mais elle est muette : 7 400 scrutins isolés, dont ~80 % sans rattachement à un sujet lisible. La rendre parlante, ce n'est **pas** calculer un verdict à la place du citoyen — c'est **agréger par thème, afficher symétriquement, et sourcer**. Une phrase factuelle + une barre par groupe + les scrutins cliquables suffisent à faire *constater* un positionnement en un coup d'œil. C'est notre réponse aux affirmations invérifiables : la preuve sourcée en un clic.

### 2. La cohérence dire/faire (l'ambition de fond — plus tard, sous conditions)

L'intuition fondatrice : *si des élus ont des actes qui contredisent clairement leur discours, cela doit pouvoir se constater publiquement et facilement.* L'« hypocrisie » est un **jugement moral** → terrain de la diffamation. Mais elle se **décompose en faits mesurables** : un écart entre un *dire* et un *faire*, tous deux documentés.

| Ce qu'on mesure (factuel) | Donnée | Ce qu'on n'écrit JAMAIS |
|---|---|---|
| Écart vote / ligne affichée du groupe | scrutins + appartenance groupe | « traître » |
| Écart promesse-déclaration / vote | déclaration publique + scrutin | « menteur » |
| Absence aux votes sur un thème revendiqué | participation + thème | « hypocrite » |
| Conflit d'intérêts vs vote | HATVP + scrutin | « corrompu » |

**Règle d'or** : fait + source + date + lien vers le scrutin officiel. Le lecteur conclut lui-même. C'est plus inattaquable *et* plus percutant (cf. TheyWorkForYou au UK : *« X consistently voted against Y »*, 100 % factuel, jamais condamné).

Cette couche exige un corpus de « positions affichées » qu'on n'a pas encore, et une relecture juridique. Elle viendra **thème par thème, après l'atlas**.

### Ce qu'on ne fera jamais : le « score »

Pas de **note unique** de confiance, d'honnêteté ou de moralité par élu·e. Un chiffre agrégé écrase le contexte (délégation, période de mandat, abstention ≠ opposition), invite au classement « top des pires », et serait le format rêvé pour *fabriquer* des fake news plutôt que les réduire. On affiche des **faits par thème**, jamais un palmarès moral (cf. `docs/METHODOLOGY.md` §4 et §7).

## La couche d'enrichissement (notre actif technique)

Pour structurer ce que le scrap officiel laisse brut, on s'autorise des outils d'aide à la classification (y compris des modèles de langage), **strictement encadrés** :

- **Classer, jamais juger.** Le modèle range des faits publics (un scrutin relève-t-il du thème X ?). Il ne produit aucun énoncé sur une personne, aucun résumé d'opinion, aucune inférence de position individuelle.
- **Sortie figée et auditable.** La classification est produite une fois, **versionnée en base** (thème + score de confiance + modèle + date + version du prompt), puis lue par le site comme une donnée — jamais un appel à chaud. Modèle, prompt et température sont documentés : la classification est **rejouable**.
- **Le doute exclut.** En dessous d'un seuil de confiance → « non classé » plutôt qu'une étiquette hasardeuse. Précision mesurée sur un échantillon annoté à la main, et publiée.
- **Humain dans la boucle** sur les cas limites + droit de signalement.

Voir `docs/METHODOLOGY.md` pour le détail méthodologique.

## Les principes non négociables

1. **Symétrie totale** — tous les député·es, tous les partis, même grille. Un outil qui ne tape que dans un camp est une arme partisane, pas un bien public.
2. **Contexte systématique** — un vote manquant peut être une délégation, une maladie, une mission ; un·e ministre vote peu par nature. Le contexte désamorce les faux procès.
3. **Méthodologie publique et cliquable** — chaque indicateur a sa page « comment c'est calculé ».
4. **Droit de réponse / signalement** — un bouton « contester cette donnée ». La bonne foi se prouve.
5. **Aucun adjectif moral** — jamais. C'est la ligne rouge juridique et éthique.

## À quoi ressemble le succès (dans ~1 mois)

Un **POC fonctionnel, public et hébergé** qui permet, sur la 17e législature :

- d'explorer un **grand sujet de société** et de voir, en un coup d'œil, **comment chaque groupe s'est positionné** (sourcé, symétrique, scrutins cliquables) — le cœur de l'atlas ;
- de chercher un·e député·e et de voir son **activité** + son détail de votes ;
- d'explorer un **scrutin / texte de loi** et de voir qui a voté quoi, par groupe ;
- le tout avec une **méthodologie publiée** (y compris la couche d'enrichissement) et des **garde-fous juridiques** documentés.

Le livrable narratif visé : pouvoir présenter une **observation data-driven, sourcée et défendable** du type *« sur le thème X, le groupe Y a voté pour à N %, le groupe Z contre à M % — voici les scrutins »* — sans un seul adjectif moral, juste des faits et des liens. La cohérence dire/faire nominative viendra ensuite, thème par thème, sous relecture.

## Hors périmètre (pour l'instant)

- Casier judiciaire / condamnations (couvert ailleurs, autre risque).
- Sénat (réutilisable plus tard, même pipeline).
- Activité en circonscription (non documentée).
- Présence physique « réelle » (donnée inexistante).
