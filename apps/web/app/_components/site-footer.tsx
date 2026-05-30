import Link from "next/link";

/**
 * Pied de page commun à tout le site (rendu via le layout racine).
 * Rend accessibles, depuis chaque page, la méthodologie, les mentions
 * légales et le signalement d'erreur — exigences des garde-fous éditoriaux.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 text-xs text-muted">
        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Liens de bas de page">
          <Link href="/" className="hover:text-foreground">
            Accueil
          </Link>
          <Link href="/deputes" className="hover:text-foreground">
            Député·es
          </Link>
          <Link href="/scrutins" className="hover:text-foreground">
            Scrutins
          </Link>
          <Link href="/methodologie" className="hover:text-foreground">
            Méthodologie
          </Link>
          <Link href="/mentions-legales" className="hover:text-foreground">
            Mentions légales
          </Link>
          <Link href="/signaler" className="hover:text-foreground">
            Signaler une erreur
          </Link>
          <a
            href="https://github.com/kecyf/open-hemicycle"
            className="hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            Code (GitHub) ↗
          </a>
        </nav>
        <div className="flex flex-col gap-2 leading-relaxed">
          <p>
            Données : Assemblée nationale (data.assemblee-nationale.fr, Licence Ouverte
            Etalab 2.0), NosDéputés.fr (Regards Citoyens, ODbL), Datan, HATVP. Chaque
            chiffre renvoie à sa source officielle et datée.
          </p>
          <p>
            Code sous licence AGPL-3.0. Observatoire citoyen indépendant et non partisan —
            faits sourcés, jamais de jugement de valeur.
          </p>
        </div>
      </div>
    </footer>
  );
}
