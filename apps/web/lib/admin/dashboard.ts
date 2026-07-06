import { checkDatabase, getClassifyBacklogStats } from "@open-hemicycle/db";
import { PROMPT_VERSION, THEMES_TAXONOMIE } from "@open-hemicycle/core";
import { getAgentRuns } from "./cursor";
import { getClassifyWorkflowRuns, getPullRequests, hasActiveClassifyWorkflowRun } from "./github";
import { getJournalData } from "./journal";
import type { AdminDashboardData } from "./types";
import { getDeployments } from "./vercel";

const CLASSIFICATION_MODEL_DEFAULT =
  process.env.OPENROUTER_MODEL?.trim() || "google/gemini-2.5-flash";

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [{ open, merged }, journal, deployments, agentRuns, database, classifyWorkflowRuns, classifyRunInProgress] =
    await Promise.all([
    getPullRequests(),
    getJournalData(),
    getDeployments(),
    getAgentRuns(),
    checkDatabase(),
    getClassifyWorkflowRuns(),
    hasActiveClassifyWorkflowRun(),
  ]);

  const openRouterConfigured = !!process.env.OPENROUTER_API_KEY?.trim();

  let backlog: AdminDashboardData["enrichment"]["backlog"];
  if (
    database.ok &&
    database.scrutinsClassificationsTable &&
    database.ohAgentEtlGrantsOk !== false
  ) {
    try {
      const stats = await getClassifyBacklogStats(PROMPT_VERSION);
      backlog = {
        scrutinsSansDossier: stats.scrutinsSansDossier,
        dejaClassifies: stats.dejaClassifies,
        enAttente: stats.enAttente,
      };
    } catch {
      backlog = undefined;
    }
  }

  return {
    openPullRequests: open,
    recentlyMergedPullRequests: merged,
    hitlPending: journal.hitlPending,
    supervisorDecisions: journal.supervisorDecisions,
    deployments,
    agentRuns,
    database,
    enrichment: {
      openRouterConfigured,
      modelDefault: CLASSIFICATION_MODEL_DEFAULT,
      promptVersion: PROMPT_VERSION,
      themeCount: THEMES_TAXONOMIE.length,
      readyForClassify:
        database.ok &&
        database.scrutinsClassificationsTable &&
        database.ohAgentEtlGrantsOk !== false &&
        openRouterConfigured,
      classificationsCount: database.classificationsCount,
      backlog,
    },
    classifyWorkflowRuns,
    classifyRunInProgress,
    configured: {
      github: !!process.env.GITHUB_ADMIN_TOKEN,
      vercel: !!process.env.VERCEL_ACCESS_TOKEN && !!process.env.VERCEL_PROJECT_ID,
      cursor: !!process.env.CURSOR_API_KEY,
      openrouter: openRouterConfigured,
    },
  };
}
