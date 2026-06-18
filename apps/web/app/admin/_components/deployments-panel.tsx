import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DeploymentSummary } from "@/lib/admin/types";

export function DeploymentsPanel({ deployments }: { deployments: DeploymentSummary[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Déploiements production</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {deployments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun déploiement (token Vercel manquant ou API indisponible).</p>
        ) : (
          deployments.map((d) => (
            <div key={d.id} className="rounded-lg border border-border p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={d.state === "READY" ? "default" : "secondary"}>{d.state}</Badge>
                {d.url && (
                  <a href={d.url} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                    {d.url}
                  </a>
                )}
              </div>
              <p className="mt-1 text-muted-foreground">
                {new Date(d.createdAt).toLocaleString("fr-FR")}
                {d.commitSha ? ` · ${d.commitSha.slice(0, 7)}` : ""}
              </p>
              {d.inspectorUrl && (
                <a href={d.inspectorUrl} className="text-xs text-primary hover:underline" target="_blank" rel="noreferrer">
                  Inspecteur Vercel
                </a>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
