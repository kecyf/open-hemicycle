/**
 * Résolution du thème effectif d'un scrutin — dossier législatif prioritaire sur LLM.
 *
 * Logique pure pour la future lecture atlas (4.8) : testable sans base.
 */

import { CONFIDENCE_THRESHOLD } from "./classification-scrutin.ts";
import {
  isThemeSlugTaxonomie,
  type ThemeSlugTaxonomie,
} from "./data/theme-taxonomie.ts";
import { resolveThemeSlugForDb } from "./theme-slug-resolution.ts";

export interface EffectiveThemeResolutionInput {
  /** Thème issu du rattachement dossier (slug pilote ou taxonomie). */
  dossierThemeSlug: string | null;
  /** Thème proposé par la classification LLM. */
  llmThemeSlug: string | null;
  /** Confiance LLM [0, 1] — ignorée si un dossier est rattaché. */
  llmConfidence?: number;
}

/**
 * Règle : rattachement dossier > classification LLM (si confiance suffisante).
 * Retourne un slug taxonomie ou `null`.
 */
export function resolveEffectiveThemeSlug(
  input: EffectiveThemeResolutionInput,
  threshold = CONFIDENCE_THRESHOLD,
): ThemeSlugTaxonomie | null {
  if (input.dossierThemeSlug) {
    const resolved = resolveThemeSlugForDb(input.dossierThemeSlug);
    return isThemeSlugTaxonomie(resolved) ? resolved : null;
  }

  const confidence = input.llmConfidence ?? 0;
  if (
    input.llmThemeSlug &&
    isThemeSlugTaxonomie(input.llmThemeSlug) &&
    confidence >= threshold
  ) {
    return input.llmThemeSlug;
  }

  return null;
}
