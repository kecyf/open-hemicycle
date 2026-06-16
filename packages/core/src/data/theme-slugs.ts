/**
 * Slugs des thèmes pilotes — miroir de `packages/etl/src/data/themes.ts`.
 * Toute modification de la classification thématique doit mettre à jour les deux fichiers.
 *
 * @deprecated Migration vers `THEME_SLUGS_TAXONOMIE` (8 commissions permanentes AN).
 * Voir `docs/theme-taxonomy.md` et `PILOT_TO_TAXONOMIE_SLUG`.
 */
export const THEME_SLUGS_PILOTE = [
  "budget-finances",
  "securite-immigration",
  "agriculture",
  "defense",
] as const;

export type ThemeSlugPilote = (typeof THEME_SLUGS_PILOTE)[number];

export function isThemeSlugPilote(slug: string): slug is ThemeSlugPilote {
  return (THEME_SLUGS_PILOTE as readonly string[]).includes(slug);
}
