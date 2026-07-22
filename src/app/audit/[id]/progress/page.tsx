"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAudit, saveAudit } from "@/lib/storage/audit-store";
import {
  createReportHashForAudit,
  runAuditPipeline,
} from "@/lib/audit/pipeline";
import type { AuditRecord } from "@/lib/types";

const STEPS = [
  "Payment confirmed",
  "Running axe-core audit",
  "Generating AI explanations",
  "Creating canonical report",
  "Calculating SHA-256 hash",
];

export default function ProgressPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [audit, setAudit] = useState<AuditRecord | null>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const found = getAudit(params.id);
    setAudit(found);
  }, [params.id]);

  useEffect(() => {
    if (!audit) return;

    const alreadyDone = [
      "AUDIT_COMPLETE",
      "HASH_CREATED",
      "ATTESTATION_REQUIRED",
      "ATTESTATION_PENDING",
      "VERIFIED",
    ].includes(audit.state);

    if (alreadyDone) {
      router.replace(`/audit/${audit.auditId}/report`);
      return;
    }

    const canRun =
      audit.state === "PAYMENT_CONFIRMED" ||
      audit.state === "AUDIT_RUNNING" ||
      (audit.isDemoFlow &&
        audit.payment &&
        (audit.payment.status === "confirmed" ||
          audit.payment.status === "demo_mock"));

    if (!canRun) {
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setStep(0);
        await delay(400);
        if (cancelled) return;
        setStep(1);
        let next = await runAuditPipeline({
          ...audit,
          state:
            audit.state === "PAYMENT_CONFIRMED" || audit.state === "AUDIT_RUNNING"
              ? audit.state
              : "PAYMENT_CONFIRMED",
        });
        if (cancelled) return;
        setStep(2);
        await delay(350);
        setStep(3);
        next = createReportHashForAudit(next);
        setStep(4);
        saveAudit(next);
        setAudit(next);
        await delay(400);
        if (!cancelled) {
          router.push(`/audit/${next.auditId}/report`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Audit failed");
      }
    })();

    return () => {
      cancelled = true;
    };
    // intentionally run once when audit id / gate state is ready
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audit?.auditId, audit?.state]);

  if (!audit) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <p>აუდიტი ვერ მოიძებნა.</p>
        <Button asChild className="mt-4">
          <Link href="/audit/new">ახალი აუდიტი</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <h1 className="display text-4xl text-[var(--ink)]">აუდიტი მიმდინარეობს</h1>
      <p className="mt-2 text-[var(--muted)]">
        Deterministic axe-core · AI explanation · canonical SHA-256
      </p>
      <ul className="mt-8 space-y-3">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
              i <= step
                ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                : "border-[var(--line)] bg-white/70 text-[var(--muted)]"
            }`}
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-xs font-bold">
              {i < step ? "✓" : i + 1}
            </span>
            {label}
          </li>
        ))}
      </ul>
      {error && (
        <div className="mt-6 text-sm text-[var(--danger)]">
          <p>{error}</p>
          <Button asChild className="mt-3" variant="secondary">
            <Link href={`/audit/${audit.auditId}/payment`}>Back to payment</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
