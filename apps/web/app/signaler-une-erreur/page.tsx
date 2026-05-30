import Link from "next/link";
import { DocCallout, DocPage, DocSection } from "../_components/doc-page";

const ISSUE_URL =
  "https://github.com/kecyf/open-hemicycle/issues/new?labels=signalement&title=%5BSignalement%5D+";

export const metadata = {
  title: "Signaler une erreur — Open Hémicycle",
  description:
    "Procédure de signalement d'erreur dans les données ou l'affichage d'Open Hémicycle. Droit de réponse et journal de corrections.",
};

export default function SignalerErreurPage() {
  return (
    <DocPage
      title="Signaler une erreur"
      description="Une donnée vous semble incorrecte ? Ce canal est le droit de réponse opérationnel du projet. Chaque signalement est examiné."
    >
      <DocCallout>
        <p>
          Open Hémicycle agrège des millions de votes et d&apos;événements parlementaires.
          Des erreurs peuvent survenir (source AN, parsing, jointure, affichage). Nous
          corrigeons les erreurs <strong className="text-foreground">vérifiées</strong> et
          les traçons publiquement.
        </p>
      </DocCallout>

      <DocSection title="Comment signaler">
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            Ouvrez une issue sur GitHub (compte GitHub requis) :
            <div className="mt-3">
              <a
                href={ISSUE_URL}
                className="inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Ouvrir un signalement sur GitHub
              </a>
            </div>
          </li>
          <li>
            Décrivez l&apos;erreur avec le maximum de précision (voir checklist ci-dessous).
          </li>
          <li>
            Nous examinons le signalement, vérifions contre la source officielle, et
            publions une correction si nécessaire.
          </li>
        </ol>
      </DocSection>

      <DocSection title="Informations à inclure">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">URL de la page</strong> concernée (ex. fiche
            député·e, annuaire).
          </li>
          <li>
            <strong className="text-foreground">Ce qui est affiché</strong> vs{" "}
            <strong className="text-foreground">ce qui devrait l&apos;être</strong>.
          </li>
          <li>
            <strong className="text-foreground">Source officielle</strong> : lien vers le
            scrutin, la fiche AN ou le document (avec date).
          </li>
          <li>
            <strong className="text-foreground">Identifiants</strong> utiles : uid député·e
            (PA…), uid scrutin (VTANR5…), date du vote.
          </li>
          <li>
            Captures d&apos;écran ou extraits JSON si disponibles (optionnel).
          </li>
        </ul>
      </DocSection>

      <DocSection title="Ce que nous corrigeons">
        <ul className="list-disc space-y-2 pl-5">
          <li>Erreurs de données (vote mal attribué, groupe incorrect, date erronée).</li>
          <li>Erreurs d&apos;agrégation (totaux, taux, niveaux de heatmap).</li>
          <li>Erreurs d&apos;affichage (libellé, lien mort, contexte manquant).</li>
        </ul>
      </DocSection>

      <DocSection title="Ce que nous ne traitons pas ici">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Demandes de retrait de données publiques légitimes (votes officiels, mandats
            publics).
          </li>
          <li>
            Contestations d&apos;interprétation politique — nous affichons des faits sourcés,
            pas des jugements.
          </li>
          <li>
            Signalements sans source vérifiable (nous devons pouvoir confronter à
            l&apos;open data ou au compte rendu officiel).
          </li>
        </ul>
      </DocSection>

      <DocSection title="Délai et transparence">
        <p>
          Les signalements sont traités au fil de l&apos;eau par l&apos;équipe (humain +
          agent autonome supervisé). Les corrections validées sont committées dans le
          dépôt et mentionnées dans{" "}
          <a
            href="https://github.com/kecyf/open-hemicycle/blob/main/tasks/JOURNAL.md"
            className="text-accent underline decoration-accent/40"
          >
            tasks/JOURNAL.md
          </a>
          . Un journal de corrections public dédié est prévu au jalon M1.
        </p>
      </DocSection>

      <DocSection title="Ressources liées">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <Link href="/methodologie" className="text-accent underline decoration-accent/40">
              Méthodologie de calcul
            </Link>
          </li>
          <li>
            <Link href="/mentions-legales" className="text-accent underline decoration-accent/40">
              Mentions légales et données personnelles
            </Link>
          </li>
          <li>
            <a
              href="https://github.com/kecyf/open-hemicycle/blob/main/docs/legal-guardrails.md"
              className="text-accent underline decoration-accent/40"
            >
              Garde-fous juridiques (dépôt)
            </a>
          </li>
        </ul>
      </DocSection>
    </DocPage>
  );
}
