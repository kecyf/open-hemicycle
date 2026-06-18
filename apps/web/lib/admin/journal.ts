import { unstable_cache } from "next/cache";
import { readRepoFile } from "./github";
import type { HitlItem, SupervisorDecision } from "./types";

const SUPERVISOR_MARKER = "🔔 Pour le superviseur";

function parseJournalEntries(markdown: string): Array<{ date: string; title: string; body: string }> {
  const chunks = markdown.split(/\n---\n/).map((c) => c.trim()).filter(Boolean);
  const entries: Array<{ date: string; title: string; body: string }> = [];

  for (const chunk of chunks) {
    const titleMatch = chunk.match(/^##\s+(\d{4}-\d{2}-\d{2})(?:\s+—\s+(.+))?/m);
    if (!titleMatch) continue;
    entries.push({
      date: titleMatch[1],
      title: titleMatch[2]?.trim() ?? "",
      body: chunk,
    });
  }

  return entries;
}

function extractSupervisorBlock(body: string): string | null {
  const markerIndex = body.indexOf(SUPERVISOR_MARKER);
  if (markerIndex === -1) return null;

  const afterMarker = body.slice(markerIndex + SUPERVISOR_MARKER.length);
  const nextSection = afterMarker.search(/\n- \*\*/);
  const block = (nextSection === -1 ? afterMarker : afterMarker.slice(0, nextSection)).trim();
  const cleaned = block.replace(/^:\s*/, "").trim();

  if (!cleaned || cleaned.toLowerCase() === "rien") return null;
  return cleaned;
}

function parseSupervisorDecisions(markdown: string): SupervisorDecision[] {
  const sections = markdown.split(/^## /m).slice(1);
  const decisions: SupervisorDecision[] = [];

  for (const section of sections) {
    const headerMatch = section.match(/^(\d{4}-\d{2}-\d{2}T[^\s]+)\s+—\s+(\S+)/);
    if (!headerMatch) continue;

    const contextMatch = section.match(/\*\*Contexte\*\*\s*:\s*(.+)/);
    const decisionMatch = section.match(/\*\*Décision\*\*\s*:\s*(.+)/);
    const relaunchMatch = section.match(/\*\*Relance agent\*\*\s*:\s*(.+)/i);

    if (!decisionMatch) continue;

    decisions.push({
      timestamp: headerMatch[1],
      author: headerMatch[2],
      context: contextMatch?.[1]?.trim() ?? "",
      decision: decisionMatch[1].trim(),
      relaunch: relaunchMatch?.[1]?.trim().toLowerCase() === "oui",
    });
  }

  return decisions.reverse();
}

async function fetchJournalUncached(): Promise<{
  hitlPending: HitlItem | null;
  supervisorDecisions: SupervisorDecision[];
}> {
  const [journalMd, inboxMd] = await Promise.all([
    readRepoFile("tasks/JOURNAL.md"),
    readRepoFile("tasks/supervisor-inbox.md"),
  ]);

  let hitlPending: HitlItem | null = null;

  if (journalMd) {
    const entries = parseJournalEntries(journalMd);
    const latest = entries[0];
    if (latest) {
      const block = extractSupervisorBlock(latest.body);
      if (block) {
        hitlPending = {
          entryDate: latest.date,
          entryTitle: latest.title,
          supervisorBlock: block,
        };
      }
    }
  }

  const supervisorDecisions = inboxMd ? parseSupervisorDecisions(inboxMd) : [];

  return { hitlPending, supervisorDecisions };
}

export const getJournalData = unstable_cache(fetchJournalUncached, ["admin-journal"], {
  revalidate: 90,
});
