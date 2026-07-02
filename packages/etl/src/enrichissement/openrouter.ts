/**
 * Client OpenRouter pour la classification LLM (4.8).
 *
 * Nécessite OPENROUTER_API_KEY. Sans clé → erreur explicite (pas d'appel silencieux).
 */

import {
  parseLlmClassificationResponse,
  type LlmClassificationRaw,
  type ParseClassificationError,
} from "@open-hemicycle/core";
import { isRetryableHttpStatus, withRetry } from "../lib/retry.ts";
import { CLASSIFICATION_MODEL_DEFAULT } from "./prompt-v1.ts";

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterCompletionRequest {
  model?: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  responseFormat?: { type: "json_object" };
}

export interface OpenRouterCompletionResult {
  content: string;
  model: string;
  raw: unknown;
}

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "OPENROUTER_API_KEY absent — fournir la clé (secret superviseur) pour classifier en live",
    );
  }
  return key;
}

export class OpenRouterHttpError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
  ) {
    super(`OpenRouter HTTP ${status}: ${body.slice(0, 500)}`);
    this.name = "OpenRouterHttpError";
  }
}

export async function callOpenRouter(
  request: OpenRouterCompletionRequest,
): Promise<OpenRouterCompletionResult> {
  const apiKey = getApiKey();
  const model = request.model ?? CLASSIFICATION_MODEL_DEFAULT;

  return withRetry(
    async () => {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://open-hemicycle.vercel.app",
          "X-Title": "Open Hémicycle ETL",
        },
        body: JSON.stringify({
          model,
          messages: request.messages,
          temperature: request.temperature ?? 0,
          response_format: request.responseFormat ?? { type: "json_object" },
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new OpenRouterHttpError(res.status, body);
      }

      const raw = (await res.json()) as {
        model?: string;
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = raw.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("OpenRouter : réponse vide");
      }

      return {
        content,
        model: raw.model ?? model,
        raw,
      };
    },
    {
      isRetryable: (error) =>
        error instanceof OpenRouterHttpError && isRetryableHttpStatus(error.status),
      onRetry: (attempt, error) => {
        const status =
          error instanceof OpenRouterHttpError ? error.status : "erreur";
        console.warn(
          `[openrouter] tentative ${attempt} échouée (${status}) — nouvel essai…`,
        );
      },
    },
  );
}

export async function classifyWithOpenRouter(
  messages: OpenRouterMessage[],
  model?: string,
): Promise<
  | { ok: true; parsed: LlmClassificationRaw; model: string; rawContent: string }
  | { ok: false; error: string; model: string; rawContent: string }
> {
  const result = await callOpenRouter({ model, messages, temperature: 0 });
  let json: unknown;
  try {
    json = JSON.parse(result.content);
  } catch {
    return {
      ok: false,
      error: "JSON invalide dans la réponse modèle",
      model: result.model,
      rawContent: result.content,
    };
  }

  const parsed = parseLlmClassificationResponse(json);
  if ("error" in parsed) {
    return {
      ok: false,
      error: (parsed as ParseClassificationError).error,
      model: result.model,
      rawContent: result.content,
    };
  }

  return { ok: true, parsed, model: result.model, rawContent: result.content };
}
