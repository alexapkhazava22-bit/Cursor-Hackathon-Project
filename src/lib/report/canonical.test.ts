import { describe, expect, it } from "vitest";
import {
  canonicalize,
  hashCanonicalReport,
  hashCanonicalUtf8,
  sortKeysDeep,
  stripUiOnlyState,
} from "@/lib/report/canonical";
import { buildCanonicalReport } from "@/lib/report/build-report";
import { getDeterministicDemoAudit } from "@/lib/demo/demo-audit";
import { detectReportModification } from "@/lib/certificate/verify";
import type { CanonicalReport } from "@/lib/types";

function sampleReport(overrides?: Partial<CanonicalReport>): CanonicalReport {
  const audit = getDeterministicDemoAudit("/demo/inaccessible", "2026-07-22T12:00:00.000Z");
  const base = buildCanonicalReport({
    auditId: "ac_demo_sample_001",
    reportVersion: 1,
    auditResult: audit,
    paymentTransactionSignature: "sig_payment_demo",
    payerWallet: "DemoWallet1111111111111111111111111",
    solanaCluster: "devnet",
  });
  return { ...base, ...overrides };
}

describe("canonical serialization & hashing", () => {
  it("identical reports generate identical hashes", () => {
    const a = sampleReport();
    const b = sampleReport();
    expect(hashCanonicalReport(a)).toBe(hashCanonicalReport(b));
  });

  it("a one-character change produces a different hash", () => {
    const a = sampleReport();
    const b = sampleReport({ payerWallet: "DemoWallet1111111111111111111111112" });
    expect(hashCanonicalReport(a)).not.toBe(hashCanonicalReport(b));
  });

  it("reordered input keys do not affect the canonical result", () => {
    const report = sampleReport();
    const reordered = {
      solanaCluster: report.solanaCluster,
      auditId: report.auditId,
      payerWallet: report.payerWallet,
      schemaVersion: report.schemaVersion,
      reportVersion: report.reportVersion,
      normalizedUrl: report.normalizedUrl,
      auditTimestamp: report.auditTimestamp,
      auditEngine: report.auditEngine,
      violations: report.violations,
      severityCounts: report.severityCounts,
      paymentTransactionSignature: report.paymentTransactionSignature,
      reportGenerationVersion: report.reportGenerationVersion,
    };
    expect(canonicalize(reordered)).toBe(canonicalize(report));
    expect(hashCanonicalUtf8(canonicalize(reordered))).toBe(
      hashCanonicalReport(report),
    );
  });

  it("UI-only state does not affect the hash", () => {
    const report = sampleReport();
    const withUi = stripUiOnlyState({
      ...report,
      selectedTab: "owner",
      isExpanded: true,
      animationState: "enter",
      toastMessage: "saved",
      scrollPosition: 120,
    } as CanonicalReport & Record<string, unknown>);
    expect(hashCanonicalReport(withUi as unknown as CanonicalReport)).toBe(
      hashCanonicalReport(report),
    );
  });

  it("sortKeysDeep omits undefined values", () => {
    const sorted = sortKeysDeep({ b: 1, a: undefined, c: { z: 2, y: undefined } });
    expect(sorted).toEqual({ b: 1, c: { z: 2 } });
  });
});

describe("report modification detection", () => {
  it("detects modification when stored hash mismatches", () => {
    const report = sampleReport();
    const hash = hashCanonicalReport(report);
    expect(detectReportModification(hash, report)).toBe(false);
    expect(
      detectReportModification(hash, sampleReport({ reportVersion: 2 })),
    ).toBe(true);
  });
});
