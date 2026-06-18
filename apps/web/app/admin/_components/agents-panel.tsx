import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AgentRunSummary } from "@/lib/admin/types";

export function AgentsPanel({ agentRuns }: { agentRuns: AgentRunSummary[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Runs agents Cursor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {agentRuns.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun run (CURSOR_API_KEY manquant ou API indisponible).</p>
        ) : (
          agentRuns.map((run) => (
            <div key={run.id} className="rounded-lg border border-border p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{run.status}</Badge>
                <span className="font-mono text-xs">{run.id}</span>
              </div>
              {run.url && (
                <a href={run.url} className="mt-1 inline-block text-primary hover:underline" target="_blank" rel="noreferrer">
                  Ouvrir dans Cursor
                </a>
              )}
              {run.createdAt && (
                <p className="text-muted-foreground">{new Date(run.createdAt).toLocaleString("fr-FR")}</p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
