import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DbCheckResult } from "@open-hemicycle/db";
import { computeClassifyProgressSummary, formatClassifyRunInputsLabel } from "@open-hemicycle/core";
import type { EnrichmentStatus, WorkflowRunSummary } from "@/lib/admin/types";
import { ClassifyDispatchForm } from "./classify-dispatch-form";
import { ClassifyRefreshPoller } from "./classify-refresh-poller";

const CLASSIFY_WORKFLOW_URL =
  "https://github.com/kecyf/open-hemicycle/actions/workflows/classify-scrutins.yml";

const DEFAULT_CLASSIFY_BATCH = 100;

function workflowBadgeVariant(
  run: WorkflowRunSummary,
): "default" | "secondary" | "destructive" {
  if (run.status !== "completed") return "secondary";
  return run.conclusion === "success" ? "default" : "destructive";
}

function formatRunDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  });
}

export function EnrichmentStatusPanel({
  enrichment,
  database,
  classifyWorkflowRuns,
  githubConfigured,
  classifyRunInProgress,
}: {
  enrichment: EnrichmentStatus;
  database: DbCheckResult;
  classifyWorkflowRuns: WorkflowRunSummary[];
  githubConfigured: boolean;
  classifyRunInProgress: boolean;
}) {
  const steps = [
    {
      label: "Connexion base (oh_agent)",
      ok: database.connected,
    },
    {
      label: "Grants ETL oh_agent (DELETE affiliations/mandats)",
      ok: database.ohAgentEtlGrantsOk !== false,
    },
    {
      label: "Migration scrutins_classifications (HITL)",
      ok: database.scrutinsClassificationsTable,
    },
    {
      label: "Clé OPENROUTER_API_KEY",
      ok: enrichment.openRouterConfigured,
    },
  ];

  const progress = enrichment.backlog
    ? computeClassifyProgressSummary(enrichment.backlog, DEFAULT_CLASSIFY_BATCH)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrichissement LLM (4.8)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap gap-2">
          <Badge variant={enrichment.readyForClassify ? "default" : "secondary"}>
            Prêt classify {enrichment.readyForClassify ? "OK" : "non"}
          </Badge>
          <Badge variant={enrichment.openRouterConfigured ? "default" : "destructive"}>
            OpenRouter {enrichment.openRouterConfigured ? "OK" : "absent"}
          </Badge>
        </div>

        <dl className="grid gap-1 text-muted-foreground">
          <div>
            <dt className="inline">Prompt : </dt>
            <dd className="inline font-medium text-foreground">{enrichment.promptVersion}</dd>
          </div>
          <div>
            <dt className="inline">Modèle par défaut : </dt>
            <dd className="inline font-medium text-foreground">{enrichment.modelDefault}</dd>
          </div>
          <div>
            <dt className="inline">Thèmes taxonomie : </dt>
            <dd className="inline font-medium text-foreground">{enrichment.themeCount}</dd>
          </div>
          {enrichment.classificationsCount !== undefined && (
            <div>
              <dt className="inline">Classifications en base : </dt>
              <dd className="inline font-medium tabular-nums text-foreground">
                {enrichment.classificationsCount.toLocaleString("fr-FR")}
              </dd>
            </div>
          )}
          {enrichment.backlog && (
            <>
              <div>
                <dt className="inline">Scrutins sans dossier : </dt>
                <dd className="inline font-medium tabular-nums text-foreground">
                  {enrichment.backlog.scrutinsSansDossier.toLocaleString("fr-FR")}
                </dd>
              </div>
              <div>
                <dt className="inline">Classifiés (prompt courant) : </dt>
                <dd className="inline font-medium tabular-nums text-foreground">
                  {enrichment.backlog.dejaClassifies.toLocaleString("fr-FR")}
                </dd>
              </div>
              <div>
                <dt className="inline">En attente : </dt>
                <dd className="inline font-medium tabular-nums text-foreground">
                  {enrichment.backlog.enAttente.toLocaleString("fr-FR")}
                </dd>
              </div>
            </>
          )}
        </dl>

        {progress && (
          <div className="space-y-2 rounded-lg border border-border/60 p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progression classify (scrutins sans dossier)</span>
              <span className="tabular-nums font-medium text-foreground">
                {progress.percentComplete} %
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={progress.percentComplete}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progression de la classification LLM"
            >
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress.percentComplete}%` }}
              />
            </div>
            {progress.estimatedRuns > 0 && (
              <p className="text-xs text-muted-foreground">
                Environ{" "}
                <span className="font-medium tabular-nums text-foreground">
                  {progress.estimatedRuns.toLocaleString("fr-FR")}
                </span>{" "}
                run{progress.estimatedRuns > 1 ? "s" : ""} GitHub Actions (
                <code className="text-xs">limit={progress.batchSize}</code>,{" "}
                <code className="text-xs">delay_ms=500</code>) pour couvrir le backlog restant.
              </p>
            )}
          </div>
        )}

        <ul className="space-y-1 rounded-lg border border-border/60 p-3">
          {steps.map((step) => (
            <li key={step.label} className="flex items-center gap-2">
              <span aria-hidden>{step.ok ? "✓" : "○"}</span>
              <span className={step.ok ? "text-foreground" : "text-muted-foreground"}>
                {step.label}
              </span>
            </li>
          ))}
        </ul>

        {classifyWorkflowRuns.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Derniers runs classify (GH Actions)</p>
            <ul className="space-y-2">
              {classifyWorkflowRuns.map((run) => (
                <li
                  key={run.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <a
                      href={run.url}
                      className="text-xs underline underline-offset-2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      #{run.id}
                    </a>
                    {run.inputs && (
                      <span className="text-xs text-muted-foreground">
                        {formatClassifyRunInputsLabel(run.inputs)}
                      </span>
                    )}
                  </div>
                  <Badge variant={workflowBadgeVariant(run)} className="text-xs">
                    {run.status === "completed"
                      ? run.conclusion ?? "terminé"
                      : run.status}
                  </Badge>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {formatRunDate(run.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Aucun run classify enregistré — lancez le premier via le bouton ci-dessous ou GitHub Actions.
          </p>
        )}

        <ClassifyRefreshPoller active={classifyRunInProgress} />

        <ClassifyDispatchForm
          githubConfigured={githubConfigured}
          classifyRunInProgress={classifyRunInProgress}
        />

        {enrichment.readyForClassify ? (
          <div className="space-y-2 text-muted-foreground">
            <p>
              Lancer un run pilote :{" "}
              <code className="text-xs">pnpm etl classify:scrutins --limit=50</code>
            </p>
            <p>
              Ou via GitHub Actions :{" "}
              <a
                href={CLASSIFY_WORKFLOW_URL}
                className="underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Classify Scrutins (LLM)
              </a>{" "}
              — <code className="text-xs">limit=100</code>,{" "}
              <code className="text-xs">delay_ms=500</code>
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground">
            Compléter la checklist ci-dessus avant le premier run de classification. Voir{" "}
            <Link href="/methodologie" className="underline underline-offset-2">
              méthodologie
            </Link>{" "}
            et{" "}
            <a
              href="https://github.com/kecyf/open-hemicycle/blob/main/docs/enrichissement-llm.md"
              className="underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              docs/enrichissement-llm.md
            </a>
            .
            {" "}
            Classification via{" "}
            <a
              href={CLASSIFY_WORKFLOW_URL}
              className="underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Actions
            </a>{" "}
            si les secrets Cloud Agents ne sont pas synchronisés.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
