/**
 * Helpers de parsing pour les dumps JSON de l'Assemblée nationale.
 *
 * Les JSON de l'AN sont des conversions depuis XML : un élément répété peut
 * apparaître soit comme tableau, soit comme objet unique, soit comme `null`.
 * `arrayify` normalise systématiquement vers un tableau.
 */

import { readFile } from "node:fs/promises";

/** Normalise une valeur "0..N" (objet seul, tableau, ou null) en tableau. */
export function arrayify<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Extrait le texte d'un champ AN qui peut être une string simple,
 * ou un objet `{ "#text": "..." }` (typage XML), ou null.
 */
export function anText(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && "#text" in (value as Record<string, unknown>)) {
    const t = (value as Record<string, unknown>)["#text"];
    return typeof t === "string" ? t : null;
  }
  return null;
}

/** Lit et parse un fichier JSON. */
export async function readJson<T = unknown>(path: string): Promise<T> {
  const raw = await readFile(path, "utf8");
  return JSON.parse(raw) as T;
}
