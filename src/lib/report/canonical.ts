import { sha256 } from "js-sha256";
import type { CanonicalReport } from "@/lib/types";

/**
 * Recursively sort object keys for deterministic JSON serialization.
 * Arrays keep order; undefined values are omitted.
 */
export function sortKeysDeep(value: unknown): unknown {
  if (value === undefined) {
    return undefined;
  }
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sortKeysDeep(item));
  }

  const obj = value as Record<string, unknown>;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    const next = sortKeysDeep(obj[key]);
    if (next !== undefined) {
      sorted[key] = next;
    }
  }
  return sorted;
}

/**
 * Stable deterministic JSON: sorted keys, no undefined, UTF-8 string.
 */
export function canonicalize(value: unknown): string {
  const sorted = sortKeysDeep(value);
  return JSON.stringify(sorted);
}

export function hashCanonicalUtf8(canonicalJson: string): string {
  return sha256(canonicalJson);
}

export function hashCanonicalReport(report: CanonicalReport): string {
  return hashCanonicalUtf8(canonicalize(report));
}

/** UI-only fields that must never enter the canonical report. */
export const UI_ONLY_FIELDS = [
  "selectedTab",
  "isExpanded",
  "animationState",
  "toastMessage",
  "scrollPosition",
] as const;

export function stripUiOnlyState<T extends Record<string, unknown>>(
  input: T,
): Omit<T, (typeof UI_ONLY_FIELDS)[number]> {
  const clone = { ...input };
  for (const field of UI_ONLY_FIELDS) {
    delete clone[field];
  }
  return clone;
}
