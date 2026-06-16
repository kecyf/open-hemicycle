/**
 * Taxonomie neutre des thèmes — calquée sur les 8 commissions permanentes
 * de l'Assemblée nationale (article 36 du Règlement).
 *
 * La liste est **figée institutionnellement** : on ne choisit pas « les sujets
 * qui intéressent » mais les compétences parlementaires officielles. Voir
 * `docs/theme-taxonomy.md` pour la méthode de sélection anti-biais.
 *
 * Les UID `PO*` sont extraits du dump AMO10 (législature 17, juin 2026).
 * Source primaire : data.assemblee-nationale.fr.
 */

export interface ThemeTaxonomieEntry {
  /** Identifiant URL stable (kebab-case, sans accents). */
  slug: string;
  /** Libellé officiel (Règlement AN, art. 36). */
  nom: string;
  /** Description factuelle du périmètre (sans jugement). */
  description: string;
  /** UID AN de la commission permanente correspondante (PO*). */
  commissionUidAn: string;
  /** Libellé abrégé de la commission dans le dump AMO10 (traçabilité). */
  libelleCommissionAn: string;
  /** Ordre de présentation (Règlement AN, art. 36). */
  ordreReglement: number;
  /** Lien vers la fiche institutionnelle AN. */
  sourceUrl: string;
}

/** Les 8 commissions permanentes — nomenclature exhaustive et symétrique. */
export const THEMES_TAXONOMIE: readonly ThemeTaxonomieEntry[] = [
  {
    slug: "affaires-culturelles-education",
    nom: "Affaires culturelles et de l'éducation",
    description:
      "Politiques culturelles, enseignement, recherche, patrimoine et sports.",
    commissionUidAn: "PO419604",
    libelleCommissionAn: "Affaires culturelles et éducation",
    ordreReglement: 1,
    sourceUrl:
      "https://www.assemblee-nationale.fr/dyn/synthese/organisation-assemblee-nationale/les-commissions-permanentes",
  },
  {
    slug: "affaires-economiques",
    nom: "Affaires économiques",
    description:
      "Économie, industrie, numérique, agriculture, commerce et concurrence.",
    commissionUidAn: "PO419610",
    libelleCommissionAn: "Affaires économiques",
    ordreReglement: 2,
    sourceUrl:
      "https://www.assemblee-nationale.fr/dyn/synthese/organisation-assemblee-nationale/les-commissions-permanentes",
  },
  {
    slug: "affaires-etrangeres",
    nom: "Affaires étrangères",
    description:
      "Relations internationales, coopération, défense extérieure et affaires européennes bilatérales.",
    commissionUidAn: "PO59047",
    libelleCommissionAn: "Affaires étrangères",
    ordreReglement: 3,
    sourceUrl:
      "https://www.assemblee-nationale.fr/dyn/synthese/organisation-assemblee-nationale/les-commissions-permanentes",
  },
  {
    slug: "affaires-sociales",
    nom: "Affaires sociales",
    description:
      "Protection sociale, santé, travail, famille et solidarités.",
    commissionUidAn: "PO420120",
    libelleCommissionAn: "Affaires sociales",
    ordreReglement: 4,
    sourceUrl:
      "https://www.assemblee-nationale.fr/dyn/synthese/organisation-assemblee-nationale/les-commissions-permanentes",
  },
  {
    slug: "defense-forces-armees",
    nom: "Défense nationale et des forces armées",
    description:
      "Programmation militaire, équipements des forces armées et politique de défense.",
    commissionUidAn: "PO59046",
    libelleCommissionAn: "Défense",
    ordreReglement: 5,
    sourceUrl:
      "https://www.assemblee-nationale.fr/dyn/synthese/organisation-assemblee-nationale/les-commissions-permanentes",
  },
  {
    slug: "developpement-durable-amenagement-territoire",
    nom: "Développement durable et de l'aménagement du territoire",
    description:
      "Environnement, énergie, logement, transports et aménagement du territoire.",
    commissionUidAn: "PO419865",
    libelleCommissionAn: "Développement durable",
    ordreReglement: 6,
    sourceUrl:
      "https://www.assemblee-nationale.fr/dyn/synthese/organisation-assemblee-nationale/les-commissions-permanentes",
  },
  {
    slug: "finances-controle-budgetaire",
    nom: "Finances, de l'économie générale et du contrôle budgétaire",
    description:
      "Lois de finances, fiscalité, comptes publics et contrôle budgétaire.",
    commissionUidAn: "PO59048",
    libelleCommissionAn: "Finances",
    ordreReglement: 7,
    sourceUrl:
      "https://www.assemblee-nationale.fr/dyn/synthese/organisation-assemblee-nationale/les-commissions-permanentes",
  },
  {
    slug: "lois-constitutionnelles-legislation",
    nom: "Lois constitutionnelles, de la législation et de l'administration générale de la République",
    description:
      "Droit constitutionnel, institutions, justice, sécurité intérieure, immigration et administration.",
    commissionUidAn: "PO59051",
    libelleCommissionAn: "Lois",
    ordreReglement: 8,
    sourceUrl:
      "https://www.assemblee-nationale.fr/dyn/synthese/organisation-assemblee-nationale/les-commissions-permanentes",
  },
] as const;

export const THEME_SLUGS_TAXONOMIE = THEMES_TAXONOMIE.map((t) => t.slug) as [
  "affaires-culturelles-education",
  "affaires-economiques",
  "affaires-etrangeres",
  "affaires-sociales",
  "defense-forces-armees",
  "developpement-durable-amenagement-territoire",
  "finances-controle-budgetaire",
  "lois-constitutionnelles-legislation",
];

export type ThemeSlugTaxonomie = (typeof THEME_SLUGS_TAXONOMIE)[number];

export function isThemeSlugTaxonomie(slug: string): slug is ThemeSlugTaxonomie {
  return (THEME_SLUGS_TAXONOMIE as readonly string[]).includes(slug);
}

/** Correspondance pilote → taxonomie (migration progressive des slugs URL). */
export const PILOT_TO_TAXONOMIE_SLUG = {
  "budget-finances": "finances-controle-budgetaire",
  "securite-immigration": "lois-constitutionnelles-legislation",
  agriculture: "affaires-economiques",
  defense: "defense-forces-armees",
} as const satisfies Record<string, ThemeSlugTaxonomie>;

export function getThemeTaxonomieBySlug(
  slug: string,
): ThemeTaxonomieEntry | undefined {
  return THEMES_TAXONOMIE.find((t) => t.slug === slug);
}

export function getThemeTaxonomieByCommissionUid(
  commissionUidAn: string,
): ThemeTaxonomieEntry | undefined {
  return THEMES_TAXONOMIE.find((t) => t.commissionUidAn === commissionUidAn);
}
