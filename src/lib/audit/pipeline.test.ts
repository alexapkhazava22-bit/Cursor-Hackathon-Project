import { describe, expect, it } from "vitest";
import { MockAIProvider } from "@/lib/ai/provider";
import { getDeterministicDemoAudit, getDemoViolations } from "@/lib/demo/demo-audit";
import { verifyCertificate } from "@/lib/certificate/verify";
import {
  attachAttestation,
  attachPayment,
  createDraftAudit,
  createReportHashForAudit,
  runAuditPipeline,
} from "@/lib/audit/pipeline";
import { createDemoPayment } from "@/lib/solana/payment";
import { createDemoAttestation } from "@/lib/solana/attestation";
import { DEMO_SITE_PATH } from "@/lib/types";
import { ClientPaymentVerifier } from "@/lib/payment/verifier";

describe("MockAIProvider", () => {
  it("only explains provided violations and does not invent new ones", async () => {
    const violations = getDemoViolations().slice(0, 2);
    const provider = new MockAIProvider();
    const result = await provider.explainViolations(violations, {
      auditedUrl: DEMO_SITE_PATH,
    });
    expect(result.issues).toHaveLength(2);
    expect(result.issues.map((i) => i.ruleId).sort()).toEqual(
      violations.map((v) => v.ruleId).sort(),
    );
    expect(result.provider).toBe("MockAIProvider");
  });
});

describe("deterministic demo audit", () => {
  it("returns stable violation set for the bundled demo", () => {
    const a = getDeterministicDemoAudit();
    const b = getDeterministicDemoAudit();
    expect(a.violations.map((v) => v.id)).toEqual(b.violations.map((v) => v.id));
    expect(a.totalIssues).toBeGreaterThanOrEqual(6);
    expect(a.severityCounts.CRITICAL).toBeGreaterThan(0);
  });
});

describe("certificate verification states", () => {
  it("marks demo attestation as Verified with demo note", async () => {
    let audit = createDraftAudit({
      url: DEMO_SITE_PATH,
      useDemoSite: true,
      acknowledgedLimitations: true,
    });
    audit = { ...audit, isDemoFlow: true };
    audit = attachPayment(audit, createDemoPayment(audit.auditId, "DemoWallet1111111111111111111111111"));
    audit = await runAuditPipeline(audit);
    audit = createReportHashForAudit(audit);
    audit = attachAttestation(
      audit,
      createDemoAttestation({
        auditId: audit.auditId,
        reportHash: audit.currentHash!,
        wallet: "DemoWallet1111111111111111111111111",
      }),
    );
    const result = await verifyCertificate(audit);
    expect(result.state).toBe("Verified");
    expect(result.isDemoMock).toBe(true);
  });

  it("detects Modified when report hash no longer matches", async () => {
    let audit = createDraftAudit({
      url: DEMO_SITE_PATH,
      useDemoSite: true,
      acknowledgedLimitations: true,
    });
    audit = { ...audit, isDemoFlow: true };
    audit = attachPayment(audit, createDemoPayment(audit.auditId, "DemoWallet1111111111111111111111111"));
    audit = await runAuditPipeline(audit);
    audit = createReportHashForAudit(audit);
    audit = attachAttestation(
      audit,
      createDemoAttestation({
        auditId: audit.auditId,
        reportHash: audit.currentHash!,
        wallet: "DemoWallet1111111111111111111111111",
      }),
    );
    // tamper stored hash
    audit = { ...audit, currentHash: "0".repeat(64) };
    const result = await verifyCertificate(audit);
    expect(result.state).toBe("Modified");
  });
});

describe("PaymentVerifier", () => {
  it("rejects demo mock as real verification", async () => {
    const verifier = new ClientPaymentVerifier();
    const result = await verifier.verify({
      signature: "demo_pay_1",
      expectedAuditId: "ac_1",
      expectedRecipient: "R",
      expectedAmountSol: 0.01,
      network: "devnet",
      isDemoMock: true,
    });
    expect(result.ok).toBe(false);
  });

  it("accepts well-formed client-side confirmation inputs", async () => {
    const verifier = new ClientPaymentVerifier();
    const result = await verifier.verify({
      signature: "5".repeat(64),
      expectedAuditId: "ac_1",
      expectedPayer: "Payer111",
      expectedRecipient: "Recipient111",
      expectedAmountSol: 0.01,
      network: "devnet",
      memo: "ACCESSCHAIN_PAYMENT|v1|audit:ac_1",
      transactionSucceeded: true,
      transferredLamports: BigInt(10_000_000),
      sender: "Payer111",
    });
    expect(result.ok).toBe(true);
  });
});
