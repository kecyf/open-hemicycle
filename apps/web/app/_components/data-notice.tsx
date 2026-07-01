import { getGlobalCounts, type GlobalCounts } from "../../lib/queries";

/**
 * Bandeau d'honnêteté sur l'état des données.
 *
 * Affiché partout où l'on montre des chiffres : le POC repose sur une ingestion
 * encore partielle. On l'assume explicitement (garde-fous éditoriaux).
 *
 * Les chiffres sont **live** (plus de valeurs en dur) : on peut passer `counts`
 * pour éviter un second appel quand la page les a déjà chargés, sinon le bandeau
 * les récupère lui-même.
 */
export async function DataNotice({
  className = "",
  counts: countsProp,
}: {
  className?: string;
  counts?: GlobalCounts | null;
}) {
  const counts =
    countsProp !== undefined ? countsProp : await getGlobalCounts().catch(() => null);
  return (
    <aside
      className={`rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm leading-relaxed text-muted ${className}`}
      role="note"
    >
      <p>
        <strong className="text-amber-300">Données partielles (POC).</strong> L'ingestion
        couvre la 17ᵉ législature
        {counts ? (
          <>
            {" : "}
            <strong className="text-foreground">
              {counts.deputesEnMandat.toLocaleString("fr-FR")} député·es en mandat
            </strong>{" "}
            ({counts.deputes.toLocaleString("fr-FR")} ayant siégé, remplacements inclus),{" "}
            <strong className="text-foreground">
              {counts.scrutins.toLocaleString("fr-FR")} scrutins
            </strong>{" "}
            et leurs votes nominatifs.
          </>
        ) : (
          " (chiffres temporairement indisponibles)."
        )}{" "}
        Le rattachement thématique combine le{" "}
        <strong className="text-foreground">dossier législatif officiel</strong> (prioritaire) et,
        pour les scrutins sans dossier, une{" "}
        <strong className="text-foreground">classification assistée</strong> (modèle de langage,
        seuil de confiance, méthode publiée). Ce déploiement est{" "}
        <strong className="text-foreground">progressif</strong>. Les chiffres affichés sont{" "}
        <em>indicatifs et susceptibles d'évoluer</em>.
      </p>
    </aside>
  );
}

/**
 * Précision permanente : ce qu'on mesure n'est PAS de la présence physique.
 */
export function ActivityDisclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs leading-relaxed text-muted ${className}`}>
      Les positions de vote proviennent des scrutins publics de l'Assemblée nationale. Un
      « non-votant » n'est pas une absence : un·e député·e peut être présent·e sans prendre
      part à un scrutin donné. Aucun relevé officiel de présence physique n'existe.
    </p>
  );
}
