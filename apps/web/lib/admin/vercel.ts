import { unstable_cache } from "next/cache";
import type { DeploymentSummary } from "./types";

async function fetchDeploymentsUncached(): Promise<DeploymentSummary[]> {
  const token = process.env.VERCEL_ACCESS_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) return [];

  const teamId = process.env.VERCEL_TEAM_ID;
  const params = new URLSearchParams({
    projectId,
    target: "production",
    limit: "5",
  });
  const teamQuery = teamId ? `?teamId=${teamId}` : "";
  const url = `https://api.vercel.com/v6/deployments${teamQuery}&${params.toString()}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 90 },
  });

  if (!res.ok) return [];

  const data = (await res.json()) as {
    deployments?: Array<{
      uid: string;
      state: string;
      url: string;
      created: number;
      inspectorUrl?: string;
      meta?: { githubCommitSha?: string };
    }>;
  };

  return (data.deployments ?? []).map((d) => ({
    id: d.uid,
    state: d.state,
    url: d.url ? `https://${d.url}` : "",
    commitSha: d.meta?.githubCommitSha ?? null,
    createdAt: d.created,
    inspectorUrl: d.inspectorUrl ?? null,
  }));
}

export const getDeployments = unstable_cache(fetchDeploymentsUncached, ["admin-vercel-deployments"], {
  revalidate: 90,
});
