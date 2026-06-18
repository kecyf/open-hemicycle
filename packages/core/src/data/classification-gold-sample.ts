/**
 * Échantillon-or pour mesurer la précision de la classification LLM (4.8).
 *
 * Annotations manuelles sur titres officiels AN (verbatim ou paraphrase fidèle).
 * `expectedThemeSlug = null` = le scrutin doit rester « non classé » (ambigu ou hors périmètre).
 */

import type { GoldSampleEntry } from "../classification-scrutin.ts";

export const CLASSIFICATION_GOLD_SAMPLE: readonly GoldSampleEntry[] = [
  {
    uidAn: "VTANR5L17V001-GOLD01",
    titre:
      "Projet de loi relative aux résultats de la gestion et portant approbation des comptes de l'année 2025",
    expectedThemeSlug: "finances-controle-budgetaire",
    annotationNote: "Loi de règlement / comptes publics — commission Finances (DLR5L17N54196).",
  },
  {
    uidAn: "VTANR5L17V001-GOLD02",
    titre:
      "Projet de loi portant approbation des comptes de la sécurité sociale de l'année 2025",
    expectedThemeSlug: "finances-controle-budgetaire",
    annotationNote: "Comptes sécurité sociale — périmètre finances publiques (DLR5L17N54373).",
  },
  {
    uidAn: "VTANR5L17V001-GOLD03",
    titre:
      "Projet de loi actualisant la programmation militaire pour les années 2024 à 2030 et portant diverses dispositions intéressant la défense",
    expectedThemeSlug: "defense-forces-armees",
    annotationNote: "LPM — commission Défense (DLR5L17N54083).",
  },
  {
    uidAn: "VTANR5L17V001-GOLD04",
    titre: "Projet de loi d'urgence pour la protection et la souveraineté agricoles",
    expectedThemeSlug: "affaires-economiques",
    annotationNote:
      "Agriculture rattachée à la commission Affaires économiques (art. 36) — DLR5L17N54085.",
  },
  {
    uidAn: "VTANR5L17V001-GOLD05",
    titre:
      "Renforcer la sécurité, la rétention administrative et la prévention des risques d'attentat",
    expectedThemeSlug: "lois-constitutionnelles-legislation",
    annotationNote:
      "Sécurité intérieure / immigration — commission Lois (DLR5L17N53284, pilote sécurité-immigration).",
  },
  {
    uidAn: "VTANR5L17V001-GOLD06",
    titre: "Projet de loi relatif à la lutte contre les fraudes sociales et fiscales",
    expectedThemeSlug: "finances-controle-budgetaire",
    annotationNote: "Fiscalité / fraude — commission Finances (DLR5L17N52985).",
  },
  {
    uidAn: "VTANR5L17V001-GOLD07",
    titre:
      "Proposition de loi visant à instaurer une retraite à 60 ans pour les carrières longues",
    expectedThemeSlug: "affaires-sociales",
    annotationNote: "Protection sociale / retraites — commission Affaires sociales.",
  },
  {
    uidAn: "VTANR5L17V001-GOLD08",
    titre:
      "Projet de loi portant transposition de la directive européenne relative à la protection de l'environnement par le droit pénal",
    expectedThemeSlug: "developpement-durable-amenagement-territoire",
    annotationNote: "Environnement — commission Développement durable.",
  },
  {
    uidAn: "VTANR5L17V001-GOLD09",
    titre: "Projet de loi autorisant l'approbation de l'accord de coopération culturelle entre la France et le Japon",
    expectedThemeSlug: "affaires-culturelles-education",
    annotationNote: "Coopération culturelle — commission Affaires culturelles.",
  },
  {
    uidAn: "VTANR5L17V001-GOLD10",
    titre:
      "Projet de loi autorisant l'approbation de l'accord entre le Gouvernement de la République française et le Gouvernement de la République fédérale d'Allemagne relatif à la coopération en matière de défense",
    expectedThemeSlug: "affaires-etrangeres",
    annotationNote: "Accord international bilatéral — commission Affaires étrangères.",
  },
  {
    uidAn: "VTANR5L17V001-GOLD11",
    titre: "Projet de loi organique relatif à la nomination du Premier ministre",
    expectedThemeSlug: "lois-constitutionnelles-legislation",
    annotationNote: "Droit constitutionnel / institutions — commission Lois.",
  },
  {
    uidAn: "VTANR5L17V001-GOLD12",
    titre: "Motion de censure déposée en application de l'article 49, alinéa 3, de la Constitution",
    expectedThemeSlug: null,
    annotationNote:
      "Procédure institutionnelle transversale — pas de thème commission sans deviner ; rester non classé.",
  },
  {
    uidAn: "VTANR5L17V001-GOLD13",
    titre: "Projet de loi de finances rectificative pour 2025 (première partie)",
    expectedThemeSlug: "finances-controle-budgetaire",
    annotationNote: "PLFR — commission Finances.",
  },
  {
    uidAn: "VTANR5L17V001-GOLD14",
    titre: "Proposition de résolution européenne sur la politique commerciale de l'Union",
    expectedThemeSlug: null,
    annotationNote:
      "Résolution européenne générique — périmètre ambigu entre économie et affaires étrangères ; non classé par prudence.",
  },
  {
    uidAn: "VTANR5L17V001-GOLD15",
    titre: "Projet de loi portant diverses dispositions d'adaptation au droit de l'Union européenne en matière économique, financière, environnementale et de transport",
    expectedThemeSlug: null,
    annotationNote:
      "Texte fourre-tout « ordonnances DUE » — plusieurs commissions ; non classé (cf. règle conservatrice METHODOLOGY).",
  },
] as const;
