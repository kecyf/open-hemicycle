import Link from "next/link";
import { DocCallout, DocPage, DocSection } from "../_components/doc-page";

export const metadata = {
  title: "Méthodologie — Open Hémicycle",
  description:
    "Comment Open Hémicycle calcule et affiche l'activité parlementaire détectée, la participation aux votes et l'indice de cohérence.",
};

export default function MethodologiePage() {
  return (
    <DocPage
      title="Méthodologie"
      description="Comment nous calculons ce que nous affichons — formules, sources, limites et règles de publication. Document public, critiquable et versionné dans le dépôt."
    >
      <DocCallout>
        <p>
          <strong className="text-foreground">Statut v0 (POC).</strong> Les formules
          ci-dessous sont appliquées sur données réelles mais restent affinables. Le
          détail complet vit dans{" "}
          <a
            href="https://github.com/kecyf/open-hemicycle/blob/main/docs/METHODOLOGY.md"
            className="text-accent underline decoration-accent/40"
          >
            docs/METHODOLOGY.md
          </a>{" "}
          sur GitHub.
        </p>
      </DocCallout>

      <DocSection title="Principes de calcul">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Tout indicateur est <strong className="text-foreground">reproductible</strong>{" "}
            à partir des données sources publiques et du code open source.
          </li>
          <li>
            Aucun indicateur n&apos;est un jugement : on mesure des écarts, des
            fréquences, des participations — jamais une « qualité » ou une « moralité ».
          </li>
          <li>
            Chaque indicateur affiche son <strong className="text-foreground">périmètre</strong>{" "}
            (scrutins, période, exclusions) et sa taille d&apos;échantillon.
          </li>
          <li>
            Le contexte (fonction, délégation de vote, période de mandat) est une donnée
            de premier rang, pas une note de bas de page.
          </li>
        </ul>
      </DocSection>

      <DocSection id="activite" title="Activité parlementaire détectée (heatmap)">
        <p>
          Agrégation <strong className="text-foreground">par jour et par député·e</strong>{" "}
          des actes parlementaires détectables dans l&apos;open data.{" "}
          <strong className="text-foreground">Ce n&apos;est pas une présence.</strong>
        </p>
        <p>Source actuelle (v1) : votes nominatifs des scrutins publics (dataset Scrutins, poids 1).</p>
        <p>Score journalier prévu (enrichissement futur) :</p>
        <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 font-mono text-xs text-foreground">
          {`score_jour = 1·(nb_votes) + 2·(nb_amendements) + 1·(nb_questions)
           + 3·(nb_interventions) + 2·(nb_presences_commission)`}
        </pre>
        <p>
          Niveau de couleur (0–4) : quantiles recalculés sur{" "}
          <strong className="text-foreground">l&apos;ensemble des député·es</strong> (q25,
          q50, q75), pour que deux fiches soient comparables entre elles.
        </p>
        <DocCallout>
          <p className="font-medium text-foreground">Limites affichées obligatoirement</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Les votes à main levée ne sont pas dans l&apos;open data → sous-comptage.</li>
            <li>
              Ministres, président·es de commission et membres du Bureau ont des profils
              atypiques → signalé sur la fiche.
            </li>
            <li>
              Une case vide ≠ absence de travail (circonscription, réunions de groupe non
              documentées).
            </li>
          </ul>
        </DocCallout>
      </DocSection>

      <DocSection id="participation" title="Participation aux votes">
        <p>
          Trois taux distincts,{" "}
          <strong className="text-foreground">affichés ensemble</strong> (jamais un seul
          isolé) :
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Scrutins solennels — votes les plus visibles et programmés.</li>
          <li>Scrutins liés à la commission du·de la député·e.</li>
          <li>Tous les scrutins publics en séance.</li>
        </ol>
        <p>
          Formule : <code className="text-foreground">nb_votes_exprimés / nb_scrutins_du_périmètre</code>
          , avec distinction explicite pour / contre / abstention / non-votant. Un
          non-vote n&apos;est <strong className="text-foreground">jamais</strong> assimilé à
          une opposition.
        </p>
      </DocSection>

      <DocSection id="coherence" title="Indice de cohérence">
        <p>
          Mesure l&apos;<strong className="text-foreground">écart entre positions affichées et votes effectifs</strong>{" "}
          sur un thème donné. Ce n&apos;est pas une « note d&apos;honnêteté » ; c&apos;est une
          distance entre un dire et un faire, tous deux sourcés.
        </p>
        <p>Composantes prévues (v0) :</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">(a) Alignement avec la ligne de groupe</strong>{" "}
            — taux de votes alignés sur la position majoritaire du groupe, sur les scrutins
            d&apos;un thème.
          </li>
          <li>
            <strong className="text-foreground">(b) Position publique ↔ vote</strong> — écart
            entre déclarations sourcées et bulletins de vote (publication uniquement après
            validation manuelle d&apos;un échantillon).
          </li>
          <li>
            <strong className="text-foreground">(c) Participation thématique</strong> — taux
            de participation sur un thème revendiqué comparé au taux global (fait
            affichable, sans qualificatif).
          </li>
        </ul>
        <DocCallout>
          <p className="font-medium text-foreground">Règles de publication</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Pas de score unique « honnêteté » en page d&apos;accueil.</li>
            <li>Toujours au niveau d&apos;un thème, avec scrutins cliquables.</li>
            <li>Grille symétrique pour tous les groupes ; pas de « top des incohérents ».</li>
            <li>
              Lien «{" "}
              <Link href="/signaler-une-erreur" className="text-accent underline">
                signaler une erreur
              </Link>
              » accessible depuis chaque indicateur sensible.
            </li>
          </ul>
        </DocCallout>
      </DocSection>

      <DocSection title="Sources et attribution">
        <p>
          Source primaire :{" "}
          <a
            href="https://data.assemblee-nationale.fr/"
            className="text-accent underline decoration-accent/40"
          >
            data.assemblee-nationale.fr
          </a>{" "}
          (Licence Ouverte Etalab 2.0). Compléments : NosDéputés.fr (ODbL), Datan, HATVP.
          Détail dans{" "}
          <a
            href="https://github.com/kecyf/open-hemicycle/blob/main/docs/data-sources.md"
            className="text-accent underline decoration-accent/40"
          >
            docs/data-sources.md
          </a>
          .
        </p>
        <p>
          Chaque fait affiché sur le site doit pouvoir être retracé jusqu&apos;à un
          scrutin ou document officiel daté, avec lien.
        </p>
      </DocSection>

      <DocSection title="Ce que nous ne calculons pas">
        <ul className="list-disc space-y-2 pl-5">
          <li>Un « classement des pires députés ».</li>
          <li>Un score de moralité, d&apos;intelligence ou de mérite.</li>
          <li>Toute métrique qui assimile absence = opposition, ou activité = qualité.</li>
        </ul>
      </DocSection>
    </DocPage>
  );
}
