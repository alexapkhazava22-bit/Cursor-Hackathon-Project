import {
  CANONICAL_SCHEMA_VERSION,
  REPORT_GENERATION_VERSION,
  type AuditViolation,
  type CanonicalReport,
  type DeterministicAuditResult,
  type SeverityCounts,
} from "@/lib/types";
import { hashCanonicalReport } from "@/lib/report/canonical";
import { normalizeUrl } from "@/lib/utils/ids";

export interface BuildCanonicalReportInput {
  auditId: string;
  reportVersion: number;
  auditResult: DeterministicAuditResult;
  paymentTransactionSignature: string;
  payerWallet: string;
  solanaCluster: string;
}

function cloneViolations(violations: AuditViolation[]): AuditViolation[] {
  return violations.map((v) => ({
    id: v.id,
    ruleId: v.ruleId,
    help: v.help,
    description: v.description,
    impact: v.impact,
    helpUrl: v.helpUrl,
    tags: [...v.tags].sort(),
    wcagReferences: [...v.wcagReferences].sort(),
    failureSummary: v.failureSummary,
    nodes: v.nodes.map((n) => ({
      target: [...n.target],
      html: n.html,
      failureSummary: n.failureSummary,
      xpath: n.xpath ? [...n.xpath] : undefined,
    })),
  }));
}

export function buildCanonicalReport(
  input: BuildCanonicalReportInput,
): CanonicalReport {
  const severityCounts: SeverityCounts = {
    CRITICAL: input.auditResult.severityCounts.CRITICAL,
    SERIOUS: input.auditResult.severityCounts.SERIOUS,
    MODERATE: input.auditResult.severityCounts.MODERATE,
    MINOR: input.auditResult.severityCounts.MINOR,
  };

  return {
    schemaVersion: CANONICAL_SCHEMA_VERSION,
    auditId: input.auditId,
    reportVersion: input.reportVersion,
    normalizedUrl: normalizeUrl(input.auditResult.auditedUrl),
    auditTimestamp: input.auditResult.timestamp,
    auditEngine: {
      name: input.auditResult.engineName,
      version: input.auditResult.engineVersion,
    },
    violations: cloneViolations(input.auditResult.violations),
    severityCounts,
    paymentTransactionSignature: input.paymentTransactionSignature,
    payerWallet: input.payerWallet,
    solanaCluster: input.solanaCluster,
    reportGenerationVersion: REPORT_GENERATION_VERSION,
  };
}

export function createHashedReport(input: BuildCanonicalReportInput): {
  report: CanonicalReport;
  hash: string;
} {
  const report = buildCanonicalReport(input);
  const hash = hashCanonicalReport(report);
  return { report, hash };
}
