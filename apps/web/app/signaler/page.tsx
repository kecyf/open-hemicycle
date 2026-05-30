import Link from "next/link";

export const metadata = {
  title: "Signaler une erreur — Open Hémicycle",
  description:
    "Signaler une donnée inexacte ou exercer un droit de réponse. Toute correction vérifiée est tracée publiquement.",
};

const ISSUE_ERREUR =
  "https://github.com/kecyf/open-hemicycle/issues/new?labels=correction&title=" +
  encodeURIComponent("[Correction] ") +
  "&body=" +
  encodeURIComponent(
    [
      "**Page concernée (URL)** : ",
      "",
      "**Donnée affichée** : ",
      "",
      "**Ce qui est inexact / attendu** : ",
      "",
      "**Source officielle** (lien assemblee-nationale.fr ou autre) : ",
      "",
    ].join("\n"),
  );

const ISSUE_REPONSE =
  "https://github.com/kecyf/open-hemicycle/issues/new?labels=droit-de-reponse&title=" +
  encodeURIComponent("[Droit de réponse] ") +
  "&body=" +
  encodeURIComponent(
    [
      "**Personne / groupe concerné** : ",
      "",
      "**Page concernée (URL)** : ",
      "",
      "**Élément contesté** : ",
      "",
      "**Réponse / précision demandée** : ",
      "",
    ].join("\n"),
  );

export default function SignalerPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-4">
        <Link href="/" className="w-fit text-sm text-muted hover:text-foreground">
          ← Open Hémicycle
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Signaler une erreur & droit de réponse
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted">
          Open Hémicycle n'affiche que des faits sourcés, mais les données publiques peuvent
          contenir des erreurs et nos calculs sont perfectibles. Tout signalement vérifié est
          corrigé et <strong className="text-foreground">tracé publiquement</strong> dans un
          journal de corrections.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold">Corriger une donnée</h2>
          <p className="text-sm leading-relaxed text-muted">
            Une date, un vote, un effectif de groupe, un libellé semblent inexacts ?
            Indiquez la page, la donnée et la source officielle.
          </p>
          <a
            href={ISSUE_ERREUR}
            className="mt-auto w-fit rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ouvrir un signalement ↗
          </a>
        </article>

        <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold">Exercer un droit de réponse</h2>
          <p className="text-sm leading-relaxed text-muted">
            Vous êtes concerné·e (ou représentez un groupe) et souhaitez apporter une
            précision ou contester un élément ? Votre réponse sera prise en compte.
          </p>
          <a
            href={ISSUE_REPONSE}
            className="mt-auto w-fit rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-border/40"
            target="_blank"
            rel="noopener noreferrer"
          >
            Déposer une réponse ↗
          </a>
        </article>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Comment c'est traité</h2>
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed text-muted">
          <li>Le signalement est <strong className="text-foreground">public</strong> (issue GitHub) — transparence totale du processus.</li>
          <li>Nous vérifions la donnée contre la source officielle de l'Assemblée nationale.</li>
          <li>Si l'erreur est confirmée, la correction est appliquée et <strong className="text-foreground">datée dans le journal de corrections</strong>.</li>
          <li>S'il s'agit d'une interprétation, la précision est ajoutée au contexte affiché.</li>
        </ol>
        <p className="text-sm leading-relaxed text-muted">
          Le suivi des signalements est ouvert :{" "}
          <a
            href="https://github.com/kecyf/open-hemicycle/issues"
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/kecyf/open-hemicycle/issues ↗
          </a>
          . Voir aussi la{" "}
          <Link href="/methodologie" className="text-accent hover:underline">méthodologie</Link>{" "}
          et les{" "}
          <Link href="/mentions-legales" className="text-accent hover:underline">mentions légales</Link>.
        </p>
      </section>
    </main>
  );
}
