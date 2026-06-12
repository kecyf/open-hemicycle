/**
 * Client minimal pour l'API NosDéputés.fr (ODbL — cross-check uniquement).
 * Voir docs/data-sources.md et https://www.nosdeputes.fr (ajouter /json aux URLs).
 */

const USER_AGENT = "Open-Hemicycle-ETL/0.8 (+https://github.com/kecyf/open-hemicycle; cross-check)";
const DEFAULT_RETRIES = 3;
const RETRY_DELAY_MS = 2_000;

export interface NosdeputesDepute {
  idAn: string;
  slug: string;
  groupeSigle: string | null;
  nom: string;
  prenom: string;
  /** Nombre de scrutins avec vote enregistré (synthèse NosDéputés), si disponible. */
  nbScrutins?: number | null;
}

export interface NosdeputesFetchResult<T> {
  ok: boolean;
  data: T | null;
  error?: string;
  url: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Télécharge du JSON NosDéputés avec reprises sur erreur réseau. */
export async function fetchNosdeputesJson<T>(
  url: string,
  retries = DEFAULT_RETRIES,
): Promise<NosdeputesFetchResult<T>> {
  let lastError = "inconnu";
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(60_000),
      });
      if (!res.ok) {
        lastError = `HTTP ${res.status}`;
      } else {
        const data = (await res.json()) as T;
        return { ok: true, data, url };
      }
    } catch (err) {
      lastError = (err as Error).message;
    }
    if (attempt < retries - 1) await sleep(RETRY_DELAY_MS * (attempt + 1));
  }
  return { ok: false, data: null, error: lastError, url };
}

/** Extrait les députés d'une réponse API (formats plats ou imbriqués). */
export function parseDeputesPayload(raw: unknown): NosdeputesDepute[] {
  if (!raw || typeof raw !== "object") return [];
  const container = raw as Record<string, unknown>;
  const list = container.deputes;
  if (!Array.isArray(list)) return [];

  const out: NosdeputesDepute[] = [];
  for (const item of list) {
    const row =
      item && typeof item === "object" && "depute" in (item as object)
        ? (item as { depute: Record<string, unknown> }).depute
        : (item as Record<string, unknown>);
    const idAn = row.id_an ?? row.idAn;
    const slug = row.slug;
    const nom = row.nom;
    const prenom = row.prenom;
    if (idAn == null || typeof slug !== "string") continue;
    const nbScrutinsRaw = row.nb_scrutins ?? row.nbScrutins ?? row.scrutins;
    const nbScrutins =
      typeof nbScrutinsRaw === "number"
        ? nbScrutinsRaw
        : typeof nbScrutinsRaw === "string"
          ? Number(nbScrutinsRaw)
          : null;

    out.push({
      idAn: String(idAn),
      slug,
      groupeSigle: typeof row.groupe_sigle === "string" ? row.groupe_sigle : null,
      nom: typeof nom === "string" ? nom : "",
      prenom: typeof prenom === "string" ? prenom : "",
      nbScrutins: Number.isFinite(nbScrutins) ? nbScrutins : null,
    });
  }
  return out;
}

/** Liste des députés en mandat (endpoint principal). */
export async function fetchDeputesEnMandat(): Promise<NosdeputesFetchResult<NosdeputesDepute[]>> {
  const url = "https://www.nosdeputes.fr/deputes/enmandat/json";
  const res = await fetchNosdeputesJson<unknown>(url);
  if (!res.ok || !res.data) return { ...res, data: null };
  return { ...res, data: parseDeputesPayload(res.data) };
}

/** Liste élargie (fallback si enmandat vide ou indisponible). */
export async function fetchAllDeputes(): Promise<NosdeputesFetchResult<NosdeputesDepute[]>> {
  const url = "https://www.nosdeputes.fr/deputes/json";
  const res = await fetchNosdeputesJson<unknown>(url);
  if (!res.ok || !res.data) return { ...res, data: null };
  return { ...res, data: parseDeputesPayload(res.data) };
}

/** Synthèse législature (participation / scrutins) — indexée par slug député. */
export async function fetchSyntheseBySlug(): Promise<
  NosdeputesFetchResult<Map<string, { nbScrutins: number | null }>>
> {
  const url = "https://www.nosdeputes.fr/synthese/data/json";
  const res = await fetchNosdeputesJson<unknown>(url);
  if (!res.ok || !res.data) return { ...res, data: null };

  const map = new Map<string, { nbScrutins: number | null }>();
  const root = res.data as Record<string, unknown>;
  const rows = root.deputes ?? root.parlementaires ?? root.data;
  if (!Array.isArray(rows)) return { ...res, data: map };

  for (const item of rows) {
    const row =
      item && typeof item === "object" && "depute" in (item as object)
        ? (item as { depute: Record<string, unknown> }).depute
        : (item as Record<string, unknown>);
    const slug = row.slug;
    if (typeof slug !== "string") continue;
    const nbRaw = row.nb_scrutins ?? row.scrutins ?? row.participation_scrutins;
    const nb = typeof nbRaw === "number" ? nbRaw : typeof nbRaw === "string" ? Number(nbRaw) : null;
    map.set(slug, { nbScrutins: Number.isFinite(nb) ? nb : null });
  }
  return { ...res, data: map };
}
