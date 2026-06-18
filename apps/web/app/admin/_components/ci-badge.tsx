import { Badge } from "@/components/ui/badge";
import type { CiState } from "@/lib/admin/types";

const LABELS: Record<CiState, string> = {
  success: "CI verte",
  failure: "CI rouge",
  pending: "CI en cours",
  unknown: "CI inconnue",
};

const VARIANTS: Record<CiState, "default" | "secondary" | "destructive" | "outline"> = {
  success: "default",
  failure: "destructive",
  pending: "secondary",
  unknown: "outline",
};

export function CiBadge({ state }: { state: CiState }) {
  return <Badge variant={VARIANTS[state]}>{LABELS[state]}</Badge>;
}
