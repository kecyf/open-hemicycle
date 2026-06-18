import { groupColor, POSITION_COLORS } from "../../lib/scrutin-format";
import type { GroupeVentilation } from "../../lib/queries";

const POSITIONS = [
  { key: "pour", label: "Pour", color: POSITION_COLORS.pour },
  { key: "contre", label: "Contre", color: POSITION_COLORS.contre },
  { key: "abstention", label: "Abstention", color: POSITION_COLORS.abstention },
  { key: "nonVotant", label: "Non-votant", color: POSITION_COLORS.nonVotant },
] as const;

export function GroupeVentilationBar({ g }: { g: GroupeVentilation }) {
  const color = groupColor(g.couleurHex);
  const segments = [
    { key: "pour", value: g.pour, color: POSITIONS[0].color },
    { key: "contre", value: g.contre, color: POSITIONS[1].color },
    { key: "abstention", value: g.abstention, color: POSITIONS[2].color },
    { key: "nonVotant", value: g.nonVotant, color: POSITIONS[3].color },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium">
          <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
          {g.sigle ?? g.nom ?? "Sans groupe"}
        </span>
        <span className="text-xs text-muted">
          {g.total.toLocaleString("fr-FR")} position{g.total > 1 ? "s" : ""}
        </span>
      </div>
      {g.total > 0 ? (
        <>
          <div
            className="flex h-2.5 w-full overflow-hidden rounded-full bg-border"
            role="img"
            aria-label={`${g.sigle ?? "groupe"} : ${g.pour} pour, ${g.contre} contre, ${g.abstention} abstention, ${g.nonVotant} non-votant`}
          >
            {segments.map((s) =>
              s.value > 0 ? (
                <span
                  key={s.key}
                  style={{ width: `${(s.value / g.total) * 100}%`, backgroundColor: s.color }}
                  title={`${s.key} : ${s.value}`}
                />
              ) : null,
            )}
          </div>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums text-muted">
            {segments.map((s) =>
              s.value > 0 ? (
                <li key={s.key} className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} aria-hidden />
                  {POSITIONS.find((p) => p.key === s.key)?.label} {s.value.toLocaleString("fr-FR")}
                </li>
              ) : null,
            )}
          </ul>
        </>
      ) : (
        <p className="text-xs text-muted">Aucune position nominative sur ce périmètre.</p>
      )}
    </div>
  );
}
