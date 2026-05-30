import { DocCallout, DocPage, DocSection } from "../_components/doc-page";

export const metadata = {
  title: "Mentions légales — Open Hémicycle",
  description:
    "Informations légales, hébergement, traitement des données et licences du site Open Hémicycle.",
};

export default function MentionsLegalesPage() {
  return (
    <DocPage
      title="Mentions légales"
      description="Informations légales du site Open Hémicycle. Ce document n'est pas un avis juridique ; il décrit le cadre opérationnel du projet."
    >
      <DocSection title="Éditeur du site">
        <p>
          <strong className="text-foreground">Open Hémicycle</strong> — projet open source
          d&apos;utilité publique, développé sous supervision humaine.
        </p>
        <p>
          Code source et documentation :{" "}
          <a
            href="https://github.com/kecyf/open-hemicycle"
            className="text-accent underline decoration-accent/40"
          >
            github.com/kecyf/open-hemicycle
          </a>
          .
        </p>
        <p>
          Contact : via{" "}
          <a
            href="https://github.com/kecyf/open-hemicycle/issues"
            className="text-accent underline decoration-accent/40"
          >
            GitHub Issues
          </a>{" "}
          ou la page{" "}
          <a href="/signaler-une-erreur" className="text-accent underline decoration-accent/40">
            Signaler une erreur
          </a>
          .
        </p>
      </DocSection>

      <DocSection title="Hébergement">
        <p>
          Le site est hébergé par{" "}
          <a
            href="https://vercel.com"
            className="text-accent underline decoration-accent/40"
          >
            Vercel Inc.
          </a>
          , 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.
        </p>
        <p>
          La base de données est hébergée par{" "}
          <a
            href="https://supabase.com"
            className="text-accent underline decoration-accent/40"
          >
            Supabase Inc.
          </a>{" "}
          (PostgreSQL, région UE).
        </p>
      </DocSection>

      <DocSection title="Données personnelles (RGPD)">
        <p>
          Open Hémicycle traite des données publiques relatives à des personnes exerçant un
          mandat électif (député·es), dans une finalité de{" "}
          <strong className="text-foreground">transparence démocratique et d&apos;information du public</strong>
          .
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Minimisation</strong> : uniquement les
            données nécessaires au contrôle de l&apos;activité parlementaire (votes,
            affiliations, activité détectée). Aucune donnée de vie privée ou de santé.
          </li>
          <li>
            <strong className="text-foreground">Visiteurs du site</strong> : pas de compte
            utilisateur en v0 ; pas de formulaire de contact avec collecte de données
            personnelles sur ce site. Les journaux techniques de l&apos;hébergeur peuvent
            inclure adresse IP et user-agent (voir politique Vercel).
          </li>
          <li>
            <strong className="text-foreground">Droit de rectification</strong> : toute
            personne concernée peut signaler une erreur via la page dédiée ; les corrections
            vérifiées seront tracées publiquement.
          </li>
        </ul>
        <DocCallout>
          <p>
            Pour toute question relative aux données personnelles, ouvrez une issue GitHub
            en précisant « Données personnelles » dans le titre.
          </p>
        </DocCallout>
      </DocSection>

      <DocSection title="Propriété intellectuelle et licences">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Code</strong> : licence{" "}
            <a
              href="https://github.com/kecyf/open-hemicycle/blob/main/LICENSE"
              className="text-accent underline decoration-accent/40"
            >
              AGPL-3.0
            </a>
            .
          </li>
          <li>
            <strong className="text-foreground">Données Assemblée nationale</strong> :
            Licence Ouverte Etalab 2.0 — source{" "}
            <a
              href="https://data.assemblee-nationale.fr/"
              className="text-accent underline decoration-accent/40"
            >
              data.assemblee-nationale.fr
            </a>
            , avec attribution et sans dénaturation trompeuse.
          </li>
          <li>
            <strong className="text-foreground">Données dérivées de NosDéputés.fr</strong>{" "}
            (le cas échéant) : ODbL 1.0 (share-alike).
          </li>
        </ul>
      </DocSection>

      <DocSection title="Responsabilité éditoriale">
        <p>
          Le site présente des faits sourcés issus de données publiques. Il ne porte aucun
          jugement moral sur les personnes. Les garde-fous éditoriaux sont documentés dans{" "}
          <a
            href="https://github.com/kecyf/open-hemicycle/blob/main/docs/legal-guardrails.md"
            className="text-accent underline decoration-accent/40"
          >
            docs/legal-guardrails.md
          </a>
          .
        </p>
        <p>
          L&apos;éditeur s&apos;efforce d&apos;assurer l&apos;exactitude des agrégats
          affichés ; en cas d&apos;erreur signalée et vérifiée, une correction sera publiée.
        </p>
      </DocSection>

      <DocSection title="Cookies">
        <p>
          En v0, le site ne dépose pas de cookies de mesure d&apos;audience propres au
          projet. L&apos;hébergeur peut utiliser des cookies techniques strictement
          nécessaires au fonctionnement (CDN, sécurité).
        </p>
      </DocSection>
    </DocPage>
  );
}
