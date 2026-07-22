"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LimitationNotice } from "@/components/shared/notices";
import { createDraftAudit, moveToPayment } from "@/lib/audit/pipeline";
import { saveAudit } from "@/lib/storage/audit-store";
import { DEMO_SITE_PATH, DEMO_SITE_LABEL } from "@/lib/types";
import { getFeatureFlags } from "@/lib/config";

export default function NewAuditPage() {
  const router = useRouter();
  const flags = getFeatureFlags();
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
      setError("გთხოვთ დაადასტუროთ შეზღუდვების შესახებ.");
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
        AccessChain
      </p>
      <h1 className="display mt-2 text-4xl text-[var(--ink)]">ახალი აუდიტი</h1>
      <p className="mt-3 text-[var(--muted)]">
        მიუთითე საიტი, გადაიხადე Devnet SOL და მიიღე AI ახსნადი ანგარიში.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <label className="flex items-start gap-3 rounded-lg border border-[var(--line)] bg-white/80 p-4">
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
            <strong>{DEMO_SITE_LABEL}</strong>
            <span className="mt-1 block text-sm text-[var(--muted)]">
              ლოკალური დემო — არ დამოკიდებულა გარე საიტებზე.{" "}
              <Link className="underline" href={DEMO_SITE_PATH}>
                იხილე დემო
              </Link>
            </span>
          </span>
        </label>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="url">
            Website URL
          </label>
          <input
            id="url"
            value={url}
            disabled={useDemoSite}
            onChange={(e) => setUrl(e.target.value)}
            className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3"
            placeholder="https://example.com"
          />
          {!flags.enableExternalAudit && !useDemoSite && (
            <p className="mt-1 text-xs text-[var(--warn)]">
              External URL auditing is disabled (NEXT_PUBLIC_ENABLE_EXTERNAL_AUDIT=false).
            </p>
          )}
          {flags.enableExternalAudit && !useDemoSite && (
            <p className="mt-1 text-xs text-[var(--muted)]">
              External URLs are audited server-side with SSRF protections. If fetching
              fails, AccessChain falls back to the bundled demo findings so the flow stays usable.
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="biz">
            ბიზნესის სახელი (არასავალდებულო)
          </label>
          <input
            id="biz"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="email">
            Email — მხოლოდ ლოკალური დემო მეტამონაცემი
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3"
          />
        </div>

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={ack}
            onChange={(e) => setAck(e.target.checked)}
            className="mt-1"
          />
          <span>
            ვადასტურებ, რომ ავტომატური ტესტირება ვერ აღმოაჩენს ყველა accessibility
            პრობლემას.
          </span>
        </label>

        <LimitationNotice />

        {error && (
          <p className="text-sm text-[var(--danger)]" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full sm:w-auto">
          გაგრძელება — საფულე და გადახდა
        </Button>
      </form>
    </div>
  );
}
