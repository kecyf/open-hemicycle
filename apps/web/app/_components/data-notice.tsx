/**
 * Bandeau d'honnêteté sur l'état des données.
 *
 * Affiché partout où l'on montre des chiffres : le POC repose sur une ingestion
 * encore partielle. On l'assume explicitement (garde-fous éditoriaux).
 */
export function DataNotice({ className = "" }: { className?: string }) {
  return (
    <aside
      className={`rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm leading-relaxed text-muted ${className}`}
      role="note"
    >
      <p>
        <strong className="text-amber-300">Données partielles (POC).</strong> L'ingestion
        couvre la 17ᵉ législature : <strong className="text-foreground">577 député·es</strong>,{" "}
        <strong className="text-foreground">~7 000 scrutins</strong> et leurs votes nominatifs.
        Il manque encore les votes des député·es non actifs (dump historique) et le
        rattachement scrutin ↔ texte de loi. Les chiffres affichés sont donc{" "}
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
