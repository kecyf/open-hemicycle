import Link from "next/link";

export const metadata = {
  title: "Mentions légales & données — Open Hémicycle",
  description:
    "Nature du projet, sources et licences, données personnelles (RGPD), garde-fous éditoriaux et droit de réponse.",
};

const GUARDRAILS_URL =
  "https://github.com/kecyf/open-hemicycle/blob/main/docs/legal-guardrails.md";

export default function MentionsLegalesPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-4">
        <Link href="/" className="w-fit text-sm text-muted hover:text-foreground">
          ← Open Hémicycle
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Mentions légales & données
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted">
          Open Hémicycle est un observatoire citoyen, ouvert et non partisan, de l'activité
          parlementaire française. Il traite de personnes publiques (élu·es) à partir de
          données publiques, dans une finalité de contrôle démocratique.
        </p>
        <p className="w-fit rounded-full border border-amber-500/30 bg-amber-500/5 px-3 py-1 text-xs text-amber-300">
          Projet en amorçage (POC) — ces mentions seront complétées avant toute mise en ligne du volet « cohérence ».
        </p>
      </header>

      <Section titre="Éditeur & nature du projet">
        <p>
          Projet indépendant, open source (licence <strong className="text-foreground">AGPL-3.0</strong>),
          développé publiquement sur{" "}
          <a href="https://github.com/kecyf/open-hemicycle" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          . Il n'est affilié à aucun parti, groupe parlementaire, ni institution. But :
          rendre lisible l'activité parlementaire à partir de faits sourcés.
        </p>
      </Section>

      <Section titre="Sources de données & licences">
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>
            <strong className="text-foreground">Assemblée nationale</strong> — data.assemblee-nationale.fr,
            sous <strong className="text-foreground">Licence Ouverte Etalab 2.0</strong> (attribution de
            la source, pas de dénaturation trompeuse).
          </li>
          <li>
            <strong className="text-foreground">NosDéputés.fr</strong> (Regards Citoyens) — sous{" "}
            <strong className="text-foreground">ODbL</strong> (<em>share-alike</em> : toute base dérivée
            publiée l'est sous ODbL).
          </li>
          <li><strong className="text-foreground">Datan</strong>, <strong className="text-foreground">HATVP</strong> — données publiques de référence.</li>
        </ul>
        <p>
          Chaque chiffre affiché renvoie à sa source officielle et à sa date d'extraction.
          La méthode de calcul est publiée :{" "}
          <Link href="/methodologie" className="text-accent hover:underline">Méthodologie</Link>.
        </p>
      </Section>

      <Section titre="Données personnelles (RGPD)">
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>
            <strong className="text-foreground">Base légale</strong> : mission d'intérêt public /
            liberté d'expression et d'information sur des personnes exerçant un mandat public.
          </li>
          <li>
            <strong className="text-foreground">Minimisation</strong> : seules sont traitées les
            données utiles au contrôle démocratique de l'activité parlementaire.
          </li>
          <li>
            <strong className="text-foreground">Aucune donnée de vie privée ou de santé.</strong> Une
            absence n'est jamais inférée comme maladie ; si une absence est officiellement
            motivée, elle est affichée neutrement, sans détail médical.
          </li>
          <li>
            <strong className="text-foreground">Droit de rectification</strong> opérationnel via le{" "}
            <Link href="/signaler" className="text-accent hover:underline">signalement d'erreur</Link>,
            avec journal public des corrections.
          </li>
        </ul>
        <p className="text-sm">
          Les élu·es ne peuvent être inquiété·es pour leurs votes et opinions dans l'exercice
          du mandat (art. 26 de la Constitution) : nous <strong className="text-foreground">rapportons</strong>{" "}
          des votes publics par nature, sans les transformer en accusation personnelle.
        </p>
      </Section>

      <Section titre="Garde-fous éditoriaux">
        <p>Lignes rouges, contraignantes pour le code comme pour le contenu :</p>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li><strong className="text-foreground">Aucun adjectif qualificatif</strong> sur une personne (« paresseux », « menteur »…). Uniquement des faits vérifiables, datés et liés à leur source.</li>
          <li>Aucun <strong className="text-foreground">score unique</strong> présenté comme une « note d'honnêteté » ou de moralité.</li>
          <li>Aucun <strong className="text-foreground">classement « top des pires »</strong> par défaut.</li>
          <li>Un <strong className="text-foreground">non-vote n'est jamais</strong> assimilé à une opposition (pour / contre / abstention / non-votant distingués).</li>
          <li>Traitement <strong className="text-foreground">symétrique</strong> de tous les groupes, sans cible unique.</li>
        </ul>
        <p className="text-sm text-muted">
          Détail complet et versionné :{" "}
          <a href={GUARDRAILS_URL} className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
            docs/legal-guardrails.md ↗
          </a>
        </p>
      </Section>

      <Section titre="Droit de réponse & contact">
        <p>
          Toute personne concernée peut demander une correction ou exercer un droit de
          réponse via la page{" "}
          <Link href="/signaler" className="text-accent hover:underline">Signaler une erreur</Link>.
          Les demandes vérifiées sont traitées et tracées publiquement.
        </p>
      </Section>
    </main>
  );
}

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold tracking-tight">{titre}</h2>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  );
}
