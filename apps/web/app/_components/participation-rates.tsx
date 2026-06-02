import type { TauxParticipationPérimètre, TauxParticipationTriple } from "@open-hemicycle/core";

function formatTaux(taux: number | null): string {
  if (taux == null) return "—";
  return `${(taux * 100).toFixed(1)} %`;
}

function PerimetreCard({ t }: { t: TauxParticipationPérimètre }) {
  const exprimes =
    t.decompte.pour + t.decompte.contre + t.decompte.abstention;
  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-medium text-foreground">{t.label}</h3>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{formatTaux(t.taux)}</p>
      <p className="mt-1 text-xs text-muted">
        {exprimes.toLocaleString("fr-FR")}{" "}
        {exprimes > 1 ? "votes exprimés" : "vote exprimé"} sur{" "}
        {t.nbScrutins.toLocaleString("fr-FR")} scrutin
        {t.nbScrutins > 1 ? "s" : ""} du périmètre (positions nominatives enregistrées).
      </p>
      {t.nbScrutins > 0 ? (
        <ul className="mt-3 grid grid-cols-2 gap-1 text-xs text-muted sm:grid-cols-4">
          <li>Pour : {t.decompte.pour}</li>
          <li>Contre : {t.decompte.contre}</li>
          <li>Abstention : {t.decompte.abstention}</li>
          <li>Non-votant : {t.decompte.nonVotant}</li>
        </ul>
      ) : null}
    </article>
  );
}

/**
 * Affiche les trois taux de participation ensemble (METHODOLOGY §3).
 * Jamais un seul taux isolé sans les deux autres.
 */
export function ParticipationRates({ taux }: { taux: TauxParticipationTriple }) {
  return (
    <section className="space-y-3" aria-labelledby="participation-heading">
      <div>
        <h2 id="participation-heading" className="text-lg font-semibold">
          Participation aux votes
        </h2>
        <p className="mt-1 text-sm text-muted">
          Trois périmètres distincts, affichés ensemble. Un non-vote enregistré n&apos;est pas
          une opposition. Ce ne sont pas des relevés de présence physique.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <PerimetreCard t={taux.solennel} />
        <PerimetreCard t={taux.commission} />
        <PerimetreCard t={taux.tous} />
      </div>
      {taux.commission.nbScrutins === 0 ? (
        <p className="text-xs text-muted">
          Périmètre commission : lien scrutin↔commission et mandats commission pas encore
          ingérés — ce taux s&apos;affichera lorsque les données seront disponibles.
        </p>
      ) : null}
    </section>
  );
}
