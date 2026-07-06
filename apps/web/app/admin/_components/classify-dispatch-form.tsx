"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ClassifyDispatchForm({
  githubConfigured,
  classifyRunInProgress,
}: {
  githubConfigured: boolean;
  classifyRunInProgress: boolean;
}) {
  const [limit, setLimit] = useState("100");
  const [delayMs, setDelayMs] = useState("500");
  const [dryRun, setDryRun] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [runUrl, setRunUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function dispatchClassify() {
    setDispatching(true);
    setError(null);
    setMessage(null);
    setRunUrl(null);

    try {
      const res = await fetch("/api/admin/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          limit: Number.parseInt(limit, 10),
          delayMs: Number.parseInt(delayMs, 10),
          dryRun,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        runId?: number;
        url?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Échec déclenchement");

      setMessage(
        data.runId
          ? `Workflow lancé (run #${data.runId}).`
          : "Workflow lancé — consultez l'historique ci-dessous.",
      );
      if (data.url) setRunUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setDispatching(false);
    }
  }

  if (!githubConfigured) {
    return (
      <p className="text-xs text-muted-foreground">
        Déclenchement depuis l&apos;admin indisponible (GITHUB_ADMIN_TOKEN manquant sur Vercel).
      </p>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-border/60 p-3">
      <p className="text-xs font-medium text-muted-foreground">
        Lancer classify via GitHub Actions (secrets Actions, pas Cloud Agents)
      </p>

      {classifyRunInProgress && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Un run est en cours — le bouton est désactivé jusqu&apos;à la fin.
        </p>
      )}

      <div className="flex flex-wrap gap-3 text-xs">
        <label className="flex items-center gap-1.5">
          <span className="text-muted-foreground">limit</span>
          <input
            type="number"
            min={1}
            max={500}
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="w-20 rounded border border-border bg-background px-2 py-1 tabular-nums"
            disabled={dispatching || classifyRunInProgress}
          />
        </label>
        <label className="flex items-center gap-1.5">
          <span className="text-muted-foreground">delay_ms</span>
          <input
            type="number"
            min={1}
            max={10000}
            value={delayMs}
            onChange={(e) => setDelayMs(e.target.value)}
            className="w-24 rounded border border-border bg-background px-2 py-1 tabular-nums"
            disabled={dispatching || classifyRunInProgress}
          />
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={dryRun}
            onChange={(e) => setDryRun(e.target.checked)}
            disabled={dispatching || classifyRunInProgress}
            className="rounded border-border"
          />
          <span className="text-muted-foreground">dry_run</span>
        </label>
      </div>

      <Button
        size="sm"
        onClick={dispatchClassify}
        disabled={dispatching || classifyRunInProgress}
      >
        {dispatching ? "Lancement…" : "Lancer classify (GH Actions)"}
      </Button>

      {message && <p className="text-xs text-primary">{message}</p>}
      {runUrl && (
        <a
          href={runUrl}
          className="text-xs text-primary underline underline-offset-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ouvrir le run GitHub Actions
        </a>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
