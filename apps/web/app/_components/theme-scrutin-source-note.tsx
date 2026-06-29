import Link from "next/link";
import type { ThemeScrutinSourceCounts } from "../../lib/theme-scrutin-filter";

interface ThemeScrutinSourceNoteProps {
  sourceCounts: ThemeScrutinSourceCounts;
  /** Total affiché (défaut : sourceCounts.total). */
  total?: number;
}

/**
 * Décompte par source de rattachement thématique (dossier officiel vs classification assistée).
 * Dégradation gracieuse si la migration LLM n'est pas encore appliquée.
 */
export function ThemeScrutinSourceNote({
  sourceCounts,
  total,
}: ThemeScrutinSourceNoteProps) {
  const totalScrutins = total ?? sourceCounts.total;

  return (
    <p className="text-sm text-muted">
      <span className="font-medium text-foreground">
        {totalScrutins.toLocaleString("fr-FR")} scrutin{totalScrutins > 1 ? "s" : ""}
      </span>{" "}
      rattaché{totalScrutins > 1 ? "s" : ""} à ce thème :{" "}
      <span className="font-medium text-foreground">
        {sourceCounts.viaDossier.toLocaleString("fr-FR")}
      </span>{" "}
      via dossier législatif officiel
      {sourceCounts.llmAvailable && sourceCounts.viaLlm > 0 && (
        <>
          ,{" "}
          <span className="font-medium text-foreground">
            {sourceCounts.viaLlm.toLocaleString("fr-FR")}
          </span>{" "}
          via classification assistée (modèle + prompt versionnés, seuil de confiance — voir{" "}
          <Link href="/methodologie" className="text-accent hover:underline">
            méthodologie
          </Link>
          )
        </>
      )}
      {sourceCounts.llmAvailable && sourceCounts.viaLlm === 0 && (
        <>
          {" "}
          (classification assistée activée mais aucun scrutin classifié pour ce thème pour
          l&apos;instant)
        </>
      )}
      {!sourceCounts.llmAvailable && (
        <>
          {" "}
          (classification assistée pour les scrutins sans dossier — couche en déploiement, voir{" "}
          <Link href="/methodologie" className="text-accent hover:underline">
            méthodologie
          </Link>
          )
        </>
      )}
      .
    </p>
  );
}
