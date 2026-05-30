import Link from "next/link";

export const metadata = {
  title: "Méthodologie — Open Hémicycle",
  description:
    "Comment Open Hémicycle calcule ce qu'il affiche : activité détectée, participation, cohérence. Méthode ouverte et critiquable.",
};

const DOC_URL =
  "https://github.com/kecyf/open-hemicycle/blob/main/docs/METHODOLOGY.md";

export default function MethodologiePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-4">
        <Link href="/" className="w-fit text-sm text-muted hover:text-foreground">
          ← Open Hémicycle
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Méthodologie</h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted">
          Une méthodologie opaque transforme un observatoire en tract. Voici comment nous
          calculons chaque indicateur, ses limites et son périmètre. Tout est reproductible
          à partir des données publiques et du{" "}
          <a href={DOC_URL} className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
            code source
          </a>
          .
        </p>
        <p className="w-fit rounded-full border border-amber-500/30 bg-amber-500/5 px-3 py-1 text-xs text-amber-300">
          Statut : v0 (amorçage) — formules de travail, susceptibles d'évoluer.
        </p>
      </header>

      <Section titre="1. Principes de calcul">
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>Tout indicateur est <strong className="text-foreground">reproductible</strong> à partir des données sources publiques et du code du dépôt.</li>
          <li><strong className="text-foreground">Aucun indicateur n'est un jugement.</strong> On mesure des écarts, des fréquences, des participations — jamais une « qualité » ou une « moralité ».</li>
          <li>Tout indicateur affiche son <strong className="text-foreground">périmètre</strong> (quels scrutins, quelle période, quelles exclusions) et son <strong className="text-foreground">incertitude</strong>.</li>
          <li>Le <strong className="text-foreground">contexte</strong> (fonction, délégation de vote, entrée tardive en mandat…) est une donnée de premier rang, pas une note de bas de page.</li>
        </ul>
      </Section>

      <Section titre="2. Activité parlementaire détectée (heatmap)">
        <p>
          Une agrégation <strong className="text-foreground">par jour et par député·e</strong> des
          actes parlementaires détectables dans l'open data.{" "}
          <strong className="text-foreground">Ce n'est pas une présence physique.</strong>
        </p>
        <p>
          Score journalier (poids v0) : <code className="rounded bg-border/50 px-1.5 py-0.5 text-xs">1·votes + 2·amendements + 1·questions + 3·interventions + 2·présences en commission</code>.
          La couleur de chaque case (niveau 0–4, façon GitHub) provient de seuils par{" "}
          <strong className="text-foreground">quantiles recalculés sur l'ensemble des député·es</strong>{" "}
          — pas de seuils arbitraires figés —, ce qui rend les fiches comparables entre elles.
        </p>
        <p className="text-sm text-muted">
          <strong className="text-foreground">En v1, seuls les votes sont comptés</strong> ;
          amendements, questions et interventions enrichiront le score à mesure de leur ingestion.
        </p>
        <Callout>
          Limites affichées : les votes à main levée (majorité des votes) ne sont pas dans
          l'open data → sous-comptage. Ministres, président·es de commission et membres du
          Bureau ont des profils atypiques. L'absence de case ≠ absence de travail
          (circonscription, réunions de groupe non documentées).
        </Callout>
      </Section>

      <Section titre="3. Participation aux votes">
        <p>
          Trois taux distincts, destinés à être <strong className="text-foreground">affichés ensemble</strong>{" "}
          (jamais un seul isolé) : scrutins solennels, scrutins liés à la commission du·de la
          député·e, et tous les scrutins publics en séance.
        </p>
        <p>
          Pour chaque taux : <code className="rounded bg-border/50 px-1.5 py-0.5 text-xs">votes exprimés / scrutins du périmètre</code>,
          avec distinction explicite <strong className="text-foreground">pour / contre / abstention / non-votant</strong>.
        </p>
        <Callout>
          Un non-vote n'est <strong className="text-foreground">jamais</strong> assimilé à une
          opposition. Un·e député·e peut être présent·e sans prendre part à un scrutin donné,
          et aucun relevé officiel de présence physique n'existe.
        </Callout>
      </Section>

      <Section titre="4. Classification thématique">
        <p>
          Les scrutins sont regroupés par <strong className="text-foreground">thème</strong> pour
          permettre de suivre un sujet de bout en bout. Le rattachement se fait{" "}
          <strong className="text-foreground">au niveau du dossier législatif</strong> (un scrutin
          hérite du thème de son dossier), à partir du lien officiel scrutin → dossier publié par
          l'Assemblée nationale.
        </p>
        <p>
          La classification est <strong className="text-foreground">manuelle</strong> et suit une
          règle <strong className="text-foreground">conservatrice</strong> : un dossier n'entre
          dans un thème que si son <em>titre officiel</em> (verbatim AN) concerne sans ambiguïté le
          cœur du thème. <strong className="text-foreground">En cas de doute, on n'inclut pas.</strong>{" "}
          Un dossier peut n'appartenir à aucun thème.
        </p>
        <p className="text-sm text-muted">
          Le mapping complet (thème → dossiers, avec leur titre officiel) est{" "}
          <strong className="text-foreground">versionné et auditable</strong> dans le dépôt
          (<code className="rounded bg-border/50 px-1.5 py-0.5 text-xs">packages/etl/src/data/themes.ts</code>) ;
          toute modification passe par une revue. <strong className="text-foreground">Phase pilote :</strong>{" "}
          deux thèmes seulement (« Budget &amp; finances publiques », « Sécurité &amp; immigration »),
          la liste s'étoffera progressivement.
        </p>
        <Callout>
          Un thème est un simple <strong className="text-foreground">regroupement neutre</strong>,
          pas un jugement. Le périmètre est volontairement restreint et symétrique : aucun sujet
          n'est mis en avant ni minoré, et le détail des dossiers retenus reste public.
        </Callout>
      </Section>

      <Section titre="5. Indice de cohérence (à venir)">
        <p>
          L'indice de cohérence mesure l'<strong className="text-foreground">écart entre des positions affichées et des votes effectifs</strong>{" "}
          sur un thème donné. Il ne mesure pas l'honnêteté ; il mesure une <em>distance entre
          un dire et un faire</em>, tous deux sourcés et datés.
        </p>
        <p className="text-sm text-muted">
          Cette composante ne sera publiée qu'après validation manuelle d'un échantillon et
          mise en place du droit de réponse. Règles de publication : jamais d'agrégat en un
          seul « score d'honnêteté » ; toujours au niveau d'un thème, avec les scrutins
          cliquables, le contexte, un lien pour signaler une erreur, et une grille{" "}
          <strong className="text-foreground">symétrique</strong> entre tous les groupes (aucun
          tri « top des incohérents » par défaut).
        </p>
      </Section>

      <Section titre="6. Incertitude et corrections">
        <p>
          Chaque indicateur affiche sa taille d'échantillon et sa période. Les données AN
          peuvent contenir des erreurs ; toute correction signalée et vérifiée est tracée
          publiquement. Pour signaler une erreur, voir la page{" "}
          <Link href="/signaler" className="text-accent hover:underline">Signaler une erreur</Link>.
        </p>
      </Section>

      <Section titre="7. Ce que nous ne calculerons pas">
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>Un « classement des pires députés ».</li>
          <li>Un score de moralité, d'intelligence ou de mérite.</li>
          <li>Toute métrique qui assimile absence = opposition, ou activité = qualité.</li>
        </ul>
      </Section>

      <p className="text-sm text-muted">
        Méthodologie complète et versionnée :{" "}
        <a href={DOC_URL} className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
          docs/METHODOLOGY.md ↗
        </a>
      </p>
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

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-muted">
      {children}
    </div>
  );
}
