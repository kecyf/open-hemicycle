/**
 * Commande CLI : validation enrichissement LLM + benchmark offline (sans DB).
 */

import {
  CLASSIFICATION_GOLD_SAMPLE,
  computeClassificationMetrics,
  validateClassificationGoldSample,
  validateClassificationPredictions,
} from "@open-hemicycle/core";
import { CLASSIFICATION_BENCHMARK_PREDICTIONS } from "../enrichissement/benchmark-predictions.ts";
import { getPromptMetadata } from "../enrichissement/prompt-v1.ts";

const MIN_BENCHMARK_ACCURACY = 0.8;

export function validateEnrichissement(): void {
  const meta = getPromptMetadata();
  console.log(
    `\n[validate:enrichissement] prompt=${meta.promptVersion} modèle=${meta.modelDefault} thèmes=${meta.themeCount}\n`,
  );

  const goldIssues = validateClassificationGoldSample();
  if (goldIssues.length) {
    console.error(`[validate:enrichissement] ${goldIssues.length} problème(s) échantillon-or :\n`);
    for (const i of goldIssues) {
      console.error(`  • ${i.path}: ${i.message}`);
    }
    console.error("");
    process.exit(1);
  }
  console.log(`[validate:enrichissement] échantillon-or OK (${CLASSIFICATION_GOLD_SAMPLE.length} entrées)`);

  const predIssues = validateClassificationPredictions([...CLASSIFICATION_BENCHMARK_PREDICTIONS]);
  if (predIssues.length) {
    console.error(`[validate:enrichissement] ${predIssues.length} problème(s) prédictions benchmark :\n`);
    for (const i of predIssues) {
      console.error(`  • ${i.path}: ${i.message}`);
    }
    console.error("");
    process.exit(1);
  }

  const metrics = computeClassificationMetrics(
    [...CLASSIFICATION_BENCHMARK_PREDICTIONS],
    CLASSIFICATION_GOLD_SAMPLE,
  );
  console.log(
    `[validate:enrichissement] benchmark offline — accuracy=${(metrics.accuracy * 100).toFixed(1)}% ` +
      `précision(classé)=${metrics.precisionWhenClassified !== null ? (metrics.precisionWhenClassified * 100).toFixed(1) + "%" : "n/a"} ` +
      `rappel=${metrics.recallWhenExpectedClassified !== null ? (metrics.recallWhenExpectedClassified * 100).toFixed(1) + "%" : "n/a"} ` +
      `(FP=${metrics.falsePositives} FN=${metrics.falseNegatives} wrong=${metrics.wrongTheme})`,
  );

  if (metrics.accuracy < MIN_BENCHMARK_ACCURACY) {
    console.error(
      `\n[validate:enrichissement] accuracy ${(metrics.accuracy * 100).toFixed(1)}% < seuil ${MIN_BENCHMARK_ACCURACY * 100}%\n`,
    );
    process.exit(1);
  }

  console.log("\n[validate:enrichissement] OK\n");
}
