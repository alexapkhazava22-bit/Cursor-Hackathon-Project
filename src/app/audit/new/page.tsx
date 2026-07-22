"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LimitationNotice } from "@/components/shared/notices";
import { createDraftAudit, moveToPayment } from "@/lib/audit/pipeline";
import { saveAudit } from "@/lib/storage/audit-store";
import { DEMO_SITE_PATH } from "@/lib/types";
import { getFeatureFlags } from "@/lib/config";
import { useI18n } from "@/lib/i18n/context";

export default function NewAuditPage() {
  const router = useRouter();
  const flags = getFeatureFlags();
  const { t } = useI18n();
  const [url, setUrl] = useState(DEMO_SITE_PATH);
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [useDemoSite, setUseDemoSite] = useState(true);
  const [ack, setAck] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!ack) {
      setError(t("ackRequired"));
      return;
    }
    try {
      const draft = createDraftAudit({
        url: useDemoSite ? DEMO_SITE_PATH : url,
        useDemoSite,
        businessName: businessName || undefined,
        email: email || undefined,
        acknowledgedLimitations: ack,
      });
      const ready = moveToPayment(draft);
      saveAudit(ready);
      router.push(`/audit/${ready.auditId}/payment`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid input");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
        {t("brand")}
      </p>
      <h1 className="display mt-2 text-4xl text-[var(--ink)]">{t("newAuditTitle")}</h1>
      <p className="mt-3 text-[var(--muted)]">{t("newAuditSupport")}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <label className="ac-surface flex items-start gap-3 rounded-lg border border-[var(--line)] p-4">
          <input
            type="checkbox"
            checked={useDemoSite}
            onChange={(e) => {
              setUseDemoSite(e.target.checked);
              if (e.target.checked) setUrl(DEMO_SITE_PATH);
            }}
            className="mt-1"
          />
          <span>
            <strong>{t("demoSiteLabel")}</strong>
            <span className="mt-1 block text-sm text-[var(--muted)]">
              {t("demoSiteHelp")}{" "}
              <Link className="underline" href={DEMO_SITE_PATH}>
                {t("viewDemo")}
              </Link>
            </span>
          </span>
        </label>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="url">
            {t("websiteUrl")}
          </label>
          <input
            id="url"
            value={url}
            disabled={useDemoSite}
            onChange={(e) => setUrl(e.target.value)}
            className="ac-input h-11 w-full rounded-md border border-[var(--line)] px-3"
            placeholder="https://example.com"
          />
          {!flags.enableExternalAudit && !useDemoSite && (
            <p className="mt-1 text-xs text-[var(--warn)]">{t("externalDisabled")}</p>
          )}
          {flags.enableExternalAudit && !useDemoSite && (
            <p className="mt-1 text-xs text-[var(--muted)]">{t("externalEnabledHint")}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="biz">
            {t("businessName")}
          </label>
          <input
            id="biz"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="ac-input h-11 w-full rounded-md border border-[var(--line)] px-3"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="email">
            {t("emailMeta")}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="ac-input h-11 w-full rounded-md border border-[var(--line)] px-3"
          />
        </div>

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={ack}
            onChange={(e) => setAck(e.target.checked)}
            className="mt-1"
          />
          <span>{t("ackLimitations")}</span>
        </label>

        <LimitationNotice />

        {error && (
          <p className="text-sm text-[var(--danger)]" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full sm:w-auto">
          {t("continuePayment")}
        </Button>
      </form>
    </div>
  );
}
