import { unstable_cache } from "next/cache";
import { createOctokit, getRepoName, getRepoOwner, githubRepoUrl } from "./config";
import { parseClassifyDispatchInputs } from "@open-hemicycle/core";
import type { ClassifyDispatchInputs } from "@open-hemicycle/core";
import type { CiState, PullRequestSummary, WorkflowRunSummary } from "./types";
import {
  computeClassifyRunDelta,
  extractClassifyStatsFromLogs,
  type ClassifyRunDelta,
} from "@open-hemicycle/core";

const CI_CHECK_NAME = "Typecheck · Test · Build";
const CLASSIFY_WORKFLOW_FILE = "classify-scrutins.yml";

function resolveCiState(
  checkRuns: Array<{ name: string; status: string; conclusion: string | null }>,
): CiState {
  const relevant = checkRuns.filter((r) => r.name === CI_CHECK_NAME);
  if (relevant.length === 0) {
    if (checkRuns.length === 0) return "unknown";
    const allCompleted = checkRuns.every((r) => r.status === "completed");
    if (!allCompleted) return "pending";
    return checkRuns.every((r) => r.conclusion === "success") ? "success" : "failure";
  }
  if (relevant.some((r) => r.status !== "completed")) return "pending";
  return relevant.every((r) => r.conclusion === "success") ? "success" : "failure";
}

function isFileContent(
  data: { type: string; content?: string; sha?: string },
): data is { type: "file"; content: string; sha: string } {
  return data.type === "file" && typeof data.content === "string" && typeof data.sha === "string";
}

async function enrichPullRequest(
  pr: {
    number: number;
    title: string;
    state: string;
    html_url: string;
    draft?: boolean;
    merged_at: string | null;
    created_at: string;
    head: { sha: string };
    auto_merge?: { enabled_by: unknown } | null;
    mergeable_state?: string;
  },
): Promise<PullRequestSummary> {
  const octokit = createOctokit();
  let ciState: CiState = "unknown";
  let mergeStateStatus: string | null = pr.mergeable_state ?? null;

  if (octokit) {
    const owner = getRepoOwner();
    const repo = getRepoName();
    const [{ data: checkRuns }, { data: prDetail }] = await Promise.all([
      octokit.rest.checks.listForRef({ owner, repo, ref: pr.head.sha, per_page: 30 }),
      octokit.rest.pulls.get({ owner, repo, pull_number: pr.number }),
    ]);
    ciState = resolveCiState(checkRuns.check_runs);
    mergeStateStatus = prDetail.mergeable_state ?? mergeStateStatus;
  }

  return {
    number: pr.number,
    title: pr.title,
    state: pr.state,
    url: pr.html_url,
    isDraft: pr.draft ?? false,
    mergedAt: pr.merged_at,
    createdAt: pr.created_at,
    autoMergeEnabled: pr.auto_merge !== null && pr.auto_merge !== undefined,
    ciState,
    mergeStateStatus,
  };
}

async function fetchPullRequestsUncached(): Promise<{
  open: PullRequestSummary[];
  merged: PullRequestSummary[];
}> {
  const octokit = createOctokit();
  if (!octokit) return { open: [], merged: [] };

  const owner = getRepoOwner();
  const repo = getRepoName();

  const [{ data: openPrs }, { data: closedPrs }] = await Promise.all([
    octokit.rest.pulls.list({ owner, repo, state: "open", sort: "updated", direction: "desc", per_page: 20 }),
    octokit.rest.pulls.list({ owner, repo, state: "closed", sort: "updated", direction: "desc", per_page: 20 }),
  ]);

  const open = await Promise.all(openPrs.map(enrichPullRequest));
  const merged = (
    await Promise.all(closedPrs.filter((pr) => pr.merged_at).map(enrichPullRequest))
  ).slice(0, 10);

  return { open, merged };
}

export const getPullRequests = unstable_cache(fetchPullRequestsUncached, ["admin-pull-requests"], {
  revalidate: 90,
});

function parseWorkflowRunInputs(
  inputs: Record<string, unknown> | null | undefined,
): ClassifyDispatchInputs | null {
  if (!inputs) return null;
  const parsed = parseClassifyDispatchInputs({
    limit: inputs.limit,
    delayMs: inputs.delay_ms,
    dryRun: inputs.dry_run,
  });
  return parsed.ok ? parsed.inputs : null;
}

async function downloadJobLogs(
  octokit: ReturnType<typeof createOctokit>,
  owner: string,
  repo: string,
  jobId: number,
): Promise<string | null> {
  if (!octokit) return null;
  try {
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs",
      {
        owner,
        repo,
        job_id: jobId,
        request: { redirect: "manual" },
      },
    );
    if (response.status === 302 || response.status === 301) {
      const location = response.headers.location;
      if (!location || typeof location !== "string") return null;
      const logRes = await fetch(location);
      if (!logRes.ok) return null;
      return await logRes.text();
    }
    if (typeof response.data === "string") return response.data;
    return null;
  } catch {
    return null;
  }
}

async function fetchClassifyRunStatsDelta(
  octokit: ReturnType<typeof createOctokit>,
  owner: string,
  repo: string,
  runId: number,
): Promise<ClassifyRunDelta | null> {
  if (!octokit) return null;
  try {
    const { data: jobsData } = await octokit.rest.actions.listJobsForWorkflowRun({
      owner,
      repo,
      run_id: runId,
      per_page: 5,
    });
    const job = jobsData.jobs[0];
    if (!job?.id) return null;

    const logs = await downloadJobLogs(octokit, owner, repo, job.id);
    if (!logs) return null;

    const { before, after } = extractClassifyStatsFromLogs(logs);
    if (!before || !after) return null;
    return computeClassifyRunDelta(before, after);
  } catch {
    return null;
  }
}


async function fetchClassifyWorkflowRunsUncached(): Promise<WorkflowRunSummary[]> {
  const octokit = createOctokit();
  if (!octokit) return [];

  const owner = getRepoOwner();
  const repo = getRepoName();

  try {
    const { data } = await octokit.rest.actions.listWorkflowRuns({
      owner,
      repo,
      workflow_id: CLASSIFY_WORKFLOW_FILE,
      per_page: 5,
    });

    return data.workflow_runs.map((run) => {
      const runInputs = (run as { inputs?: Record<string, unknown> }).inputs;
      return {
        id: run.id,
        status: run.status ?? "unknown",
        conclusion: run.conclusion,
        url: run.html_url,
        createdAt: run.created_at,
        updatedAt: run.updated_at ?? null,
        displayTitle: run.display_title ?? run.name ?? "Classify Scrutins",
        inputs: parseWorkflowRunInputs(runInputs),
        statsDelta: null as ClassifyRunDelta | null,
      };
    });
  } catch {
    return [];
  }
}

async function enrichClassifyRunsWithStats(
  runs: WorkflowRunSummary[],
): Promise<WorkflowRunSummary[]> {
  const octokit = createOctokit();
  if (!octokit) return runs;

  const owner = getRepoOwner();
  const repo = getRepoName();

  return Promise.all(
    runs.map(async (run) => {
      const isCompleted = run.status === "completed";
      const isSuccess = run.conclusion === "success";
      const isDryRun = run.inputs?.dryRun === true;
      if (!isCompleted || !isSuccess || isDryRun) return run;

      const statsDelta = await fetchClassifyRunStatsDelta(octokit, owner, repo, run.id);
      return statsDelta ? { ...run, statsDelta } : run;
    }),
  );
}

async function fetchClassifyWorkflowRunsWithStatsUncached(): Promise<WorkflowRunSummary[]> {
  const runs = await fetchClassifyWorkflowRunsUncached();
  return enrichClassifyRunsWithStats(runs);
}

export const getClassifyWorkflowRuns = unstable_cache(
  fetchClassifyWorkflowRunsWithStatsUncached,
  ["admin-classify-workflow-runs"],
  { revalidate: 30 },
);

export interface DispatchClassifyWorkflowResult {
  runId: number;
  url: string;
}

/** Déclenche workflow_dispatch « Classify Scrutins (LLM) » via GitHub API. */
export async function dispatchClassifyWorkflow(inputs: {
  limit: number;
  delayMs: number;
  dryRun: boolean;
}): Promise<DispatchClassifyWorkflowResult> {
  const octokit = createOctokit();
  if (!octokit) throw new Error("GITHUB_ADMIN_TOKEN manquant");

  const owner = getRepoOwner();
  const repo = getRepoName();

  const { data } = await octokit.rest.actions.createWorkflowDispatch({
    owner,
    repo,
    workflow_id: CLASSIFY_WORKFLOW_FILE,
    ref: "main",
    inputs: {
      limit: String(inputs.limit),
      delay_ms: String(inputs.delayMs),
      dry_run: inputs.dryRun,
    },
  });

  void data;

  // Le run n'est pas immédiatement listé — on récupère le plus récent en attente.
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const { data: runs } = await octokit.rest.actions.listWorkflowRuns({
    owner,
    repo,
    workflow_id: CLASSIFY_WORKFLOW_FILE,
    per_page: 1,
  });

  const latest = runs.workflow_runs[0];
  if (!latest) {
    return { runId: 0, url: `${githubRepoUrl()}/actions/workflows/${CLASSIFY_WORKFLOW_FILE}` };
  }

  return { runId: latest.id, url: latest.html_url };
}

export async function hasActiveClassifyWorkflowRun(): Promise<boolean> {
  const octokit = createOctokit();
  if (!octokit) return false;

  try {
    const { data } = await octokit.rest.actions.listWorkflowRuns({
      owner: getRepoOwner(),
      repo: getRepoName(),
      workflow_id: CLASSIFY_WORKFLOW_FILE,
      status: "in_progress",
      per_page: 1,
    });
    return data.total_count > 0;
  } catch {
    return false;
  }
}

export async function appendSupervisorInbox(content: string, message: string): Promise<void> {
  const octokit = createOctokit();
  if (!octokit) throw new Error("GITHUB_ADMIN_TOKEN manquant");

  const owner = getRepoOwner();
  const repo = getRepoName();
  const path = "tasks/supervisor-inbox.md";

  let sha: string | undefined;
  let existing = "";

  try {
    const { data } = await octokit.rest.repos.getContent({ owner, repo, path, ref: "main" });
    if (Array.isArray(data) || !isFileContent(data)) throw new Error("Chemin inbox invalide");
    existing = Buffer.from(data.content, "base64").toString("utf-8");
    sha = data.sha;
  } catch (error) {
    if ((error as { status?: number }).status !== 404) throw error;
  }

  const newContent = existing.trimEnd() + "\n\n" + content.trim() + "\n";

  await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: Buffer.from(newContent).toString("base64"),
    sha,
    branch: "main",
  });
}

export async function readRepoFile(path: string): Promise<string | null> {
  const octokit = createOctokit();
  if (!octokit) return null;

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: getRepoOwner(),
      repo: getRepoName(),
      path,
      ref: "main",
    });
    if (Array.isArray(data) || !isFileContent(data)) return null;
    return Buffer.from(data.content, "base64").toString("utf-8");
  } catch {
    return null;
  }
}
