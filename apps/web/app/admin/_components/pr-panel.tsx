import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CiBadge } from "./ci-badge";
import type { PullRequestSummary } from "@/lib/admin/types";

function PrRow({ pr }: { pr: PullRequestSummary }) {
  return (
    <div className="space-y-2 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <a href={pr.url} className="font-medium text-primary hover:underline" target="_blank" rel="noreferrer">
          #{pr.number} {pr.title}
        </a>
        {pr.isDraft && <Badge variant="outline">Draft</Badge>}
        {pr.autoMergeEnabled && <Badge variant="secondary">Auto-merge</Badge>}
        <CiBadge state={pr.ciState} />
      </div>
      <p className="text-sm text-muted-foreground">
        {pr.mergedAt
          ? `Mergée le ${new Date(pr.mergedAt).toLocaleString("fr-FR")}`
          : `Ouverte le ${new Date(pr.createdAt).toLocaleString("fr-FR")}`}
        {pr.mergeStateStatus ? ` · état merge : ${pr.mergeStateStatus}` : ""}
      </p>
    </div>
  );
}

export function PrPanel({
  openPullRequests,
  recentlyMergedPullRequests,
}: {
  openPullRequests: PullRequestSummary[];
  recentlyMergedPullRequests: PullRequestSummary[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pull requests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Ouvertes ({openPullRequests.length})</h3>
          {openPullRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune PR ouverte.</p>
          ) : (
            openPullRequests.map((pr) => <PrRow key={pr.number} pr={pr} />)
          )}
        </section>
        <Separator />
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Mergées récemment</h3>
          {recentlyMergedPullRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune PR mergée récente.</p>
          ) : (
            recentlyMergedPullRequests.map((pr) => <PrRow key={pr.number} pr={pr} />)
          )}
        </section>
      </CardContent>
    </Card>
  );
}
