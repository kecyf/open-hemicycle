# Vision — Open Hémicycle

## La phrase

> **Voir ce que votre député·e fait vraiment, pas ce qu'il·elle dit.**

Un observatoire citoyen, ouvert et symétrique, qui met en regard les **déclarations** et les **actes** de chaque élu·e — fait par fait, source par source — et rend cette lecture accessible à n'importe qui en quelques secondes.

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
  Exploration grand public + lecture instantanée de la cohérence.
  Personne ne l'occupe vraiment : ni outil grand public fluide,
  ni détection systématique et factuelle de l'écart discours/vote.
```

Notre valeur n'est **pas** d'avoir plus de données (on en aura moins au début), c'est de rendre **lisible en 3 secondes** ce qui demande aujourd'hui de l'expertise. On crédite explicitement les sources amont (l'ODbL nous y oblige, et c'est sain).

## L'angle distinctif : la cohérence (« l'hypocrisie, mesurée »)

L'intuition fondatrice : *si un parti comporte des élus dont les actes contredisent clairement le discours, cela doit se savoir publiquement et facilement.*

L'« hypocrisie » est un **jugement moral** → terrain de la diffamation. Mais elle se **décompose en faits mesurables** : un écart entre un *dire* et un *faire*, tous deux documentés.

| Ce qu'on mesure (factuel) | Donnée | Ce qu'on n'écrit JAMAIS |
|---|---|---|
| Écart vote / ligne affichée du groupe | scrutins + appartenance groupe | « traître » |
| Écart promesse-déclaration / vote | déclaration publique + scrutin | « menteur » |
| Absence aux votes sur un thème revendiqué | participation + thème | « hypocrite » |
| Conflit d'intérêts vs vote | HATVP + scrutin | « corrompu » |

**Règle d'or** : fait + source + date + lien vers le scrutin officiel. Le lecteur conclut lui-même. C'est plus inattaquable *et* plus percutant (cf. TheyWorkForYou au UK : *« X consistently voted against Y »*, 100 % factuel, jamais condamné).

## Les principes non négociables

1. **Symétrie totale** — tous les député·es, tous les partis, même grille. Un outil qui ne tape que dans un camp est une arme partisane, pas un bien public.
2. **Contexte systématique** — un vote manquant peut être une délégation, une maladie, une mission ; un·e ministre vote peu par nature. Le contexte désamorce les faux procès.
3. **Méthodologie publique et cliquable** — chaque indicateur a sa page « comment c'est calculé ».
4. **Droit de réponse / signalement** — un bouton « contester cette donnée ». La bonne foi se prouve.
5. **Aucun adjectif moral** — jamais. C'est la ligne rouge juridique et éthique.

## À quoi ressemble le succès (dans ~1 mois)

Un **POC fonctionnel, public et hébergé** qui permet, sur la 17e législature :

- de chercher un·e député·e et de voir sa **heatmap d'activité** + son détail de votes ;
- d'explorer un **texte de loi** et de voir qui a voté quoi, par groupe ;
- d'afficher un **premier indice de cohérence** factuel et sourcé sur au moins un thème ;
- le tout avec une **méthodologie publiée** et des **garde-fous juridiques** documentés.

Le livrable narratif visé : pouvoir présenter une **observation data-driven, sourcée et défendable** du type *« sur le thème X, les élu·es du groupe Y affichent un écart de cohérence mesurable entre leurs positions publiques et leurs votes »* — sans un seul adjectif moral, juste des faits et des liens.

## Hors périmètre (pour l'instant)

- Casier judiciaire / condamnations (couvert ailleurs, autre risque).
- Sénat (réutilisable plus tard, même pipeline).
- Activité en circonscription (non documentée).
- Présence physique « réelle » (donnée inexistante).
