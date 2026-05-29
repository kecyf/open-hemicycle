/**
 * Catalogue des sources de données ouvertes de l'Assemblée nationale.
 *
 * Source primaire UNIQUE : data.assemblee-nationale.fr (Licence Ouverte Etalab 2.0).
 * NE PAS utiliser le miroir data.gouv.fr de l'AN (figé ~juin 2022).
 *
 * Voir docs/data-sources.md pour le détail et les licences.
 */

export const AN_BASE_URL = "https://data.assemblee-nationale.fr";
export const AN_DYN_BASE_URL = "https://www.assemblee-nationale.fr/dyn/opendata";

export type DatasetFormat = "json" | "xml" | "csv";

export interface AnDataset {
  /** Identifiant interne court. */
  id: string;
  /** Libellé humain. */
  label: string;
  /** Chemin relatif à AN_BASE_URL (avec la législature interpolée). */
  path: (legislature: string) => string;
  format: DatasetFormat;
  /** Priorité d'ingestion pour le MVP (true = core). */
  core: boolean;
  /** Volume approximatif (documentation). */
  approxSize: string;
}

export const AN_DATASETS: AnDataset[] = [
  {
    id: "deputes-actifs",
    label: "Députés actifs + mandats + organes (AMO10)",
    path: (l) =>
      `/static/openData/repository/${l}/amo/deputes_actifs_mandats_actifs_organes/AMO10_deputes_actifs_mandats_actifs_organes.json.zip`,
    format: "json",
    core: true,
    approxSize: "~5 Mo",
  },
  {
    id: "acteurs-historique",
    label: "Tous acteurs / mandats / organes (historique, AMO30)",
    path: (l) =>
      `/static/openData/repository/${l}/amo/tous_acteurs_mandats_organes_xi_legislature/AMO30_tous_acteurs_tous_mandats_tous_organes_historique.json.zip`,
    format: "json",
    core: false,
    approxSize: "~13 Mo",
  },
  {
    id: "scrutins",
    label: "Scrutins (votes individuels)",
    path: (l) => `/static/openData/repository/${l}/loi/scrutins/Scrutins.json.zip`,
    format: "json",
    core: true,
    approxSize: "~22 Mo",
  },
  {
    id: "dossiers-legislatifs",
    label: "Dossiers législatifs",
    path: (l) =>
      `/static/openData/repository/${l}/loi/dossiers_legislatifs/Dossiers_Legislatifs.json.zip`,
    format: "json",
    core: true,
    approxSize: "~9 Mo",
  },
  {
    id: "amendements",
    label: "Amendements (tous)",
    path: (l) =>
      `/static/openData/repository/${l}/loi/amendements_div_legis/Amendements.json.zip`,
    format: "json",
    core: false,
    approxSize: "~260 Mo",
  },
  {
    id: "debats-syceron",
    label: "Débats en séance (Syceron, brut)",
    path: (l) => `/static/openData/repository/${l}/vp/syceronbrut/syseron.xml.zip`,
    format: "xml",
    core: false,
    approxSize: "~47 Mo",
  },
  {
    id: "reunions",
    label: "Réunions / agenda",
    path: (l) => `/static/openData/repository/${l}/vp/reunions/Agenda.json.zip`,
    format: "json",
    core: false,
    approxSize: "~7 Mo",
  },
  {
    id: "questions-ecrites",
    label: "Questions écrites",
    path: (l) =>
      `/static/openData/repository/${l}/questions/questions_ecrites/Questions_ecrites.json.zip`,
    format: "json",
    core: false,
    approxSize: "~39 Mo",
  },
];

/** Index des publications du jour (flux quasi temps réel). */
export const AN_DAILY_PUBLICATION_INDEX = `${AN_DYN_BASE_URL}/list-publication/publication_j.csv`;

export function datasetUrl(dataset: AnDataset, legislature: string): string {
  return `${AN_BASE_URL}${dataset.path(legislature)}`;
}
