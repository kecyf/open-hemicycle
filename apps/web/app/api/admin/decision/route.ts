import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { appendSupervisorInbox } from "@/lib/admin/github";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = (await req.json()) as { context?: string; decision?: string; relaunch?: boolean };
  const decision = body.decision?.trim();
  if (!decision) {
    return NextResponse.json({ error: "Décision obligatoire" }, { status: 400 });
  }

  const login = process.env.ADMIN_GITHUB_LOGIN ?? session.user.name ?? "superviseur";
  const timestamp = new Date().toISOString();
  const context = body.context?.trim() ?? "";
  const relaunch = body.relaunch ? "oui" : "non";

  const entry = [
    `## ${timestamp} — ${login}`,
    "",
    `**Contexte** : ${context || "—"}`,
    `**Décision** : ${decision}`,
    `**Relance agent** : ${relaunch}`,
  ].join("\n");

  try {
    await appendSupervisorInbox(entry, `chore(admin): décision superviseur (${login})`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur GitHub API";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
