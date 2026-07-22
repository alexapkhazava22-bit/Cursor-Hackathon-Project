"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import * as Tabs from "@radix-ui/react-tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DemoModeBanner, LimitationNotice } from "@/components/shared/notices";
import { getAudit, saveAudit } from "@/lib/storage/audit-store";
import { attachAttestation } from "@/lib/audit/pipeline";
import {
  buildAttestationTransaction,
  createDemoAttestation,
  fetchTransactionMemo,
} from "@/lib/solana/attestation";
import { confirmSignature } from "@/lib/solana/payment";
import { useSolanaWallet } from "@/lib/wallet/use-solana-wallet";
import { explorerTxUrl, getFeatureFlags, getSolanaConfig } from "@/lib/config";
import { formatDateKa, shortAddress } from "@/lib/utils/cn";
import { MockAIProvider } from "@/lib/ai/provider";
import type { AuditRecord } from "@/lib/types";
import { useI18n } from "@/lib/i18n/context";

export default function ReportPage() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const flags = getFeatureFlags();
  const config = getSolanaConfig();
  const wallet = useSolanaWallet();
  const [audit, setAudit] = useState<AuditRecord | null>(null);
  const [ready, setReady] = useState(false);
  const [attestError, setAttestError] = useState<string | null>(null);
  const [attestBusy, setAttestBusy] = useState(false);

  useEffect(() => {
    async function load() {
      let found = getAudit(params.id);
      if (!found && params.id === "ac_demo_sample_001") {
        const { seedSampleAudit } = await import("@/lib/audit/pipeline");
        found = await seedSampleAudit();
        saveAudit(found);
      }
      if (found && (!found.explanations || found.explanations.issues.length === 0) && found.auditResult) {
        const mock = new MockAIProvider();
        const explanations = await mock.explainViolations(found.auditResult.violations, {
          auditedUrl: found.meta.url,
          businessName: found.meta.businessName,
        });
        found = { ...found, explanations };
        saveAudit(found);
      }
      setAudit(found);
      setReady(true);
    }
    void load();
  }, [params.id]);

  const explained = useMemo(() => audit?.explanations?.issues ?? [], [audit]);

  async function anchorHash() {
    if (!audit?.currentHash) return;
    setAttestBusy(true);
    setAttestError(null);
    try {
      const payer = wallet.address ?? audit.payment?.payer;
      if (!payer) throw new Error("Wallet required for attestation");

      const built = await buildAttestationTransaction({
        auditId: audit.auditId,
        reportHash: audit.currentHash,
        payerAddress: payer,
      });

      let next = attachAttestation(audit, {
        status: "pending",
        reportHash: audit.currentHash,
        memo: built.memo,
        wallet: payer,
        cluster: "devnet",
        isDemoMock: false,
      });
      saveAudit(next);
      setAudit(next);

      if (!wallet.address) {
        throw new Error("Connect wallet to sign attestation");
      }

      const signature = await wallet.signAndSendTransaction(built.wireTransactionBase64);
      let confirmed = false;
      for (let i = 0; i < 8; i++) {
        const res = await confirmSignature(signature);
        if (res.confirmed) {
          confirmed = true;
          break;
        }
        await new Promise((r) => setTimeout(r, 1200));
      }

      const fetched = await fetchTransactionMemo(signature);
      next = attachAttestation(next, {
        status: confirmed ? "confirmed" : "pending",
        signature,
        reportHash: audit.currentHash,
        memo: fetched.memo ?? built.memo,
        wallet: payer,
        cluster: "devnet",
        slot: fetched.slot,
        blockTime: fetched.blockTime ?? undefined,
        confirmedAt: confirmed ? new Date().toISOString() : undefined,
        isDemoMock: false,
      });
      saveAudit(next);
      setAudit(next);
    } catch (err) {
      setAttestError(err instanceof Error ? err.message : "Attestation failed");
    } finally {
      setAttestBusy(false);
    }
  }

  function demoAttest() {
    if (!audit?.currentHash) return;
    const next = attachAttestation(
      audit,
      createDemoAttestation({
        auditId: audit.auditId,
        reportHash: audit.currentHash,
        wallet: wallet.address ?? audit.payment?.payer ?? "DemoWallet1111111111111111111111111",
      }),
    );
    saveAudit(next);
    setAudit(next);
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <p className="text-[var(--muted)]">{t("reportLoading")}</p>
      </div>
    );
  }

  if (!audit || !audit.auditResult) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <p>{t("reportNotReady")}</p>
        <Button asChild className="mt-4">
          <Link href="/audit/new">{t("navNewAudit")}</Link>
        </Button>
      </div>
    );
  }

  const counts = audit.auditResult.severityCounts;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-4 border-b border-[var(--line)] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            {t("reportTitle")}
          </p>
          <h1 className="display mt-1 text-3xl text-[var(--ink)] sm:text-4xl">
            {audit.meta.url}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {formatDateKa(audit.auditResult.timestamp)} · {audit.auditId}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(audit.payment?.status === "confirmed" ||
              audit.payment?.status === "demo_mock") && (
              <Badge className="bg-[var(--brand-soft)] text-[var(--brand)]">
                {t("paymentVerified")}{audit.payment.isDemoMock ? " (demo)" : ""}
              </Badge>
            )}
            {(audit.attestation?.status === "confirmed" ||
              audit.attestation?.status === "demo_mock" ||
              audit.state === "VERIFIED") && (
              <Badge className="bg-[var(--accent-soft)] text-[var(--warn)]">
                {t("solanaAnchored")}{audit.attestation?.isDemoMock ? " (demo)" : ""}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link
              href={`/audit/${audit.auditId}/developer`}
              prefetch={false}
            >
              {t("developerFixPlan")}
            </Link>
          </Button>
          <Button asChild>
            <Link
              href={`/audit/${audit.auditId}/certificate`}
              prefetch={false}
            >
              Certificate
            </Link>
          </Button>
        </div>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {(
          [
            ["CRITICAL", counts.CRITICAL],
            ["SERIOUS", counts.SERIOUS],
            ["MODERATE", counts.MODERATE],
            ["MINOR", counts.MINOR],
          ] as const
        ).map(([label, n]) => (
          <div key={label} className="rounded-lg border border-[var(--line)] bg-white/90 p-4">
            <p className="text-xs tracking-wide text-[var(--muted)]">{label}</p>
            <p className="display mt-1 text-3xl">{n}</p>
          </div>
        ))}
      </div>

      {audit.auditResult.healthScore !== undefined && (
        <p className="mt-4 text-sm text-[var(--muted)]">
          {audit.auditResult.healthScoreLabel}:{" "}
          <strong className="text-[var(--ink)]">{audit.auditResult.healthScore}</strong>
          {" "}{t("healthScoreNote")}
        </p>
      )}

      <LimitationNotice className="mt-6" />

      <Tabs.Root defaultValue="owner" className="mt-8">
        <Tabs.List className="flex flex-wrap gap-2 border-b border-[var(--line)] pb-2">
          {[
            ["owner", t("tabOwner")],
            ["dev", t("tabDev")],
            ["tech", t("tabTech")],
            ["solana", t("tabSolana")],
          ].map(([v, label]) => (
            <Tabs.Trigger
              key={v}
              value={v}
              className="rounded-md px-3 py-2 text-sm font-semibold text-[var(--muted)] data-[state=active]:bg-[var(--brand)] data-[state=active]:text-white"
            >
              {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="owner" className="mt-6 space-y-4">
          <p className="text-xs text-[var(--muted)]">
            {t("aiExplanationNote")}
          </p>
          {explained.map((issue) => (
            <article
              key={issue.violationId}
              className="rounded-xl border border-[var(--line)] bg-white/90 p-5"
            >
              <Badge className="bg-[var(--brand-soft)] text-[var(--brand)]">
                {issue.impact}
              </Badge>
              <h3 className="display mt-2 text-xl">{t("whatProblem")}</h3>
              <p className="mt-1">{issue.owner.problemKa}</p>
              <h4 className="mt-4 font-semibold">{t("whoAffected")}</h4>
              <p>{issue.owner.whoAffectedKa}</p>
              <h4 className="mt-4 font-semibold">{t("businessImpact")}</h4>
              <p>{issue.owner.businessImpactKa}</p>
              <h4 className="mt-4 font-semibold">{t("howPriority")}</h4>
              <p>
                {issue.owner.priorityKa} · {t("difficulty")}: {issue.owner.difficultyKa}
              </p>
              <h4 className="mt-4 font-semibold">{t("askDeveloper")}</h4>
              <p>{issue.owner.askDeveloperKa}</p>
              <h4 className="mt-4 font-semibold">{t("howRetest")}</h4>
              <p>{issue.owner.retestKa}</p>
            </article>
          ))}
        </Tabs.Content>

        <Tabs.Content value="dev" className="mt-6 space-y-4">
          {explained.map((issue) => (
            <article
              key={issue.violationId}
              className="rounded-xl border border-[var(--line)] bg-white/90 p-5"
            >
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-[var(--brand-soft)] text-[var(--brand)]">
                  {issue.developer.ruleId}
                </Badge>
                <Badge className="bg-[var(--accent-soft)] text-[var(--warn)]">
                  {issue.developer.severity}
                </Badge>
              </div>
              {issue.developer.selector && (
                <p className="mt-2 font-mono text-xs text-[var(--muted)]">
                  {issue.developer.selector}
                </p>
              )}
              <p className="mt-3">{issue.developer.technicalCause}</p>
              <h4 className="mt-4 font-semibold">{t("suggestedFix")}</h4>
              <p>{issue.developer.suggestedFix}</p>
              {issue.developer.codeExample && (
                <pre className="mt-3 overflow-x-auto rounded-lg bg-[#0f1c1e] p-3 text-xs text-white">
                  {issue.developer.codeExample}
                </pre>
              )}
              <h4 className="mt-4 font-semibold">{t("acceptanceCriteria")}</h4>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {issue.developer.acceptanceCriteria.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              {issue.developer.wcagReference && (
                <p className="mt-3 text-sm text-[var(--muted)]">
                  WCAG / help: {issue.developer.wcagReference}
                </p>
              )}
            </article>
          ))}
        </Tabs.Content>

        <Tabs.Content value="tech" className="mt-6 space-y-4">
          <p className="text-sm text-[var(--muted)]">
            Deterministic audit result · {audit.auditResult.engineName}{" "}
            {audit.auditResult.engineVersion} · {t("techPassed")}:{" "}
            {audit.auditResult.passes}
          </p>
          {audit.auditResult.violations.map((v) => (
            <article
              key={v.id}
              className="rounded-xl border border-[var(--line)] bg-white/90 p-5 text-sm"
            >
              <p className="font-semibold">
                {v.ruleId} · {v.impact}
              </p>
              <p className="mt-1">{v.help}</p>
              <p className="mt-2 text-[var(--muted)]">{v.description}</p>
              <p className="mt-2 font-mono text-xs">
                {v.nodes[0]?.target?.join(" ")}
              </p>
              {v.failureSummary && (
                <p className="mt-2">{v.failureSummary}</p>
              )}
              {v.helpUrl && (
                <a className="mt-2 inline-block underline" href={v.helpUrl} target="_blank" rel="noreferrer">
                  {t("helpUrl")}
                </a>
              )}
            </article>
          ))}
        </Tabs.Content>

        <Tabs.Content value="solana" className="mt-6 space-y-4">
          {(audit.payment?.isDemoMock || audit.attestation?.isDemoMock) && (
            <DemoModeBanner label={t("mockPaymentAttestation")} />
          )}
          <dl className="grid gap-3 rounded-xl border border-[var(--line)] bg-white/90 p-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[var(--muted)]">{t("connectedWallet")}</dt>
              <dd className="font-mono">
                {shortAddress(audit.payment?.payer ?? wallet.address ?? "—", 6)}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">{t("network")}</dt>
              <dd>Solana Devnet</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">{t("auditPrice")}</dt>
              <dd>{config.priceSol} SOL</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">{t("paymentStatus")}</dt>
              <dd>{audit.payment?.status ?? "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[var(--muted)]">{t("paymentSignature")}</dt>
              <dd className="break-all font-mono text-xs">
                {audit.payment?.signature ?? "—"}
                {audit.payment?.signature && !audit.payment.isDemoMock && (
                  <>
                    {" "}
                    <a className="underline" href={explorerTxUrl(audit.payment.signature)} target="_blank" rel="noreferrer">
                      Explorer
                    </a>
                  </>
                )}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[var(--muted)]">{t("reportSha")}</dt>
              <dd className="break-all font-mono text-xs">{audit.currentHash ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">{t("attestationStatus")}</dt>
              <dd>{audit.attestation?.status ?? audit.state}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[var(--muted)]">{t("attestationSignature")}</dt>
              <dd className="break-all font-mono text-xs">
                {audit.attestation?.signature ?? "—"}
                {audit.attestation?.signature && !audit.attestation.isDemoMock && (
                  <>
                    {" "}
                    <a className="underline" href={explorerTxUrl(audit.attestation.signature)} target="_blank" rel="noreferrer">
                      Explorer
                    </a>
                  </>
                )}
              </dd>
            </div>
          </dl>

          {audit.state === "ATTESTATION_REQUIRED" ||
          audit.state === "ATTESTATION_PENDING" ||
          !audit.attestation ? (
            <div className="space-y-3 rounded-xl border border-[var(--line)] bg-[var(--brand-soft)] p-5">
              <p className="text-sm">
                {t("attestExplain")}
              </p>
              <div className="flex flex-wrap gap-2">
                {!wallet.address && (
                  <Button type="button" variant="secondary" onClick={() => void wallet.connect()}>
                    {t("connectWallet")}
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={() => void anchorHash()}
                  disabled={attestBusy || !flags.enableSolana}
                >
                  {attestBusy ? t("anchoring") : t("anchorHash")}
                </Button>
                {flags.demoMode && (
                  <Button type="button" variant="outline" onClick={demoAttest}>
                    {t("useDemoAttestation")}
                  </Button>
                )}
              </div>
              {attestError && (
                <p className="text-sm text-[var(--danger)]">{attestError}</p>
              )}
            </div>
          ) : (
            <Button asChild variant="secondary">
              <Link href={`/verify/${audit.auditId}`}>{t("reverifySolana")}</Link>
            </Button>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
