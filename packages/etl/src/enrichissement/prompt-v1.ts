/**
 * Prompt v1 — classification scrutin → thème (taxonomie 8 commissions AN).
 *
 * Version figée ; toute modification = nouveau fichier prompt-v2.ts + nouvelle colonne prompt_version.
 */

import { PROMPT_VERSION } from "@open-hemicycle/core";
import { THEMES_TAXONOMIE } from "@open-hemicycle/core";

export const CLASSIFICATION_MODEL_DEFAULT = "google/gemini-2.0-flash-001";

export interface PromptBuildInput {
  titre: string;
  objet?: string | null;
}

const THEME_LIST = THEMES_TAXONOMIE.map(
  (t) => `- ${t.slug} : ${t.nom} — ${t.description}`,
).join("\n");

export function buildClassificationPrompt(input: PromptBuildInput): {
  promptVersion: typeof PROMPT_VERSION;
  system: string;
  user: string;
} {
  const objetBlock = input.objet?.trim()
    ? `\nObjet officiel du scrutin : ${input.objet.trim()}`
    : "";

  return {
    promptVersion: PROMPT_VERSION,
    system: `Tu es un classificateur factuel de scrutins parlementaires français.
Ta tâche : indiquer si le scrutin relève clairement d'UN thème institutionnel (commission permanente AN).
Tu ne juges jamais une personne, un groupe ou une position politique.
En cas de doute, ambiguïté ou texte transversal → theme_slug = null.
Réponds UNIQUEMENT en JSON valide, sans markdown.`,
    user: `Taxonomie autorisée (8 slugs exacts, ou null) :
${THEME_LIST}

Scrutin à classer :
Titre : ${input.titre.trim()}${objetBlock}

Réponds avec ce schéma JSON strict :
{
  "theme_slug": "<slug taxonomie ou null>",
  "confidence": <nombre entre 0 et 1>,
  "justification": "<phrase factuelle courte, sans jugement>"
}`,
  };
}

export function getPromptMetadata() {
  return {
    promptVersion: PROMPT_VERSION,
    modelDefault: CLASSIFICATION_MODEL_DEFAULT,
    themeCount: THEMES_TAXONOMIE.length,
  };
}
