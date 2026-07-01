import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DbCheckResult } from "@open-hemicycle/db";
import type { EnrichmentStatus } from "@/lib/admin/types";

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
          <p className="text-muted-foreground">
            Lancer un run pilote :{" "}
            <code className="text-xs">pnpm etl classify:scrutins --limit=50</code>
          </p>
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
          </p>
        )}
      </CardContent>
    </Card>
  );
}
