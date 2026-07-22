import { describe, expect, it } from "vitest";
import {
  createPaymentMemo,
  createReportAttestationMemo,
  parsePaymentMemo,
  parseReportAttestationMemo,
  verifyPaymentMemo,
  verifyReportAttestationMemo,
} from "@/lib/solana/memo";

describe("memo creation & verification", () => {
  it("creates and verifies payment memo", () => {
    const memo = createPaymentMemo("ac_20260722_abc123");
    expect(memo).toBe("ACCESSCHAIN_PAYMENT|v1|audit:ac_20260722_abc123");
    expect(verifyPaymentMemo(memo, "ac_20260722_abc123")).toBe(true);
    expect(verifyPaymentMemo(memo, "other")).toBe(false);
    expect(parsePaymentMemo(memo)?.auditId).toBe("ac_20260722_abc123");
  });

  it("creates and verifies report attestation memo", () => {
    const hash = "a".repeat(64);
    const memo = createReportAttestationMemo("ac_1", hash);
    expect(memo).toBe(`ACCESSCHAIN_REPORT|v1|audit:ac_1|sha256:${hash}`);
    expect(verifyReportAttestationMemo(memo, "ac_1", hash)).toBe(true);
    expect(verifyReportAttestationMemo(memo, "ac_1", "b".repeat(64))).toBe(false);
    expect(parseReportAttestationMemo(memo)?.reportHash).toBe(hash);
  });
});
