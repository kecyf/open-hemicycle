import { auth } from "@/auth";
import { dispatchClassifyWorkflow, hasActiveClassifyWorkflowRun } from "@/lib/admin/github";
import { parseClassifyDispatchInputs } from "@open-hemicycle/core";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = (await req.json()) as {
    limit?: unknown;
    delayMs?: unknown;
    dryRun?: unknown;
  };

  const parsed = parseClassifyDispatchInputs(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const active = await hasActiveClassifyWorkflowRun();
  if (active) {
    return NextResponse.json(
      { error: "Un run classify est déjà en cours — attendre la fin avant d'en lancer un autre." },
      { status: 409 },
    );
  }

  try {
    const result = await dispatchClassifyWorkflow(parsed.inputs);
    revalidatePath("/admin");
    return NextResponse.json({
      runId: result.runId,
      url: result.url,
      inputs: parsed.inputs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Échec déclenchement workflow";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
