"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listAudits, resetAllAudits, saveAudit } from "@/lib/storage/audit-store";
import { formatDateKa } from "@/lib/utils/cn";
import type { AuditRecord } from "@/lib/types";

export default function HistoryPage() {
  const [audits, setAudits] = useState<AuditRecord[]>([]);

  function refresh() {
    setAudits(listAudits());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function loadSample() {
    const { seedSampleAudit } = await import("@/lib/audit/pipeline");
    const sample = await seedSampleAudit();
    saveAudit(sample);
    refresh();
  }

  function resetDemo() {
    resetAllAudits();
    refresh();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="display text-4xl text-[var(--ink)]">აუდიტების ისტორია</h1>
          <p className="mt-2 text-[var(--muted)]">
            ლოკალური შენახვა ამ მოწყობილობაზე (localStorage).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/audit/new">ახალი აუდიტი</Link>
          </Button>
          <Button variant="secondary" onClick={loadSample}>
            Use sample audit
          </Button>
          <Button variant="outline" onClick={resetDemo}>
            Reset demo
          </Button>
        </div>
      </div>

      <ul className="mt-8 space-y-3">
        {audits.length === 0 && (
          <li className="rounded-xl border border-dashed border-[var(--line)] bg-white/70 p-6 text-[var(--muted)]">
            ჯერ არ არის აუდიტი. დაიწყეთ ახალი ან ჩატვირთეთ sample audit.
          </li>
        )}
        {audits.map((a) => (
          <li
            key={a.auditId}
            className="flex flex-col gap-3 rounded-xl border border-[var(--line)] bg-white/90 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold">{a.meta.url}</p>
              <p className="mt-1 font-mono text-xs text-[var(--muted)]">
                {a.auditId}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {formatDateKa(a.updatedAt)}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge className="bg-[var(--brand-soft)] text-[var(--brand)]">
                  {a.state}
                </Badge>
                {a.isDemoFlow && (
                  <Badge className="bg-[var(--accent-soft)] text-[var(--warn)]">
                    DEMO
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="secondary">
                <Link href={`/audit/${a.auditId}/report`}>Report</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/verify/${a.auditId}`}>Verify</Link>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
