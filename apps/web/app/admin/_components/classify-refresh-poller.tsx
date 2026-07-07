"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const REFRESH_INTERVAL_MS = 30_000;

/** Rafraîchit la page admin tant qu'un run classify GH Actions est en cours. */
export function ClassifyRefreshPoller({ active }: { active: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;

    const id = window.setInterval(() => {
      router.refresh();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [active, router]);

  if (!active) return null;

  return (
    <p className="text-xs text-muted-foreground" role="status">
      Run classify en cours — actualisation automatique toutes les 30 s.
    </p>
  );
}
