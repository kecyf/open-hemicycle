import { unstable_cache } from "next/cache";
import type { AgentRunSummary } from "./types";

async function fetchAgentRunsUncached(): Promise<AgentRunSummary[]> {
  const apiKey = process.env.CURSOR_API_KEY;
  if (!apiKey) return [];

  const auth = Buffer.from(`${apiKey}:`).toString("base64");
  const res = await fetch("https://api.cursor.com/v1/agents?limit=20", {
    headers: { Authorization: `Basic ${auth}` },
    next: { revalidate: 90 },
  });

  if (!res.ok) return [];

  const data = (await res.json()) as {
    agents?: Array<{
      id: string;
      status?: string;
      url?: string;
      latestRunId?: string;
      createdAt?: string;
    }>;
  };

  return (data.agents ?? []).map((agent) => ({
    id: agent.id,
    status: agent.status ?? "unknown",
    url: agent.url ?? null,
    latestRunId: agent.latestRunId ?? null,
    createdAt: agent.createdAt ?? null,
  }));
}

export const getAgentRuns = unstable_cache(fetchAgentRunsUncached, ["admin-cursor-agents"], {
  revalidate: 90,
});
