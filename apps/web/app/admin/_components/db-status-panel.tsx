import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DbCheckResult } from "@open-hemicycle/db";

export function DbStatusPanel({ database }: { database: DbCheckResult }) {
  const connVariant = database.connected
    ? "default"
    : database.formatOk
      ? "destructive"
      : "secondary";
  const migrationVariant = database.scrutinsClassificationsTable ? "default" : "secondary";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Base de données (Supabase)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap gap-2">
          <Badge variant={database.formatOk ? "default" : "destructive"}>
            Format URL {database.formatOk ? "OK" : "KO"}
          </Badge>
          <Badge variant={connVariant}>
            Connexion {database.connected ? "OK" : "KO"}
          </Badge>
          <Badge variant={migrationVariant}>
            Migration classif. {database.scrutinsClassificationsTable ? "OK" : "absente"}
          </Badge>
        </div>
        {database.user && (
          <p>
            Rôle : <span className="font-medium">{database.user}</span>
          </p>
        )}
        {database.scrutinsCount !== undefined && (
          <p>
            Scrutins en base :{" "}
            <span className="font-medium tabular-nums">
              {database.scrutinsCount.toLocaleString("fr-FR")}
            </span>
          </p>
        )}
        {!database.ok && database.error && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-destructive">
            {database.error}
          </p>
        )}
        {database.ok && !database.scrutinsClassificationsTable && (
          <p className="text-muted-foreground">
            Connexion OK — appliquer{" "}
            <code className="text-xs">packages/db/drizzle/0001_scrutins_classifications.sql</code>{" "}
            (HITL) avant le run <code className="text-xs">classify:scrutins</code>.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
