import Link from "next/link";
import {
  countScrutins,
  listScrutins,
  type TypeScrutinFiltre,
} from "../../lib/queries";
import { DataNotice } from "../_components/data-notice";
import { capitalize, dateFr, sortBadge, typeLabel } from "../../lib/scrutin-format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Scrutins publics — Open Hémicycle",
  description:
    "Explorez les scrutins publics de la 17ᵉ législature et le détail des votes par groupe.",
};

const PAGE_SIZE = 30;

const TYPES: { value?: TypeScrutinFiltre; label: string }[] = [
  { value: undefined, label: "Tous" },
  { value: "solennel", label: "Solennels" },
  { value: "censure", label: "Motions de censure" },
  { value: "ordinaire", label: "Ordinaires" },
];

function isType(v: string | undefined): TypeScrutinFiltre | undefined {
  return v === "solennel" || v === "censure" || v === "ordinaire" ? v : undefined;
}

export default async function ScrutinsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const type = isType(sp.type);
  const page = Math.max(1, Number(sp.page ?? "1") || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [scrutins, total] = await Promise.all([
    listScrutins({ type, limit: PAGE_SIZE, offset }),
    countScrutins(type),
  ]);
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const qs = (next: { type?: string; page?: number }) => {
    const params = new URLSearchParams();
    if (next.type) params.set("type", next.type);
    if (next.page && next.page > 1) params.set("page", String(next.page));
    const s = params.toString();
    return s ? `/scrutins?${s}` : "/scrutins";
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-4">
        <Link href="/" className="w-fit text-sm text-muted hover:text-foreground">
          ← Open Hémicycle
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Scrutins publics
        </h1>
        <p className="max-w-2xl text-base text-muted">
          {total.toLocaleString("fr-FR")} scrutin{total > 1 ? "s" : ""}
          {type ? ` (${typeLabel(
            type === "solennel"
              ? "scrutin public solennel"
              : type === "censure"
                ? "motion de censure"
                : "scrutin public ordinaire",
          ).toLowerCase()})` : " — 17ᵉ législature"}.
          Cliquez sur un scrutin pour voir le détail des votes par groupe.
        </p>
      </header>

      <DataNotice />

      <section className="flex flex-col gap-3" aria-label="Filtrer par type de scrutin">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Type de scrutin
        </h2>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <Link
              key={t.label}
              href={qs({ type: t.value })}
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs transition-colors ${
                type === t.value
                  ? "border-accent bg-accent/10 text-foreground"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </section>

      <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {scrutins.map((s) => {
          const exprimes =
            (s.nbPour ?? 0) + (s.nbContre ?? 0) + (s.nbAbstention ?? 0);
          const badge = sortBadge(s.sort);
          return (
            <li key={s.uidAn}>
              <Link
                href={`/scrutins/${s.uidAn}`}
                className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-border/30"
              >
                <span className="flex flex-wrap items-center gap-3 text-xs text-muted">
                  <span className="rounded-full border border-border px-2 py-0.5">
                    {typeLabel(s.typeScrutin)}
                  </span>
                  <span>n°{s.numero}</span>
                  <span>{dateFr(s.dateScrutin)}</span>
                  {badge && (
                    <span className={`rounded-full border px-2 py-0.5 font-medium ${badge.classes}`}>
                      {badge.label}
                    </span>
                  )}
                </span>
                <span className="text-sm leading-snug">{capitalize(s.objet)}</span>
                {exprimes > 0 && (
                  <span className="flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums text-muted">
                    <span>
                      <span className="text-[#4ade80]">Pour</span> {s.nbPour ?? 0}
                    </span>
                    <span>
                      <span className="text-[#f87171]">Contre</span> {s.nbContre ?? 0}
                    </span>
                    <span>
                      <span className="text-[#fbbf24]">Abstention</span> {s.nbAbstention ?? 0}
                    </span>
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {scrutins.length === 0 && (
        <p className="text-sm text-muted">Aucun scrutin pour ce filtre.</p>
      )}

      <nav className="flex items-center justify-between text-sm" aria-label="Pagination">
        {page > 1 ? (
          <Link
            href={qs({ type: sp.type, page: page - 1 })}
            className="rounded-lg border border-border px-3 py-1.5 text-muted hover:text-foreground"
          >
            ← Précédent
          </Link>
        ) : (
          <span />
        )}
        <span className="text-muted">
          Page {page} / {lastPage}
        </span>
        {page < lastPage ? (
          <Link
            href={qs({ type: sp.type, page: page + 1 })}
            className="rounded-lg border border-border px-3 py-1.5 text-muted hover:text-foreground"
          >
            Suivant →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
