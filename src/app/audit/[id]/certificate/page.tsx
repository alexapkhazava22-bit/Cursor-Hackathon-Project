"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DemoModeBanner, LimitationNotice } from "@/components/shared/notices";
import { getAudit, saveAudit } from "@/lib/storage/audit-store";
import { buildCertificateViewModel } from "@/lib/certificate/build";
import { formatDateKa, shortAddress } from "@/lib/utils/cn";
import type { AuditRecord } from "@/lib/types";

export default function CertificatePage() {
  const params = useParams<{ id: string }>();
  const [ready, setReady] = useState(false);
  const [audit, setAudit] = useState<AuditRecord | null>(null);
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      let found = getAudit(params.id);
      if (!found && params.id === "ac_demo_sample_001") {
        const { seedSampleAudit } = await import("@/lib/audit/pipeline");
        found = await seedSampleAudit();
        saveAudit(found);
      }
      setAudit(found);
      setReady(true);
    }
    void load();
  }, [params.id]);

  useEffect(() => {
    if (!audit) return;
    const vm = buildCertificateViewModel(
      audit,
      typeof window !== "undefined" ? window.location.origin : undefined,
    );
    void QRCode.toDataURL(vm.verificationUrl, { margin: 1, width: 160 }).then(setQr);
  }, [audit]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <p className="text-[var(--muted)]">სერტიფიკატი იტვირთება…</p>
      </div>
    );
  }

  if (!audit?.auditResult) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <p>სერტიფიკატი ჯერ არ არის მზად.</p>
        <Button asChild className="mt-4">
          <Link href="/audit/new">ახალი აუდიტი</Link>
        </Button>
      </div>
    );
  }

  const vm = buildCertificateViewModel(
    audit,
    typeof window !== "undefined" ? window.location.origin : undefined,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {vm.isDemoMock && (
        <div className="mb-4">
          <DemoModeBanner label="Certificate includes demo mock chain evidence" />
        </div>
      )}

      <article className="overflow-hidden rounded-2xl border-2 border-[var(--brand)] bg-white shadow-lg">
        <div className="bg-[var(--brand)] px-6 py-5 text-white sm:px-8">
          <p className="text-xs uppercase tracking-[0.22em] text-white/70">
            {vm.brand}
          </p>
          <h1 className="display mt-2 text-2xl sm:text-3xl">{vm.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge className="bg-white/15 text-white">{vm.networkBadge}</Badge>
            {vm.statuses.map((s) => (
              <Badge key={s} className="bg-[var(--accent)] text-white">
                {s.replaceAll("_", " ")}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid gap-6 px-6 py-6 sm:px-8 md:grid-cols-[1fr_auto]">
          <div className="space-y-3 text-sm">
            {vm.businessName && (
              <p>
                <span className="text-[var(--muted)]">Business:</span>{" "}
                <strong>{vm.businessName}</strong>
              </p>
            )}
            <p>
              <span className="text-[var(--muted)]">Audited domain:</span>{" "}
              <strong>{vm.auditedDomain}</strong>
            </p>
            <p>
              <span className="text-[var(--muted)]">Audit ID:</span>{" "}
              <span className="font-mono text-xs">{vm.auditId}</span>
            </p>
            <p>
              <span className="text-[var(--muted)]">Audit date:</span>{" "}
              {formatDateKa(vm.auditDate)}
            </p>
            <p>
              <span className="text-[var(--muted)]">Automated issues:</span>{" "}
              {vm.issueSummary.total} (C{vm.issueSummary.critical}/S
              {vm.issueSummary.serious}/M{vm.issueSummary.moderate}/m
              {vm.issueSummary.minor})
            </p>
            <p>
              <span className="text-[var(--muted)]">Report SHA-256:</span>
              <br />
              <span className="break-all font-mono text-xs">{vm.reportHash}</span>
            </p>
            <p>
              <span className="text-[var(--muted)]">Payer / attester:</span>{" "}
              <span className="font-mono text-xs">
                {shortAddress(vm.payerWallet ?? "—", 6)}
              </span>
            </p>
            <p>
              <span className="text-[var(--muted)]">Payment tx:</span>{" "}
              <span className="break-all font-mono text-xs">
                {vm.paymentSignature ?? "—"}
              </span>
              {vm.paymentExplorerUrl && (
                <>
                  {" "}
                  <a className="underline" href={vm.paymentExplorerUrl} target="_blank" rel="noreferrer">
                    Explorer
                  </a>
                </>
              )}
            </p>
            <p>
              <span className="text-[var(--muted)]">Attestation tx:</span>{" "}
              <span className="break-all font-mono text-xs">
                {vm.attestationSignature ?? "—"}
              </span>
              {vm.attestationExplorerUrl && (
                <>
                  {" "}
                  <a className="underline" href={vm.attestationExplorerUrl} target="_blank" rel="noreferrer">
                    Explorer
                  </a>
                </>
              )}
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            {qr && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} alt="Verification QR code" className="rounded-lg border border-[var(--line)]" />
            )}
            <a className="text-xs underline" href={vm.verificationUrl}>
              Verification URL
            </a>
          </div>
        </div>

        <div className="border-t border-[var(--line)] px-6 py-4 sm:px-8">
          <LimitationNotice />
          <p className="mt-3 text-xs text-[var(--muted)]">
            Solana attestation proves report integrity and transaction history —
            not that accessibility conclusions are correct. This is not a WCAG
            Certified, Government Approved, or Official Compliance Certificate.
          </p>
        </div>
      </article>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild variant="secondary">
          <Link href={`/verify/${audit.auditId}`}>Open verification</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/audit/${audit.auditId}/report`}>Back to report</Link>
        </Button>
      </div>
    </div>
  );
}
