import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAdminDashboardData } from "@/lib/admin/dashboard";
import { AgentsPanel } from "./_components/agents-panel";
import { DbStatusPanel } from "./_components/db-status-panel";
import { EnrichmentStatusPanel } from "./_components/enrichment-status-panel";
import { DecisionForm } from "./_components/decision-form";
import { DeploymentsPanel } from "./_components/deployments-panel";
import { HitlPanel } from "./_components/hitl-panel";
import { PrPanel } from "./_components/pr-panel";
import { SignOutButton } from "./_components/sign-out-button";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  const data = await getAdminDashboardData();
  const login = session?.user?.name ?? process.env.ADMIN_GITHUB_LOGIN ?? "superviseur";

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin — boucle d&apos;autonomie</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Suivi PR, HITL, déploiements et runs agents. Connecté en tant que {login}.
          </p>
        </div>
        <SignOutButton />
      </header>

      <div className="flex flex-wrap gap-2">
        <Badge variant={data.configured.github ? "default" : "destructive"}>GitHub API</Badge>
        <Badge variant={data.configured.vercel ? "default" : "destructive"}>Vercel API</Badge>
        <Badge variant={data.configured.cursor ? "default" : "destructive"}>Cursor API</Badge>
        <Badge variant={data.database.connected ? "default" : "destructive"}>DATABASE_URL</Badge>
        <Badge variant={data.configured.openrouter ? "default" : "destructive"}>OpenRouter API</Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="decision">Décision</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <PrPanel
              openPullRequests={data.openPullRequests}
              recentlyMergedPullRequests={data.recentlyMergedPullRequests}
            />
            <div className="space-y-6">
              <HitlPanel hitlPending={data.hitlPending} supervisorDecisions={data.supervisorDecisions} />
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <DeploymentsPanel deployments={data.deployments} />
            <AgentsPanel agentRuns={data.agentRuns} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <DbStatusPanel database={data.database} />
            <EnrichmentStatusPanel
              enrichment={data.enrichment}
              database={data.database}
              classifyWorkflowRuns={data.classifyWorkflowRuns}
            />
          </div>
        </TabsContent>

        <TabsContent value="decision">
          <DecisionForm githubLogin={login} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
