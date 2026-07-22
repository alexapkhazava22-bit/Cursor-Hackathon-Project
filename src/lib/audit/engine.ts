import axe from "axe-core";
import type {
  AffectedNode,
  AuditViolation,
  DeterministicAuditResult,
} from "@/lib/types";
import { LIMITATION_NOTICE_KA } from "@/lib/types";
import {
  calculateHealthScore,
  countSeverities,
  extractWcagReferences,
  normalizeImpact,
} from "@/lib/audit/severity";

export const AUDIT_ENGINE_NAME = "axe-core";
export const AUDIT_ENGINE_VERSION = axe.version ?? "4.x";

function mapNodes(
  nodes: axe.Result["nodes"],
): AffectedNode[] {
  return nodes.map((node) => ({
    target: [...node.target.map(String)],
    html: node.html,
    failureSummary: node.failureSummary,
    xpath: node.xpath ? [...node.xpath.map(String)] : undefined,
  }));
}

export function mapAxeViolations(
  violations: axe.Result[],
): AuditViolation[] {
  return violations.map((v, index) => {
    const tags = [...v.tags];
    return {
      id: `${v.id}-${index}`,
      ruleId: v.id,
      help: v.help,
      description: v.description,
      impact: normalizeImpact(v.impact),
      helpUrl: v.helpUrl,
      tags,
      wcagReferences: extractWcagReferences(tags),
      nodes: mapNodes(v.nodes),
      failureSummary: v.nodes.map((n) => n.failureSummary).filter(Boolean).join(" | ") || undefined,
    };
  });
}

export function buildDeterministicResult(input: {
  auditedUrl: string;
  violations: AuditViolation[];
  passes: number;
  incomplete?: number;
  inapplicable?: number;
  timestamp?: string;
}): DeterministicAuditResult {
  const severityCounts = countSeverities(input.violations.map((v) => v.impact));
  return {
    engineName: AUDIT_ENGINE_NAME,
    engineVersion: AUDIT_ENGINE_VERSION,
    auditedUrl: input.auditedUrl,
    timestamp: input.timestamp ?? new Date().toISOString(),
    violations: input.violations,
    passes: input.passes,
    incomplete: input.incomplete ?? 0,
    inapplicable: input.inapplicable ?? 0,
    totalIssues: input.violations.length,
    severityCounts,
    limitations: [
      LIMITATION_NOTICE_KA,
      "Results are limited to automated axe-core checks on the loaded page snapshot.",
      "Solana attestation proves report integrity, not correctness of accessibility conclusions.",
    ],
    healthScore: calculateHealthScore(severityCounts),
    healthScoreLabel: "Automated Accessibility Health Score",
  };
}

/**
 * Run axe-core against the current document (browser-only).
 */
export async function runAxeOnDocument(
  auditedUrl: string,
): Promise<DeterministicAuditResult> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("runAxeOnDocument requires a browser document");
  }

  const results = await axe.run(document, {
    resultTypes: ["violations", "passes", "incomplete", "inapplicable"],
  });

  return buildDeterministicResult({
    auditedUrl,
    violations: mapAxeViolations(results.violations),
    passes: results.passes.length,
    incomplete: results.incomplete.length,
    inapplicable: results.inapplicable.length,
  });
}

/**
 * Analyze a provided HTML string in a temporary DOM (jsdom or browser iframe).
 * For server/demo we prefer the deterministic demo fixture when available.
 */
export async function runAxeOnHtml(
  html: string,
  auditedUrl: string,
): Promise<DeterministicAuditResult> {
  if (typeof window === "undefined") {
    // Server path: return structured analysis via dynamic jsdom if present,
    // otherwise callers should use getDeterministicDemoAudit().
    throw new Error(
      "Server-side HTML axe requires a DOM. Use getDeterministicDemoAudit() for the bundled demo.",
    );
  }

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);
  try {
    const doc = iframe.contentDocument;
    if (!doc) throw new Error("Unable to create audit document");
    doc.open();
    doc.write(html);
    doc.close();
    const results = await axe.run(doc, {
      resultTypes: ["violations", "passes", "incomplete", "inapplicable"],
    });
    return buildDeterministicResult({
      auditedUrl,
      violations: mapAxeViolations(results.violations),
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      inapplicable: results.inapplicable.length,
    });
  } finally {
    iframe.remove();
  }
}
