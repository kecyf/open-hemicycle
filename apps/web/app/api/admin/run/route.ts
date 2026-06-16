import { auth } from "@/auth";
import { githubRepoUrl } from "@/lib/admin/config";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const apiKey = process.env.CURSOR_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "CURSOR_API_KEY manquant" }, { status: 500 });
  }

  const body = (await req.json()) as { decision?: string; context?: string; branch?: string };
  const decision = body.decision?.trim();
  const context = body.context?.trim();
  const branch = body.branch?.trim() || "main";

  const promptLines = [
    "Tu es l'agent autonome Open Hémicycle.",
    "Le superviseur vient de prendre une décision — lis `tasks/supervisor-inbox.md` (dernière entrée) et agis.",
    context ? `Contexte : ${context}` : "",
    decision ? `Décision explicite : ${decision}` : "",
    "Exécute la procédure daily-standup (`.cursor/skills/daily-standup/SKILL.md`).",
  ].filter(Boolean);

  const authHeader = Buffer.from(`${apiKey}:`).toString("base64");

  const res = await fetch("https://api.cursor.com/v1/agents", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: { text: promptLines.join("\n") },
      model: { id: "composer-2.5" },
      repos: [{ url: githubRepoUrl(), startingRef: branch }],
      autoCreatePR: true,
      skipReviewerRequest: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text || "Échec API Cursor" }, { status: res.status });
  }

  const data = (await res.json()) as {
    agent?: { id: string; url?: string };
    run?: { id: string };
  };

  return NextResponse.json({
    agentId: data.agent?.id ?? null,
    runId: data.run?.id ?? null,
    url: data.agent?.url ?? null,
  });
}
