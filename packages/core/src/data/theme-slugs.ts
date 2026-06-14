/**
 * Slugs des thèmes pilotes — miroir de `packages/etl/src/data/themes.ts`.
 * Toute modification de la classification thématique doit mettre à jour les deux fichiers.
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
