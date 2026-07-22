import { describe, expect, it } from "vitest";
import {
  canStartAudit,
  canTransition,
  isCertificateVerified,
  isPaymentConfirmed,
  transition,
} from "@/lib/state/audit-state-machine";

describe("audit state machine", () => {
  it("allows the happy-path transitions", () => {
    expect(canTransition("DRAFT", "WALLET_REQUIRED")).toBe(true);
    expect(canTransition("PAYMENT_REQUIRED", "PAYMENT_PENDING")).toBe(true);
    expect(canTransition("PAYMENT_PENDING", "PAYMENT_CONFIRMED")).toBe(true);
    expect(canTransition("PAYMENT_CONFIRMED", "AUDIT_RUNNING")).toBe(true);
    expect(canTransition("ATTESTATION_PENDING", "VERIFIED")).toBe(true);
  });

  it("blocks audit before payment confirmation", () => {
    expect(canStartAudit("PAYMENT_REQUIRED")).toBe(false);
    expect(canStartAudit("PAYMENT_CONFIRMED")).toBe(true);
  });

  it("allows demo mode sample flow to start audit", () => {
    expect(
      canStartAudit("PAYMENT_REQUIRED", { demoMode: true, isDemoFlow: true }),
    ).toBe(true);
  });

  it("payment confirmation gating", () => {
    expect(isPaymentConfirmed("PAYMENT_PENDING")).toBe(false);
    expect(isPaymentConfirmed("PAYMENT_CONFIRMED")).toBe(true);
    expect(isPaymentConfirmed("VERIFIED")).toBe(true);
  });

  it("certificate verified only after VERIFIED", () => {
    expect(isCertificateVerified("ATTESTATION_PENDING")).toBe(false);
    expect(isCertificateVerified("VERIFIED")).toBe(true);
  });

  it("rejects invalid transitions", () => {
    expect(() => transition("DRAFT", "VERIFIED")).toThrow(/Invalid audit state/);
  });

  it("failed payment does not unlock real audit via canStartAudit", () => {
    expect(canStartAudit("FAILED")).toBe(false);
  });
});
