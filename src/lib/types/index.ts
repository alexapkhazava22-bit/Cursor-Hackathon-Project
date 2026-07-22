/**
 * AccessChain shared domain types.
 */

export type Severity = "CRITICAL" | "SERIOUS" | "MODERATE" | "MINOR";

export type AuditState =
  | "DRAFT"
  | "WALLET_REQUIRED"
  | "PAYMENT_REQUIRED"
  | "PAYMENT_PENDING"
  | "PAYMENT_CONFIRMED"
  | "AUDIT_RUNNING"
  | "AUDIT_COMPLETE"
  | "HASH_CREATED"
  | "ATTESTATION_REQUIRED"
  | "ATTESTATION_PENDING"
  | "VERIFIED"
  | "FAILED";

export type PaymentStatus =
  | "idle"
  | "pending"
  | "confirmed"
  | "failed"
  | "demo_mock";

export type AttestationStatus =
  | "idle"
  | "pending"
  | "confirmed"
  | "failed"
  | "demo_mock";

export type CertificateStatus =
  | "PAYMENT_VERIFIED"
  | "REPORT_HASH_ANCHORED"
  | "REPORT_INTEGRITY_VERIFIED"
  | "MODIFIED"
  | "PENDING"
  | "UNAVAILABLE"
  | "INVALID";

export type VerificationResultState =
  | "Verified"
  | "Modified"
  | "Pending"
  | "Unavailable"
  | "Invalid";

export interface SeverityCounts {
  CRITICAL: number;
  SERIOUS: number;
  MODERATE: number;
  MINOR: number;
}

export interface AffectedNode {
  target: string[];
  html?: string;
  failureSummary?: string;
  xpath?: string[];
}

export interface AuditViolation {
  id: string;
  ruleId: string;
  help: string;
  description: string;
  impact: Severity;
  helpUrl?: string;
  tags: string[];
  wcagReferences: string[];
  nodes: AffectedNode[];
  failureSummary?: string;
}

export interface DeterministicAuditResult {
  engineName: string;
  engineVersion: string;
  auditedUrl: string;
  timestamp: string;
  violations: AuditViolation[];
  passes: number;
  incomplete: number;
  inapplicable: number;
  totalIssues: number;
  severityCounts: SeverityCounts;
  limitations: string[];
  healthScore?: number;
  healthScoreLabel?: string;
}

export interface OwnerExplanation {
  problemKa: string;
  whoAffectedKa: string;
  businessImpactKa: string;
  priorityKa: string;
  difficultyKa: string;
  askDeveloperKa: string;
  retestKa: string;
}

export interface DeveloperExplanation {
  technicalCause: string;
  affectedElement: string;
  suggestedFix: string;
  codeExample?: string;
  acceptanceCriteria: string[];
  retestingSteps: string[];
  selector?: string;
  wcagReference?: string;
  severity: Severity;
  ruleId: string;
}

export interface ExplainedIssue {
  violationId: string;
  ruleId: string;
  impact: Severity;
  owner: OwnerExplanation;
  developer: DeveloperExplanation;
  source: "ai" | "fallback";
}

export interface AIExplanationResult {
  issues: ExplainedIssue[];
  provider: string;
  generatedAt: string;
  usedFallback: boolean;
}

export interface CanonicalReport {
  schemaVersion: string;
  auditId: string;
  reportVersion: number;
  normalizedUrl: string;
  auditTimestamp: string;
  auditEngine: {
    name: string;
    version: string;
  };
  violations: AuditViolation[];
  severityCounts: SeverityCounts;
  paymentTransactionSignature: string;
  payerWallet: string;
  solanaCluster: string;
  reportGenerationVersion: string;
}

export interface PaymentRecord {
  status: PaymentStatus;
  signature?: string;
  amountSol: number;
  recipient: string;
  payer?: string;
  memo: string;
  network: string;
  confirmedAt?: string;
  isDemoMock: boolean;
  error?: string;
}

export interface AttestationRecord {
  status: AttestationStatus;
  signature?: string;
  reportHash: string;
  memo: string;
  wallet?: string;
  cluster: string;
  slot?: number;
  blockTime?: number;
  confirmedAt?: string;
  isDemoMock: boolean;
  error?: string;
}

export interface AuditRequestMeta {
  businessName?: string;
  email?: string;
  url: string;
  useDemoSite: boolean;
  acknowledgedLimitations: boolean;
}

export interface AuditRecord {
  auditId: string;
  state: AuditState;
  createdAt: string;
  updatedAt: string;
  meta: AuditRequestMeta;
  payment?: PaymentRecord;
  auditResult?: DeterministicAuditResult;
  explanations?: AIExplanationResult;
  reportVersion: number;
  reportVersions: CanonicalReportVersion[];
  currentHash?: string;
  attestation?: AttestationRecord;
  certificateStatuses: CertificateStatus[];
  failureReason?: string;
  isDemoFlow: boolean;
}

export interface CanonicalReportVersion {
  version: number;
  createdAt: string;
  report: CanonicalReport;
  hash: string;
  attestation?: AttestationRecord;
  superseded: boolean;
}

export interface FeatureFlags {
  demoMode: boolean;
  enableSolana: boolean;
  enableRealAi: boolean;
  enableExternalAudit: boolean;
}

export const LIMITATION_NOTICE_KA =
  "ავტომატური აუდიტი ვერ აღმოაჩენს accessibility პრობლემების 100%-ს. შედეგი წარმოადგენს ავტომატურ ტექნიკურ შეფასებას და არა ოფიციალურ იურიდიულ სერტიფიცირებას.";

export const REPORT_GENERATION_VERSION = "1.0.0";
export const CANONICAL_SCHEMA_VERSION = "1.0.0";
export const DEMO_SITE_PATH = "/demo/inaccessible";
export const DEMO_SITE_LABEL = "AccessChain Demo (local inaccessible site)";
