import Link from "next/link";

const NAV_LINKS = [
  { href: "/deputes", label: "Annuaire" },
  { href: "/methodologie", label: "Méthodologie" },
  { href: "/signaler-une-erreur", label: "Signaler une erreur" },
] as const;

export function SiteHeader({
  backHref = "/",
  backLabel = "Open Hémicycle",
}: {
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href={backHref} className="text-sm text-muted hover:text-foreground">
          ← {backLabel}
        </Link>
        <nav aria-label="Navigation principale">
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-muted hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="flex flex-col gap-3 border-t border-border pt-8 text-xs text-muted">
      <nav aria-label="Liens légaux et méthodologie">
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          <li>
            <Link href="/methodologie" className="hover:text-foreground">
              Méthodologie
            </Link>
          </li>
          <li>
            <Link href="/mentions-legales" className="hover:text-foreground">
              Mentions légales
            </Link>
          </li>
          <li>
            <Link href="/signaler-une-erreur" className="hover:text-foreground">
              Signaler une erreur
            </Link>
          </li>
          <li>
            <a
              href="https://github.com/kecyf/open-hemicycle"
              className="hover:text-foreground"
            >
              Code source (GitHub)
            </a>
          </li>
        </ul>
      </nav>
      <p>
        Données : Assemblée nationale (
        <a
          href="https://data.assemblee-nationale.fr/"
          className="underline decoration-border hover:text-foreground"
        >
          data.assemblee-nationale.fr
        </a>
        , Licence Ouverte Etalab 2.0). Code sous licence AGPL-3.0.
      </p>
      <p>Un projet d&apos;utilité publique, indépendant et open source.</p>
    </footer>
  );
}
