import { getAgentRuns } from "./cursor";
import { getPullRequests } from "./github";
import { getJournalData } from "./journal";
import type { AdminDashboardData } from "./types";
import { getDeployments } from "./vercel";

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [{ open, merged }, journal, deployments, agentRuns] = await Promise.all([
    getPullRequests(),
    getJournalData(),
    getDeployments(),
    getAgentRuns(),
  ]);

  return {
    openPullRequests: open,
    recentlyMergedPullRequests: merged,
    hitlPending: journal.hitlPending,
    supervisorDecisions: journal.supervisorDecisions,
    deployments,
    agentRuns,
    configured: {
      github: !!process.env.GITHUB_ADMIN_TOKEN,
      vercel: !!process.env.VERCEL_ACCESS_TOKEN && !!process.env.VERCEL_PROJECT_ID,
      cursor: !!process.env.CURSOR_API_KEY,
    },
  };
}
