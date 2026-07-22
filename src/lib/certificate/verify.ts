import { hashCanonicalReport } from "@/lib/report/canonical";
import { buildCanonicalReport } from "@/lib/report/build-report";
import {
  parseReportAttestationMemo,
  verifyReportAttestationMemo,
} from "@/lib/solana/memo";
import { fetchTransactionMemo } from "@/lib/solana/attestation";
import type {
  AuditRecord,
  CanonicalReport,
  VerificationResultState,
} from "@/lib/types";

export interface CertificateVerificationResult {
  state: VerificationResultState;
  expectedHash?: string;
  calculatedHash?: string;
  transactionSignature?: string;
  wallet?: string;
  network: string;
  verificationTime: string;
  memoOk?: boolean;
  notes: string[];
  isDemoMock?: boolean;
}

export function recalculateReportHash(report: CanonicalReport): string {
  return hashCanonicalReport(report);
}

export function detectReportModification(
  storedHash: string,
  report: CanonicalReport,
): boolean {
  return recalculateReportHash(report) !== storedHash.toLowerCase();
}

export async function verifyCertificate(
  audit: AuditRecord,
): Promise<CertificateVerificationResult> {
  const verificationTime = new Date().toISOString();
  const network = "devnet";
  const notes: string[] = [];

  const currentVersion = audit.reportVersions.find(
    (v) => v.version === audit.reportVersion && !v.superseded,
  ) ?? audit.reportVersions[audit.reportVersions.length - 1];

  if (!currentVersion) {
    return {
      state: "Invalid",
      network,
      verificationTime,
      notes: ["No stored report version found"],
    };
  }

  const expectedHash = (audit.currentHash ?? currentVersion.hash).toLowerCase();
  const calculatedHash = recalculateReportHash(currentVersion.report);

  if (calculatedHash !== expectedHash) {
    return {
      state: "Modified",
      expectedHash,
      calculatedHash,
      transactionSignature: audit.attestation?.signature,
      wallet: audit.attestation?.wallet ?? audit.payment?.payer,
      network,
      verificationTime,
      notes: [
        "Current report hash does not match the stored / anchored hash",
        "A new report version and attestation are required",
      ],
      isDemoMock: audit.attestation?.isDemoMock,
    };
  }

  const attestation = audit.attestation ?? currentVersion.attestation;
  if (!attestation?.signature) {
    return {
      state: "Pending",
      expectedHash,
      calculatedHash,
      network,
      verificationTime,
      notes: ["Attestation transaction not yet available"],
    };
  }

  if (attestation.isDemoMock || attestation.status === "demo_mock") {
    return {
      state: "Verified",
      expectedHash,
      calculatedHash,
      transactionSignature: attestation.signature,
      wallet: attestation.wallet,
      network,
      verificationTime,
      memoOk: verifyReportAttestationMemo(
        attestation.memo,
        audit.auditId,
        expectedHash,
      ),
      notes: [
        "DEMO MOCK attestation — not a real Solana verification",
        "Use a real wallet flow for blockchain-backed proof",
      ],
      isDemoMock: true,
    };
  }

  if (attestation.status === "pending") {
    return {
      state: "Pending",
      expectedHash,
      calculatedHash,
      transactionSignature: attestation.signature,
      wallet: attestation.wallet,
      network,
      verificationTime,
      notes: ["Attestation transaction is pending confirmation"],
    };
  }

  const fetched = await fetchTransactionMemo(attestation.signature);
  if (fetched.unavailable) {
    return {
      state: "Unavailable",
      expectedHash,
      calculatedHash,
      transactionSignature: attestation.signature,
      wallet: attestation.wallet,
      network,
      verificationTime,
      notes: [
        "RPC cannot currently verify the attestation",
        "Temporary RPC failure is NOT proof that the certificate is invalid",
      ],
    };
  }

  if (fetched.err) {
    return {
      state: "Invalid",
      expectedHash,
      calculatedHash,
      transactionSignature: attestation.signature,
      wallet: attestation.wallet,
      network,
      verificationTime,
      notes: ["On-chain transaction failed"],
    };
  }

  const memo = fetched.memo ?? attestation.memo;
  const memoOk = verifyReportAttestationMemo(memo, audit.auditId, expectedHash);
  if (!memoOk) {
    const parsed = parseReportAttestationMemo(memo ?? "");
    return {
      state: "Invalid",
      expectedHash,
      calculatedHash,
      transactionSignature: attestation.signature,
      wallet: attestation.wallet,
      network,
      verificationTime,
      memoOk: false,
      notes: [
        "Transaction memo does not match expected ACCESSCHAIN_REPORT reference",
        parsed
          ? `Parsed hash from memo: ${parsed.reportHash}`
          : "Memo could not be parsed",
      ],
    };
  }

  return {
    state: "Verified",
    expectedHash,
    calculatedHash,
    transactionSignature: attestation.signature,
    wallet: attestation.wallet,
    network,
    verificationTime,
    memoOk: true,
    notes: [
      "Report hash matches and attestation memo is confirmed on Solana Devnet",
      "Hash proves report integrity — not correctness of accessibility conclusions",
    ],
  };
}

export function rebuildCanonicalFromAudit(audit: AuditRecord): CanonicalReport | null {
  if (!audit.auditResult || !audit.payment?.signature || !audit.payment.payer) {
    return null;
  }
  return buildCanonicalReport({
    auditId: audit.auditId,
    reportVersion: audit.reportVersion,
    auditResult: audit.auditResult,
    paymentTransactionSignature: audit.payment.signature,
    payerWallet: audit.payment.payer,
    solanaCluster: "devnet",
  });
}
