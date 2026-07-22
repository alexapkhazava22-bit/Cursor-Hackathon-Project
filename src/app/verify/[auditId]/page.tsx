"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DemoModeBanner } from "@/components/shared/notices";
import { getAudit, saveAudit } from "@/lib/storage/audit-store";
import { verifyCertificate } from "@/lib/certificate/verify";
import { explorerTxUrl } from "@/lib/config";
import { formatDateKa, shortAddress } from "@/lib/utils/cn";
import type { AuditRecord } from "@/lib/types";
import type { CertificateVerificationResult } from "@/lib/certificate/verify";

const STATE_STYLES: Record<string, string> = {
  Verified: "bg-emerald-100 text-emerald-800",
  Modified: "bg-amber-100 text-amber-900",
  Pending: "bg-sky-100 text-sky-900",
  Unavailable: "bg-slate-100 text-slate-800",
  Invalid: "bg-red-100 text-red-800",
};

export default function VerifyPage() {
  const params = useParams<{ auditId: string }>();
  const auditId = typeof params.auditId === "string" ? params.auditId : "";
  const [ready, setReady] = useState(false);
  const [audit, setAudit] = useState<AuditRecord | null>(null);
  const [result, setResult] = useState<CertificateVerificationResult | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const runVerify = useCallback(async (record: AuditRecord) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await verifyCertificate(record);
      setResult(res);
      setMessage(`განახლდა · ${res.state}`);
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Verification failed",
      );
    } finally {
      setBusy(false);
    }
  }, []);

  const loadAndVerify = useCallback(async () => {
    if (!auditId) return;
    setBusy(true);
    setMessage(null);
    try {
      let found = getAudit(auditId);
      if (!found && auditId === "ac_demo_sample_001") {
        const { seedSampleAudit } = await import("@/lib/audit/pipeline");
        found = await seedSampleAudit();
        saveAudit(found);
      }
      setAudit(found);
      if (found) {
        const res = await verifyCertificate(found);
        setResult(res);
      } else {
        setResult(null);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Load failed");
    } finally {
      setBusy(false);
      setReady(true);
    }
  }, [auditId]);

  useEffect(() => {
    void loadAndVerify();
  }, [loadAndVerify]);

  async function handleRetry() {
    // Always re-read storage so retry is meaningful after other tabs change data
    const fresh = getAudit(auditId);
    if (!fresh) {
      setAudit(null);
      setResult(null);
      setMessage("აუდიტი ვერ მოიძებნა localStorage-ში");
      return;
    }
    setAudit(fresh);
    await runVerify(fresh);
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="display text-4xl text-[var(--ink)]">გადამოწმება</h1>
        <p className="mt-3 text-[var(--muted)]">იტვირთება…</p>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <h1 className="display text-3xl">Certificate verification</h1>
        <p className="mt-3 text-[var(--muted)]">
          Audit <code>{auditId}</code> was not found in local storage on this
          device.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/audit/new">Start an audit</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/history">ისტორია</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="display text-4xl text-[var(--ink)]">გადამოწმება</h1>
      <p className="mt-2 text-[var(--muted)]">/verify/{audit.auditId}</p>

      {result?.isDemoMock && (
        <div className="mt-4">
          <DemoModeBanner label="Verification used demo mock attestation" />
        </div>
      )}

      {result && (
        <div className="mt-6 rounded-xl border border-[var(--line)] bg-white/90 p-5">
          <Badge className={STATE_STYLES[result.state] ?? ""}>
            {result.state}
          </Badge>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-[var(--muted)]">Expected hash</dt>
              <dd className="break-all font-mono text-xs">
                {result.expectedHash}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Calculated hash</dt>
              <dd className="break-all font-mono text-xs">
                {result.calculatedHash}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Transaction signature</dt>
              <dd className="break-all font-mono text-xs">
                {result.transactionSignature ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Wallet</dt>
              <dd className="font-mono text-xs">
                {shortAddress(result.wallet ?? "—", 6)}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Network</dt>
              <dd>{result.network}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Verification time</dt>
              <dd>{formatDateKa(result.verificationTime)}</dd>
            </div>
          </dl>

          {result.transactionSignature &&
            !result.transactionSignature.startsWith("demo_") && (
              <a
                className="ac-btn ac-btn--outline ac-btn--sm mt-4"
                href={explorerTxUrl(result.transactionSignature)}
                target="_blank"
                rel="noreferrer"
              >
                Open in Solana Explorer
              </a>
            )}

          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
            {result.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      )}

      {message && (
        <p className="mt-4 text-sm text-[var(--brand)]" role="status">
          {message}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => void handleRetry()}
          disabled={busy}
          variant="secondary"
        >
          {busy ? "Verifying…" : "Retry verification"}
        </Button>
        <Button asChild variant="outline">
          <Link href={`/audit/${audit.auditId}/certificate`}>Certificate</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href={`/audit/${audit.auditId}/report`}>Report</Link>
        </Button>
      </div>
    </div>
  );
}
