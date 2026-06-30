import type { DbCheckResult } from "@open-hemicycle/db";

export type CiState = "success" | "failure" | "pending" | "unknown";

export interface PullRequestSummary {
  number: number;
  title: string;
  state: string;
  url: string;
  isDraft: boolean;
  mergedAt: string | null;
  createdAt: string;
  autoMergeEnabled: boolean;
  ciState: CiState;
  mergeStateStatus: string | null;
}

export interface HitlItem {
  entryDate: string;
  entryTitle: string;
  supervisorBlock: string;
}

export interface SupervisorDecision {
  timestamp: string;
  author: string;
  context: string;
  decision: string;
  relaunch: boolean;
}

export interface DeploymentSummary {
  id: string;
  state: string;
  url: string;
  commitSha: string | null;
  createdAt: number;
  inspectorUrl: string | null;
}

export interface AgentRunSummary {
  id: string;
  status: string;
  url: string | null;
  latestRunId: string | null;
  createdAt: string | null;
}

export interface AdminDashboardData {
  openPullRequests: PullRequestSummary[];
  recentlyMergedPullRequests: PullRequestSummary[];
  hitlPending: HitlItem | null;
  supervisorDecisions: SupervisorDecision[];
  deployments: DeploymentSummary[];
  agentRuns: AgentRunSummary[];
  database: DbCheckResult;
  configured: {
    github: boolean;
    vercel: boolean;
    cursor: boolean;
  };
}
