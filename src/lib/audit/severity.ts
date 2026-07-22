import type { Severity, SeverityCounts } from "@/lib/types";

export function normalizeImpact(impact: string | null | undefined): Severity {
  switch ((impact ?? "").toLowerCase()) {
    case "critical":
      return "CRITICAL";
    case "serious":
      return "SERIOUS";
    case "moderate":
      return "MODERATE";
    case "minor":
    default:
      return "MINOR";
  }
}

export function emptySeverityCounts(): SeverityCounts {
  return { CRITICAL: 0, SERIOUS: 0, MODERATE: 0, MINOR: 0 };
}

export function countSeverities(
  impacts: Severity[],
): SeverityCounts {
  const counts = emptySeverityCounts();
  for (const impact of impacts) {
    counts[impact] += 1;
  }
  return counts;
}

/**
 * Transparent Automated Accessibility Health Score.
 * Not an official accessibility score — derived only from automated findings.
 * Formula: max(0, 100 - 25*CRITICAL - 15*SERIOUS - 8*MODERATE - 3*MINOR)
 */
export function calculateHealthScore(counts: SeverityCounts): number {
  const raw =
    100 -
    counts.CRITICAL * 25 -
    counts.SERIOUS * 15 -
    counts.MODERATE * 8 -
    counts.MINOR * 3;
  return Math.max(0, Math.min(100, raw));
}

export function extractWcagReferences(tags: string[]): string[] {
  return tags
    .filter((t) => /^wcag\d+/i.test(t) || /^wcag2/i.test(t))
    .map((t) => t.toUpperCase())
    .sort();
}
