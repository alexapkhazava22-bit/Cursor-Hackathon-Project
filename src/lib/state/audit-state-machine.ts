import type { AuditState } from "@/lib/types";

const ALLOWED_TRANSITIONS: Record<AuditState, readonly AuditState[]> = {
  DRAFT: ["WALLET_REQUIRED", "PAYMENT_REQUIRED", "FAILED"],
  WALLET_REQUIRED: ["PAYMENT_REQUIRED", "FAILED"],
  PAYMENT_REQUIRED: ["PAYMENT_PENDING", "FAILED"],
  PAYMENT_PENDING: ["PAYMENT_CONFIRMED", "PAYMENT_REQUIRED", "FAILED"],
  PAYMENT_CONFIRMED: ["AUDIT_RUNNING", "FAILED"],
  AUDIT_RUNNING: ["AUDIT_COMPLETE", "FAILED"],
  AUDIT_COMPLETE: ["HASH_CREATED", "FAILED"],
  HASH_CREATED: ["ATTESTATION_REQUIRED", "FAILED"],
  ATTESTATION_REQUIRED: ["ATTESTATION_PENDING", "FAILED"],
  ATTESTATION_PENDING: ["VERIFIED", "ATTESTATION_REQUIRED", "FAILED"],
  VERIFIED: ["ATTESTATION_REQUIRED", "FAILED"],
  FAILED: ["DRAFT", "PAYMENT_REQUIRED", "ATTESTATION_REQUIRED"],
};

export function canTransition(from: AuditState, to: AuditState): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertTransition(from: AuditState, to: AuditState): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid audit state transition: ${from} → ${to}`);
  }
}

export function transition(
  from: AuditState,
  to: AuditState,
  options?: { demoMode?: boolean; force?: boolean },
): AuditState {
  if (options?.force) {
    return to;
  }

  // DEMO_MODE may skip payment confirmation for sample flows only when
  // explicitly jumping from DRAFT/PAYMENT_* into audit — callers must set isDemoFlow.
  if (
    options?.demoMode &&
    (from === "DRAFT" ||
      from === "WALLET_REQUIRED" ||
      from === "PAYMENT_REQUIRED" ||
      from === "PAYMENT_PENDING") &&
    (to === "PAYMENT_CONFIRMED" || to === "AUDIT_RUNNING")
  ) {
    return to;
  }

  assertTransition(from, to);
  return to;
}

export function isPaymentConfirmed(state: AuditState): boolean {
  const gated: AuditState[] = [
    "PAYMENT_CONFIRMED",
    "AUDIT_RUNNING",
    "AUDIT_COMPLETE",
    "HASH_CREATED",
    "ATTESTATION_REQUIRED",
    "ATTESTATION_PENDING",
    "VERIFIED",
  ];
  return gated.includes(state);
}

export function canStartAudit(
  state: AuditState,
  options?: { demoMode?: boolean; isDemoFlow?: boolean },
): boolean {
  if (state === "PAYMENT_CONFIRMED" || state === "AUDIT_RUNNING") {
    return true;
  }
  if (options?.demoMode && options?.isDemoFlow) {
    const demoAllowed: AuditState[] = [
      "DRAFT",
      "WALLET_REQUIRED",
      "PAYMENT_REQUIRED",
      "PAYMENT_PENDING",
      "PAYMENT_CONFIRMED",
    ];
    return demoAllowed.includes(state);
  }
  return false;
}

export function isCertificateVerified(state: AuditState): boolean {
  return state === "VERIFIED";
}

export function requiresNewAttestationAfterReportChange(
  previousState: AuditState,
): boolean {
  return (
    previousState === "VERIFIED" ||
    previousState === "ATTESTATION_PENDING" ||
    previousState === "HASH_CREATED" ||
    previousState === "ATTESTATION_REQUIRED"
  );
}
