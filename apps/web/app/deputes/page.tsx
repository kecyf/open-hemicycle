import Link from "next/link";
import { listDeputes, listGroupes } from "../../lib/queries";
import { DataNotice } from "../_components/data-notice";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Annuaire des député·es — Open Hémicycle",
  description:
    "Recherchez un·e député·e de la 17ᵉ législature et explorez son activité de vote.",
};

function groupColor(hex: string | null): string {
  return hex && /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#8b93a7";
}

export default async function DeputesPage({
  searchParams,
}: {
  searchParams: Promise<{ groupe?: string }>;
}) {
  const { groupe } = await searchParams;
  const [groupes, deputes] = await Promise.all([
    listGroupes(),
    listDeputes(groupe),
  ]);
  const groupeActif = groupes.find((g) => g.id === groupe) ?? null;

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-4">
        <Link href="/" className="w-fit text-sm text-muted hover:text-foreground">
          ← Open Hémicycle
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Annuaire des député·es
        </h1>
        <p className="max-w-2xl text-base text-muted">
          {deputes.length} député·e{deputes.length > 1 ? "s" : ""}
          {groupeActif ? ` du groupe ${groupeActif.sigle ?? groupeActif.nom}` : " — 17ᵉ législature"}.
          Cliquez sur un nom pour voir le détail des votes.
        </p>
      </header>

      <DataNotice />

      <section className="flex flex-col gap-3" aria-label="Filtrer par groupe">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Filtrer par groupe
        </h2>
        <div className="flex flex-wrap gap-2">
          <FilterChip href="/deputes" active={!groupe} label="Tous" />
          {groupes.map((g) => (
            <FilterChip
              key={g.id}
              href={`/deputes?groupe=${g.id}`}
              active={g.id === groupe}
              label={`${g.sigle ?? g.nom} · ${g.membres}`}
              color={groupColor(g.couleurHex)}
            />
          ))}
        </div>
      </section>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {deputes.map((d) => (
          <li key={d.id}>
            <Link
              href={`/deputes/${d.slug}`}
              className="flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:border-muted"
            >
              <span className="font-medium">
                {d.prenom} {d.nom}
              </span>
              <span className="flex items-center gap-2 text-xs text-muted">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: groupColor(d.couleurHex) }}
                  aria-hidden
                />
                {d.groupeSigle ?? d.groupeNom ?? "Sans groupe"}
                {d.departement ? ` · ${d.departement}` : ""}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {deputes.length === 0 && (
        <p className="text-sm text-muted">Aucun·e député·e pour ce filtre.</p>
      )}
    </main>
  );
}

function FilterChip({
  href,
  active,
  label,
  color,
}: {
  href: string;
  active: boolean;
  label: string;
  color?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors ${
        active
          ? "border-accent bg-accent/10 text-foreground"
          : "border-border text-muted hover:text-foreground"
      }`}
    >
      {color && (
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden
        />
      )}
      {label}
    </Link>
  );
}
