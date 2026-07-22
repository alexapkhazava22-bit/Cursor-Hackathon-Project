import type { AuditRecord, CertificateStatus } from "@/lib/types";
import { LIMITATION_NOTICE_KA } from "@/lib/types";
import { explorerTxUrl, getSolanaConfig } from "@/lib/config";

export interface CertificateViewModel {
  brand: string;
  title: string;
  businessName?: string;
  auditedDomain: string;
  auditId: string;
  auditDate: string;
  issueSummary: {
    total: number;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
  reportHash: string;
  payerWallet?: string;
  paymentSignature?: string;
  attestationSignature?: string;
  networkBadge: string;
  paymentExplorerUrl?: string;
  attestationExplorerUrl?: string;
  verificationUrl: string;
  statuses: CertificateStatus[];
  limitationsNotice: string;
  isDemoMock: boolean;
}

export function buildCertificateViewModel(
  audit: AuditRecord,
  origin?: string,
): CertificateViewModel {
  const config = getSolanaConfig();
  const base = origin ?? config.appUrl;
  const domain = audit.meta.url.replace(/^https?:\/\//, "");
  const counts = audit.auditResult?.severityCounts;
  const statuses: CertificateStatus[] = [];

  if (audit.payment?.status === "confirmed") {
    statuses.push("PAYMENT_VERIFIED");
  }
  if (
    audit.attestation?.status === "confirmed" ||
    audit.state === "VERIFIED"
  ) {
    statuses.push("REPORT_HASH_ANCHORED");
    statuses.push("REPORT_INTEGRITY_VERIFIED");
  } else if (audit.attestation?.status === "pending") {
    statuses.push("PENDING");
  } else if (audit.attestation?.status === "demo_mock") {
    statuses.push("REPORT_HASH_ANCHORED");
  }

  if (audit.certificateStatuses.includes("MODIFIED")) {
    statuses.push("MODIFIED");
  }

  return {
    brand: "AccessChain",
    title: "Automated Accessibility Audit — Report Integrity Verified on Solana",
    businessName: audit.meta.businessName,
    auditedDomain: domain,
    auditId: audit.auditId,
    auditDate: audit.auditResult?.timestamp ?? audit.createdAt,
    issueSummary: {
      total: audit.auditResult?.totalIssues ?? 0,
      critical: counts?.CRITICAL ?? 0,
      serious: counts?.SERIOUS ?? 0,
      moderate: counts?.MODERATE ?? 0,
      minor: counts?.MINOR ?? 0,
    },
    reportHash: audit.currentHash ?? "—",
    payerWallet: audit.payment?.payer ?? audit.attestation?.wallet,
    paymentSignature: audit.payment?.signature,
    attestationSignature: audit.attestation?.signature,
    networkBadge: "Solana Devnet",
    paymentExplorerUrl:
      audit.payment?.signature && !audit.payment.isDemoMock
        ? explorerTxUrl(audit.payment.signature)
        : undefined,
    attestationExplorerUrl:
      audit.attestation?.signature && !audit.attestation.isDemoMock
        ? explorerTxUrl(audit.attestation.signature)
        : undefined,
    verificationUrl: `${base}/verify/${audit.auditId}`,
    statuses: statuses.length ? statuses : audit.certificateStatuses,
    limitationsNotice: LIMITATION_NOTICE_KA,
    isDemoMock: Boolean(
      audit.payment?.isDemoMock || audit.attestation?.isDemoMock,
    ),
  };
}
