/**
 * Classification d'un scrutin (live OpenRouter ou dry-run).
 */

import {
  resolveClassification,
  type ClassificationResult,
  type ScrutinClassificationInput,
} from "@open-hemicycle/core";
import { classifyWithOpenRouter } from "./openrouter.ts";
import { buildClassificationPrompt, CLASSIFICATION_MODEL_DEFAULT } from "./prompt-v1.ts";

export interface ClassifyScrutinOptions {
  model?: string;
  dryRun?: boolean;
}

export interface ClassifyScrutinOutput {
  input: ScrutinClassificationInput;
  result: ClassificationResult;
  model: string;
  promptVersion: string;
  dryRun: boolean;
}

export async function classifyScrutin(
  input: ScrutinClassificationInput,
  opts: ClassifyScrutinOptions = {},
): Promise<ClassifyScrutinOutput> {
  const dryRun = opts.dryRun ?? !process.env.OPENROUTER_API_KEY?.trim();
  const prompt = buildClassificationPrompt(input);
  const model = opts.model ?? CLASSIFICATION_MODEL_DEFAULT;

  if (dryRun) {
    return {
      input,
      dryRun: true,
      model,
      promptVersion: prompt.promptVersion,
      result: resolveClassification({ themeSlug: null, confidence: 0, justification: "dry-run" }),
    };
  }

  const llm = await classifyWithOpenRouter(
    [
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user },
    ],
    model,
  );

  if (!llm.ok) {
    return {
      input,
      dryRun: false,
      model: llm.model,
      promptVersion: prompt.promptVersion,
      result: resolveClassification({
        themeSlug: null,
        confidence: 0,
        justification: `erreur parsing : ${llm.error}`,
      }),
    };
  }

  return {
    input,
    dryRun: false,
    model: llm.model,
    promptVersion: prompt.promptVersion,
    result: resolveClassification(llm.parsed),
  };
}
