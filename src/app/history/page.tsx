"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listAudits, resetAllAudits, saveAudit } from "@/lib/storage/audit-store";
import { formatDateKa } from "@/lib/utils/cn";
import type { AuditRecord } from "@/lib/types";
import { useI18n } from "@/lib/i18n/context";

export default function HistoryPage() {
  const { t } = useI18n();
  const [ready, setReady] = useState(false);
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [busy, setBusy] = useState(false);

  function refresh() {
    setAudits(listAudits());
  }

  useEffect(() => {
    refresh();
    setReady(true);
  }, []);

  async function loadSample() {
    setBusy(true);
    try {
      const { seedSampleAudit } = await import("@/lib/audit/pipeline");
      const sample = await seedSampleAudit();
      saveAudit(sample);
      refresh();
    } finally {
      setBusy(false);
    }
  }

  function resetDemo() {
    resetAllAudits();
    refresh();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="display text-4xl text-[var(--ink)]">{t("historyTitle")}</h1>
          <p className="mt-2 text-[var(--muted)]">{t("historySupport")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/audit/new">{t("navNewAudit")}</Link>
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => void loadSample()}
          >
            {busy ? t("loading") : t("useSampleAudit")}
          </Button>
          <Button type="button" variant="outline" onClick={resetDemo}>
            {t("resetDemo")}
          </Button>
        </div>
      </div>

      <ul className="mt-8 space-y-3">
        {!ready && (
          <li className="ac-surface rounded-xl border border-[var(--line)] p-6 text-[var(--muted)]">
            {t("loading")}
          </li>
        )}
        {ready && audits.length === 0 && (
          <li className="ac-surface rounded-xl border border-dashed border-[var(--line)] p-6 text-[var(--muted)]">
            {t("historyEmpty")}
          </li>
        )}
        {audits.map((a) => (
          <li
            key={a.auditId}
            className="ac-surface flex flex-col gap-3 rounded-xl border border-[var(--line)] p-4 sm:flex-row sm:items-center sm:justify-between"
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
                <Link href={`/audit/${a.auditId}/report`}>{t("report")}</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/verify/${a.auditId}`}>{t("verify")}</Link>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
