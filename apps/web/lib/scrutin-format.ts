/**
 * Helpers d'affichage pour les scrutins (libellés, couleurs, liens sources).
 * Aucune reformulation des libellés AN : on les affiche verbatim.
 */

const LEGISLATURE = process.env.AN_LEGISLATURE ?? "17";

/** Couleur de groupe sûre (fallback gris neutre si hex invalide). */
export function groupColor(hex: string | null | undefined): string {
  return hex && /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#8b93a7";
}

/** Étiquette courte et neutre du type de scrutin. */
export function typeLabel(type: string | null): string {
  switch (type) {
    case "scrutin public solennel":
      return "Solennel";
    case "motion de censure":
      return "Motion de censure";
    case "scrutin public ordinaire":
      return "Ordinaire";
    default:
      return type ?? "Scrutin";
  }
}

/** Lien vers la page officielle d'analyse du scrutin (par numéro). */
export function urlScrutinOfficiel(numero: number | null): string | null {
  if (numero == null) return null;
  return `https://www.assemblee-nationale.fr/dyn/${LEGISLATURE}/scrutins/${numero}`;
}

/** Met une majuscule en tête de libellé (les objets AN commencent en minuscule). */
export function capitalize(s: string | null): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Date FR lisible (jour mois année). */
export function dateFr(d: Date | null): string {
  if (!d) return "date inconnue";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  }).format(d);
}

/** Les 4 positions, ordre et couleurs partagés avec la fiche député. */
export const POSITION_COLORS = {
  pour: "#4ade80",
  contre: "#f87171",
  abstention: "#fbbf24",
  nonVotant: "#64748b",
} as const;
