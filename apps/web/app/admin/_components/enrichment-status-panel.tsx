import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DbCheckResult } from "@open-hemicycle/db";
import type { EnrichmentStatus } from "@/lib/admin/types";

const CLASSIFY_WORKFLOW_URL =
  "https://github.com/kecyf/open-hemicycle/actions/workflows/classify-scrutins.yml";

export function EnrichmentStatusPanel({
  enrichment,
  database,
}: {
  enrichment: EnrichmentStatus;
  database: DbCheckResult;
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
