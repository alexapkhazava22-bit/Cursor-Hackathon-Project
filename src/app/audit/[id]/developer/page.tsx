"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAudit, saveAudit } from "@/lib/storage/audit-store";
import { MockAIProvider } from "@/lib/ai/provider";
import type { AuditRecord } from "@/lib/types";
import { useI18n } from "@/lib/i18n/context";

export default function DeveloperFixPlanPage() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const auditId = typeof params.id === "string" ? params.id : "";
  const [audit, setAudit] = useState<AuditRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auditId) return;
    let cancelled = false;

    async function load() {
      setError(null);
      try {
        let found = getAudit(auditId);
        if (!found && auditId === "ac_demo_sample_001") {
          const { seedSampleAudit } = await import("@/lib/audit/pipeline");
          found = await seedSampleAudit();
          saveAudit(found);
        }
        if (
          found?.auditResult &&
          (!found.explanations || found.explanations.issues.length === 0)
        ) {
          const mock = new MockAIProvider();
          found = {
            ...found,
            explanations: await mock.explainViolations(
              found.auditResult.violations,
              {
                auditedUrl: found.meta.url,
                businessName: found.meta.businessName,
              },
            ),
          };
          saveAudit(found);
        }
        if (!cancelled) setAudit(found);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load fix plan");
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [auditId]);

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <p className="text-[var(--danger)]">{error}</p>
        <Button asChild className="mt-4" variant="secondary">
          <Link href={`/audit/${auditId}/report`} prefetch={false}>
            {t("backToReport")}
          </Link>
        </Button>
      </div>
    );
  }

  if (!audit?.explanations) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <p>{t("fixPlanNotReady")}</p>
        <Button asChild className="mt-4">
          <Link href={auditId ? `/audit/${auditId}/report` : "/history"} prefetch={false}>
            {t("backToReport")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
        {t("developerFixPlan")}
      </p>
      <h1 className="display mt-2 text-4xl text-[var(--ink)]">{t("developerTitle")}</h1>
      <p className="mt-2 text-[var(--muted)]">
        {t("affectedUrl")}: {audit.meta.url} · {t("developerSupport")}
      </p>
      <div className="mt-6 flex gap-2">
        <Button asChild variant="secondary">
          <Link href={`/audit/${audit.auditId}/report`} prefetch={false}>
            Report
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/audit/${audit.auditId}/certificate`} prefetch={false}>
            Certificate
          </Link>
        </Button>
      </div>

      <div className="mt-8 space-y-5">
        {audit.explanations.issues.map((issue, idx) => (
          <article
            key={issue.violationId}
            className="rounded-xl border border-[var(--line)] bg-white/90 p-5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[var(--muted)]">#{idx + 1}</span>
              <Badge className="bg-[var(--brand-soft)] text-[var(--brand)]">
                {issue.developer.ruleId}
              </Badge>
              <Badge className="bg-[var(--accent-soft)] text-[var(--warn)]">
                {issue.developer.severity}
              </Badge>
            </div>
            <h2 className="display mt-3 text-2xl">{t("affectedElement")}</h2>
            <p className="mt-1 font-mono text-xs break-all">
              {issue.developer.affectedElement}
            </p>
            {issue.developer.selector && (
              <p className="mt-2 text-sm">
                {t("selector")}:{" "}
                <code className="rounded bg-[var(--brand-soft)] px-1">
                  {issue.developer.selector}
                </code>
              </p>
            )}
            <h3 className="mt-4 font-semibold">{t("violatedRule")}</h3>
            <p className="text-sm">
              {issue.ruleId}
              {issue.developer.wcagReference
                ? ` · ${issue.developer.wcagReference}`
                : ""}
            </p>
            <h3 className="mt-4 font-semibold">{t("technicalExplanation")}</h3>
            <p>{issue.developer.technicalCause}</p>
            <h3 className="mt-4 font-semibold">{t("suggestedFix")}</h3>
            <p>{issue.developer.suggestedFix}</p>
            {issue.developer.codeExample && (
              <>
                <h3 className="mt-4 font-semibold">{t("codeExample")}</h3>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-[#0f1c1e] p-3 text-xs text-white">
                  {issue.developer.codeExample}
                </pre>
              </>
            )}
            <h3 className="mt-4 font-semibold">{t("acceptanceCriteria")}</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {issue.developer.acceptanceCriteria.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <h3 className="mt-4 font-semibold">{t("retestingSteps")}</h3>
            <ol className="list-decimal space-y-1 pl-5 text-sm">
              {issue.developer.retestingSteps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </div>
  );
}
