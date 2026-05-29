/**
 * Heatmap d'activité « détectée » style GitHub (rendu serveur, sans JS client).
 *
 * Une case = un jour. La couleur (niveau 0–4) provient de `activite_journaliere`,
 * dont les seuils sont calculés sur la population (voir packages/core +
 * job ETL `activite`). Ce N'EST PAS une présence physique (voir disclaimer).
 */
import type { ActiviteJour } from "../../lib/queries";

const COLORS = ["#1c2230", "#1a4731", "#1f7a4d", "#2faa68", "#4ade80"];
const JOURS = ["Lun", "", "Mer", "", "Ven", "", ""];
const MOIS = ["jan", "fév", "mar", "avr", "mai", "jui", "jui", "aoû", "sep", "oct", "nov", "déc"];

/** Début de fenêtre par défaut = ouverture de la 17ᵉ législature. */
const FENETRE_DEBUT = "2024-07-18";

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}
function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
/** Jour de semaine avec lundi = 0 … dimanche = 6. */
function mondayIndex(iso: string): number {
  const dow = new Date(`${iso}T00:00:00Z`).getUTCDay();
  return (dow + 6) % 7;
}

interface Cell {
  iso: string;
  niveau: number;
  nbVotes: number;
  inRange: boolean;
}

export function ActivityHeatmap({
  data,
  debut = FENETRE_DEBUT,
}: {
  data: ActiviteJour[];
  debut?: string;
}) {
  const byDay = new Map(data.map((d) => [d.jour, d]));
  const end = isoToday();
  const start = addDays(debut, -mondayIndex(debut)); // aligne sur le lundi

  // Construit les colonnes (semaines) de 7 cases (lun → dim).
  const weeks: Cell[][] = [];
  let cursor = start;
  while (cursor <= end) {
    const week: Cell[] = [];
    for (let i = 0; i < 7; i++) {
      const entry = byDay.get(cursor);
      week.push({
        iso: cursor,
        niveau: entry?.niveau ?? 0,
        nbVotes: entry?.nbVotes ?? 0,
        inRange: cursor >= debut && cursor <= end,
      });
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  }

  // Étiquettes de mois : affichées quand le mois change en tête de colonne.
  const monthLabels = weeks.map((w, i) => {
    const first = w[0];
    if (!first) return "";
    const m = Number(first.iso.slice(5, 7)) - 1;
    const prev = i > 0 ? Number(weeks[i - 1]?.[0]?.iso.slice(5, 7)) - 1 : -1;
    return m !== prev ? (MOIS[m] ?? "") : "";
  });

  const totalActifs = data.filter((d) => d.niveau > 0).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1">
          {/* Ligne des mois */}
          <div className="flex gap-[3px] pl-8 text-[10px] text-muted">
            {monthLabels.map((label, i) => (
              <div key={i} className="w-[11px] shrink-0">
                {label}
              </div>
            ))}
          </div>
          <div className="flex gap-[3px]">
            {/* Colonne des jours */}
            <div className="mr-1 flex w-7 flex-col gap-[3px] text-[10px] text-muted">
              {JOURS.map((j, i) => (
                <div key={i} className="h-[11px] leading-[11px]">
                  {j}
                </div>
              ))}
            </div>
            {/* Grille */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((cell) => (
                  <div
                    key={cell.iso}
                    className="size-[11px] rounded-[2px]"
                    style={{
                      backgroundColor: cell.inRange ? COLORS[cell.niveau] : "transparent",
                    }}
                    title={
                      cell.inRange
                        ? `${cell.iso} · ${cell.nbVotes} vote${cell.nbVotes > 1 ? "s" : ""} exprimé${cell.nbVotes > 1 ? "s" : ""}`
                        : undefined
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted">
        <span>{totalActifs} jour{totalActifs > 1 ? "s" : ""} d'activité détectée</span>
        <span className="flex items-center gap-1">
          Moins
          {COLORS.map((c, i) => (
            <span key={i} className="size-[11px] rounded-[2px]" style={{ backgroundColor: c }} aria-hidden />
          ))}
          Plus
        </span>
      </div>
    </div>
  );
}
