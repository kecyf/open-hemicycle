"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function DecisionForm({ githubLogin }: { githubLogin: string }) {
  const [context, setContext] = useState("");
  const [decision, setDecision] = useState("");
  const [relaunch, setRelaunch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [agentUrl, setAgentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function saveDecision() {
    if (!decision.trim()) {
      setError("La décision est obligatoire.");
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, decision, relaunch }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) throw new Error(data.error ?? "Échec enregistrement");
      setMessage("Décision enregistrée dans supervisor-inbox.md.");
      setContext("");
      setDecision("");
      setRelaunch(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  }

  async function relaunchAgent() {
    setRunning(true);
    setError(null);
    setMessage(null);
    setAgentUrl(null);

    try {
      const res = await fetch("/api/admin/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: decision.trim() || undefined, context: context.trim() || undefined }),
      });
      const data = (await res.json()) as { error?: string; url?: string; agentId?: string };
      if (!res.ok) throw new Error(data.error ?? "Échec relance");
      setMessage(`Agent lancé (${data.agentId ?? "id inconnu"}).`);
      if (data.url) setAgentUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setRunning(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Décision & relance ({githubLogin})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="context" className="text-sm font-medium">
            Contexte
          </label>
          <Textarea
            id="context"
            placeholder="Ex. PR #19 — revendications pilote 4.3b"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="decision" className="text-sm font-medium">
            Décision
          </label>
          <Textarea
            id="decision"
            placeholder="Ex. Approuver le merge après relecture des sources AN."
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            rows={4}
            required
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={relaunch}
            onChange={(e) => setRelaunch(e.target.checked)}
            className="rounded border-border"
          />
          Relancer un run agent après enregistrement
        </label>
        <div className="flex flex-wrap gap-2">
          <Button onClick={saveDecision} disabled={saving || running}>
            {saving ? "Enregistrement…" : "Enregistrer la décision"}
          </Button>
          <Button variant="secondary" onClick={relaunchAgent} disabled={saving || running}>
            {running ? "Lancement…" : "Relancer un run"}
          </Button>
        </div>
        {message && <p className="text-sm text-primary">{message}</p>}
        {agentUrl && (
          <a href={agentUrl} className="text-sm text-primary hover:underline" target="_blank" rel="noreferrer">
            Ouvrir l&apos;agent dans Cursor
          </a>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
