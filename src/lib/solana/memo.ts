export function createPaymentMemo(auditId: string): string {
  return `ACCESSCHAIN_PAYMENT|v1|audit:${auditId}`;
}

export function createReportAttestationMemo(
  auditId: string,
  reportHash: string,
): string {
  return `ACCESSCHAIN_REPORT|v1|audit:${auditId}|sha256:${reportHash}`;
}

export function parsePaymentMemo(
  memo: string,
): { version: string; auditId: string } | null {
  const match = /^ACCESSCHAIN_PAYMENT\|(v\d+)\|audit:([a-zA-Z0-9_-]+)$/.exec(
    memo.trim(),
  );
  if (!match) return null;
  return { version: match[1], auditId: match[2] };
}

export function parseReportAttestationMemo(
  memo: string,
): { version: string; auditId: string; reportHash: string } | null {
  const match =
    /^ACCESSCHAIN_REPORT\|(v\d+)\|audit:([a-zA-Z0-9_-]+)\|sha256:([a-f0-9]{64})$/.exec(
      memo.trim(),
    );
  if (!match) return null;
  return {
    version: match[1],
    auditId: match[2],
    reportHash: match[3],
  };
}

export function verifyPaymentMemo(
  memo: string,
  expectedAuditId: string,
): boolean {
  const parsed = parsePaymentMemo(memo);
  return Boolean(parsed && parsed.auditId === expectedAuditId);
}

export function verifyReportAttestationMemo(
  memo: string,
  expectedAuditId: string,
  expectedHash: string,
): boolean {
  const parsed = parseReportAttestationMemo(memo);
  return Boolean(
    parsed &&
      parsed.auditId === expectedAuditId &&
      parsed.reportHash === expectedHash.toLowerCase(),
  );
}
