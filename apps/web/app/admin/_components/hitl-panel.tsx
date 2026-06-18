import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HitlItem, SupervisorDecision } from "@/lib/admin/types";

export function HitlPanel({
  hitlPending,
  supervisorDecisions,
}: {
  hitlPending: HitlItem | null;
  supervisorDecisions: SupervisorDecision[];
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Décision HITL en attente</CardTitle>
        </CardHeader>
        <CardContent>
          {hitlPending ? (
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Journal {hitlPending.entryDate}
                {hitlPending.entryTitle ? ` — ${hitlPending.entryTitle}` : ""}
              </p>
              <pre className="whitespace-pre-wrap rounded-lg border border-border bg-card p-4 text-foreground">
                {hitlPending.supervisorBlock}
              </pre>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune décision HITL signalée dans la dernière entrée du journal.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Décisions enregistrées (inbox)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {supervisorDecisions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune décision dans tasks/supervisor-inbox.md.</p>
          ) : (
            supervisorDecisions.slice(0, 5).map((d) => (
              <div key={`${d.timestamp}-${d.author}`} className="rounded-lg border border-border p-3 text-sm">
                <p className="font-medium">
                  {new Date(d.timestamp).toLocaleString("fr-FR")} — {d.author}
                </p>
                {d.context && <p className="text-muted-foreground">Contexte : {d.context}</p>}
                <p>{d.decision}</p>
                {d.relaunch && <p className="text-primary">Relance agent demandée</p>}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
