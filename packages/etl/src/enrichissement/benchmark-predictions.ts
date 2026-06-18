/**
 * Prédictions de référence pour benchmark offline (sans appel LLM).
 *
 * Simule un modèle à ~87 % d'accuracy sur l'échantillon-or — suffisant pour
 * valider la chaîne de métriques avant branchement OpenRouter live.
 */

import type { ClassificationPrediction } from "@open-hemicycle/core";

export const CLASSIFICATION_BENCHMARK_PREDICTIONS: readonly ClassificationPrediction[] =
  [
    { uidAn: "VTANR5L17V001-GOLD01", themeSlug: "finances-controle-budgetaire" },
    { uidAn: "VTANR5L17V001-GOLD02", themeSlug: "finances-controle-budgetaire" },
    { uidAn: "VTANR5L17V001-GOLD03", themeSlug: "defense-forces-armees" },
    { uidAn: "VTANR5L17V001-GOLD04", themeSlug: "affaires-economiques" },
    { uidAn: "VTANR5L17V001-GOLD05", themeSlug: "lois-constitutionnelles-legislation" },
    { uidAn: "VTANR5L17V001-GOLD06", themeSlug: "finances-controle-budgetaire" },
    { uidAn: "VTANR5L17V001-GOLD07", themeSlug: "affaires-sociales" },
    { uidAn: "VTANR5L17V001-GOLD08", themeSlug: "developpement-durable-amenagement-territoire" },
    { uidAn: "VTANR5L17V001-GOLD09", themeSlug: "affaires-culturelles-education" },
    { uidAn: "VTANR5L17V001-GOLD10", themeSlug: "affaires-etrangeres" },
    { uidAn: "VTANR5L17V001-GOLD11", themeSlug: "lois-constitutionnelles-legislation" },
    // Faux positif volontaire (motion de censure)
    { uidAn: "VTANR5L17V001-GOLD12", themeSlug: "lois-constitutionnelles-legislation" },
    { uidAn: "VTANR5L17V001-GOLD13", themeSlug: "finances-controle-budgetaire" },
    // Faux positif volontaire (résolution UE ambiguë)
    { uidAn: "VTANR5L17V001-GOLD14", themeSlug: "affaires-economiques" },
    { uidAn: "VTANR5L17V001-GOLD15", themeSlug: null },
  ] as const;
