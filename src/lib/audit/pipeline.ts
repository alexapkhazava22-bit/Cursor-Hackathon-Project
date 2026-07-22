import {
  createAuditId,
  sanitizeMetadata,
  assertSafeAuditUrl,
} from "@/lib/utils/ids";
import { getFeatureFlags, getSolanaConfig } from "@/lib/config";
import {
  transition,
  canStartAudit,
  assertTransition,
} from "@/lib/state/audit-state-machine";
import { getDeterministicDemoAudit } from "@/lib/demo/demo-audit";
import { explainWithFallback } from "@/lib/ai/provider";
import { createHashedReport } from "@/lib/report/build-report";
import { createDemoPayment } from "@/lib/solana/payment";
import { createDemoAttestation } from "@/lib/solana/attestation";
import { MockAIProvider } from "@/lib/ai/provider";
import type {
  AuditRecord,
  AuditRequestMeta,
  AuditState,
  AttestationRecord,
  PaymentRecord,
} from "@/lib/types";
import { DEMO_SITE_PATH } from "@/lib/types";

function forceState(audit: AuditRecord, state: AuditState): AuditRecord {
  return { ...audit, state, updatedAt: new Date().toISOString() };
}

export function createDraftAudit(meta: AuditRequestMeta): AuditRecord {
  const flags = getFeatureFlags();
  const url = meta.useDemoSite
    ? DEMO_SITE_PATH
    : assertSafeAuditUrl(meta.url, {
        allowDemoRoute: true,
        enableExternal: flags.enableExternalAudit,
      });

  const now = new Date().toISOString();
  return {
    auditId: createAuditId(),
    state: "DRAFT",
    createdAt: now,
    updatedAt: now,
    meta: {
      url,
      useDemoSite: meta.useDemoSite || url.startsWith("/demo/"),
      businessName: sanitizeMetadata(meta.businessName),
      email: sanitizeMetadata(meta.email, 200),
      acknowledgedLimitations: meta.acknowledgedLimitations,
    },
    reportVersion: 0,
    reportVersions: [],
    certificateStatuses: [],
    isDemoFlow: false,
  };
}

export function applyState(
  audit: AuditRecord,
  to: AuditState,
  options?: { demoMode?: boolean; force?: boolean },
): AuditRecord {
  if (options?.force) {
    return forceState(audit, to);
  }
  const next = transition(audit.state, to, options);
  return { ...audit, state: next, updatedAt: new Date().toISOString() };
}

export function moveToPayment(audit: AuditRecord): AuditRecord {
  let next = audit;
  if (next.state === "DRAFT") {
    next = applyState(next, "WALLET_REQUIRED");
  }
  if (next.state === "WALLET_REQUIRED") {
    next = applyState(next, "PAYMENT_REQUIRED");
  }
  return next;
}

export function attachPayment(
  audit: AuditRecord,
  payment: PaymentRecord,
): AuditRecord {
  let next = moveToPayment(audit);

  if (payment.status === "pending") {
    next = applyState(next, "PAYMENT_PENDING");
    return { ...next, payment };
  }

  if (payment.status === "failed") {
    return {
      ...forceState(next, "FAILED"),
      payment,
      failureReason: payment.error ?? "Payment failed",
    };
  }

  if (payment.status === "demo_mock") {
    if (next.state === "PAYMENT_REQUIRED") {
      next = applyState(next, "PAYMENT_PENDING");
    }
    next = applyState(next, "PAYMENT_CONFIRMED", { demoMode: true, force: true });
    return { ...next, payment, isDemoFlow: true };
  }

  if (payment.status === "confirmed") {
    if (next.state === "PAYMENT_REQUIRED") {
      next = applyState(next, "PAYMENT_PENDING");
    }
    if (next.state === "PAYMENT_PENDING") {
      next = applyState(next, "PAYMENT_CONFIRMED");
    } else {
      assertTransition(next.state, "PAYMENT_CONFIRMED");
    }
    return { ...next, payment };
  }

  return { ...next, payment };
}

export async function runAuditPipeline(
  audit: AuditRecord,
): Promise<AuditRecord> {
  const flags = getFeatureFlags();
  if (
    !canStartAudit(audit.state, {
      demoMode: flags.demoMode,
      isDemoFlow: audit.isDemoFlow,
    })
  ) {
    throw new Error("Audit cannot start before payment confirmation");
  }

  let next =
    audit.state === "PAYMENT_CONFIRMED"
      ? applyState(audit, "AUDIT_RUNNING")
      : forceState(audit, "AUDIT_RUNNING");

  const auditedUrl = next.meta.url;
  let auditResult = getDeterministicDemoAudit(
    auditedUrl.startsWith("/demo/") ? auditedUrl : DEMO_SITE_PATH,
    new Date().toISOString(),
  );

  // External URL path: call server audit API; fall back to demo on any failure
  if (
    flags.enableExternalAudit &&
    !auditedUrl.startsWith("/demo/") &&
    !next.meta.useDemoSite
  ) {
    try {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const response = await fetch(`${origin}/api/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: auditedUrl }),
      });
      const payload = (await response.json()) as {
        result?: typeof auditResult;
        fallback?: typeof auditResult;
        error?: string;
        usedFallback?: boolean;
      };
      if (payload.result) {
        auditResult = payload.result;
      } else if (payload.fallback) {
        auditResult = {
          ...payload.fallback,
          auditedUrl,
          limitations: [
            ...(payload.fallback.limitations ?? []),
            `External audit unavailable (${payload.error ?? "unknown error"}); showing bundled demo findings for continuity.`,
          ],
        };
      }
    } catch {
      auditResult = {
        ...auditResult,
        auditedUrl,
        limitations: [
          ...auditResult.limitations,
          "External audit request failed; using bundled demo findings so the demo remains usable.",
        ],
      };
    }
  }

  const explanations = await explainWithFallback(auditResult.violations, {
    auditedUrl: auditResult.auditedUrl,
    businessName: next.meta.businessName,
  });

  next = applyState(
    { ...next, auditResult, explanations },
    "AUDIT_COMPLETE",
  );
  return next;
}

export function createReportHashForAudit(audit: AuditRecord): AuditRecord {
  if (!audit.auditResult || !audit.payment?.signature || !audit.payment.payer) {
    throw new Error("Missing audit result or payment for hashing");
  }

  const reportVersion = Math.max(1, audit.reportVersion + 1);
  const { report, hash } = createHashedReport({
    auditId: audit.auditId,
    reportVersion,
    auditResult: audit.auditResult,
    paymentTransactionSignature: audit.payment.signature,
    payerWallet: audit.payment.payer,
    solanaCluster: "devnet",
  });

  const previousVersions = audit.reportVersions.map((v) => ({
    ...v,
    superseded: true,
  }));

  let next =
    audit.state === "AUDIT_COMPLETE"
      ? applyState(audit, "HASH_CREATED")
      : forceState(audit, "HASH_CREATED");
  next = applyState(next, "ATTESTATION_REQUIRED");

  return {
    ...next,
    reportVersion,
    currentHash: hash,
    reportVersions: [
      ...previousVersions,
      {
        version: reportVersion,
        createdAt: new Date().toISOString(),
        report,
        hash,
        superseded: false,
      },
    ],
    certificateStatuses: next.certificateStatuses.filter((s) => s !== "MODIFIED"),
  };
}

export function attachAttestation(
  audit: AuditRecord,
  attestation: AttestationRecord,
): AuditRecord {
  const versions = audit.reportVersions.map((v) =>
    v.version === audit.reportVersion ? { ...v, attestation } : v,
  );

  let next = audit;

  if (attestation.status === "pending") {
    next = applyState(
      audit.state === "ATTESTATION_REQUIRED"
        ? audit
        : forceState(audit, "ATTESTATION_REQUIRED"),
      "ATTESTATION_PENDING",
    );
  } else if (
    attestation.status === "confirmed" ||
    attestation.status === "demo_mock"
  ) {
    if (audit.state === "ATTESTATION_REQUIRED") {
      next = applyState(audit, "ATTESTATION_PENDING");
    } else if (audit.state !== "ATTESTATION_PENDING") {
      next = forceState(audit, "ATTESTATION_PENDING");
    }
    next = applyState(next, "VERIFIED", {
      force: attestation.status === "demo_mock",
    });
  } else if (attestation.status === "failed") {
    next = forceState(audit, "FAILED");
  }

  const certificateStatuses =
    attestation.status === "confirmed" || attestation.status === "demo_mock"
      ? ([
          "PAYMENT_VERIFIED",
          "REPORT_HASH_ANCHORED",
          "REPORT_INTEGRITY_VERIFIED",
        ] as const)
      : audit.certificateStatuses;

  return {
    ...next,
    attestation,
    reportVersions: versions,
    certificateStatuses: [...certificateStatuses],
    updatedAt: new Date().toISOString(),
    isDemoFlow: audit.isDemoFlow || attestation.isDemoMock,
  };
}

export function markReportModified(audit: AuditRecord): AuditRecord {
  return {
    ...audit,
    certificateStatuses: [
      ...audit.certificateStatuses.filter(
        (s) => s !== "REPORT_INTEGRITY_VERIFIED",
      ),
      "MODIFIED",
    ],
    state: "ATTESTATION_REQUIRED",
    updatedAt: new Date().toISOString(),
  };
}

export async function seedSampleAudit(): Promise<AuditRecord> {
  const config = getSolanaConfig();
  const demoWallet = "DemoWallet1111111111111111111111111";
  let audit = createDraftAudit({
    url: DEMO_SITE_PATH,
    useDemoSite: true,
    businessName: "დემო ბიზნესი",
    acknowledgedLimitations: true,
  });
  audit = { ...audit, auditId: "ac_demo_sample_001", isDemoFlow: true };
  audit = attachPayment(audit, createDemoPayment(audit.auditId, demoWallet));
  audit = {
    ...audit,
    payment: {
      ...audit.payment!,
      payer: demoWallet,
      recipient: config.recipient || audit.payment!.recipient,
    },
  };
  audit = await runAuditPipeline(audit);
  const mock = new MockAIProvider();
  audit = {
    ...audit,
    explanations: await mock.explainViolations(audit.auditResult!.violations, {
      auditedUrl: DEMO_SITE_PATH,
      businessName: "დემო ბიზნესი",
    }),
  };
  audit = createReportHashForAudit(audit);
  audit = attachAttestation(
    audit,
    createDemoAttestation({
      auditId: audit.auditId,
      reportHash: audit.currentHash!,
      wallet: demoWallet,
    }),
  );
  return audit;
}
