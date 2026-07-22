"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DemoModeBanner, LimitationNotice } from "@/components/shared/notices";
import { getAudit, saveAudit } from "@/lib/storage/audit-store";
import { useSolanaWallet } from "@/lib/wallet/use-solana-wallet";
import { getFeatureFlags, getSolanaConfig, explorerTxUrl } from "@/lib/config";
import { formatSol, shortAddress } from "@/lib/utils/cn";
import { buildPaymentPreview, defaultPaymentVerifier } from "@/lib/payment/verifier";
import {
  buildPaymentTransactionMessage,
  confirmSignature,
  createDemoPayment,
  simulatePaymentTransaction,
} from "@/lib/solana/payment";
import { attachPayment, moveToPayment } from "@/lib/audit/pipeline";
import type { AuditRecord, PaymentRecord } from "@/lib/types";

export default function PaymentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const flags = getFeatureFlags();
  const config = getSolanaConfig();
  const wallet = useSolanaWallet();
  const [audit, setAudit] = useState<AuditRecord | null>(null);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<"idle" | "simulating" | "pending" | "confirmed" | "failed">("idle");
  const [txSig, setTxSig] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifyNote, setVerifyNote] = useState<string | null>(null);

  useEffect(() => {
    const found = getAudit(params.id);
    if (!found) {
      setAudit(null);
      setReady(true);
      return;
    }
    setAudit(moveToPayment(found));
    setReady(true);
  }, [params.id]);

  const preview = useMemo(
    () => (audit ? buildPaymentPreview(audit.auditId) : null),
    [audit],
  );

  async function payWithWallet() {
    if (!audit || !wallet.address) return;
    setError(null);
    setStatus("simulating");
    try {
      const built = await buildPaymentTransactionMessage({
        auditId: audit.auditId,
        payerAddress: wallet.address,
      });
      const sim = await simulatePaymentTransaction(built.wireTransactionBase64);
      if (!sim.ok) {
        setStatus("failed");
        setError(sim.error ?? "Simulation failed");
        return;
      }

      setStatus("pending");
      const pending: PaymentRecord = {
        status: "pending",
        amountSol: config.priceSol,
        recipient: config.recipient,
        payer: wallet.address,
        memo: built.memo,
        network: "devnet",
        isDemoMock: false,
      };
      let next = attachPayment(audit, pending);
      saveAudit(next);
      setAudit(next);

      const signature = await wallet.signAndSendTransaction(built.wireTransactionBase64);
      setTxSig(signature);

      // wait briefly for confirmation
      let confirmed = false;
      for (let i = 0; i < 8; i++) {
        const res = await confirmSignature(signature);
        if (res.err) {
          throw new Error(res.err);
        }
        if (res.confirmed) {
          confirmed = true;
          break;
        }
        await new Promise((r) => setTimeout(r, 1500));
      }

      if (!confirmed) {
        setStatus("pending");
        setError("ტრანზაქცია ჯერ არ დადასტურებულა — სცადეთ ხელახლა ან შეამოწმეთ Explorer.");
        return;
      }

      const verify = await defaultPaymentVerifier.verify({
        signature,
        expectedAuditId: audit.auditId,
        expectedPayer: wallet.address,
        expectedRecipient: config.recipient,
        expectedAmountSol: config.priceSol,
        network: "devnet",
        memo: built.memo,
        transactionSucceeded: true,
        transferredLamports: BigInt(Math.round(config.priceSol * 1e9)),
        sender: wallet.address,
      });
      setVerifyNote(verify.limitationNote);

      const confirmedPayment: PaymentRecord = {
        status: "confirmed",
        signature,
        amountSol: config.priceSol,
        recipient: config.recipient,
        payer: wallet.address,
        memo: built.memo,
        network: "devnet",
        confirmedAt: new Date().toISOString(),
        isDemoMock: false,
      };
      next = attachPayment(next, confirmedPayment);
      saveAudit(next);
      setAudit(next);
      setStatus("confirmed");
      router.push(`/audit/${audit.auditId}/progress`);
    } catch (err) {
      setStatus("failed");
      setError(err instanceof Error ? err.message : "Payment failed");
      if (audit) {
        const failed = attachPayment(audit, {
          status: "failed",
          amountSol: config.priceSol,
          recipient: config.recipient,
          payer: wallet.address ?? undefined,
          memo: preview?.memo ?? "",
          network: "devnet",
          isDemoMock: false,
          error: err instanceof Error ? err.message : "Payment failed",
        });
        saveAudit(failed);
        setAudit(failed);
      }
    }
  }

  function useDemoWalletFlow() {
    if (!audit) return;
    const demoWallet = wallet.address ?? "DemoWallet1111111111111111111111111";
    const payment = createDemoPayment(audit.auditId, demoWallet);
    const next = attachPayment(audit, payment);
    saveAudit(next);
    setAudit(next);
    setStatus("confirmed");
    setTxSig(payment.signature!);
    router.push(`/audit/${audit.auditId}/progress`);
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <p className="text-[var(--muted)]">იტვირთება…</p>
      </div>
    );
  }

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
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="display text-4xl text-[var(--ink)]">საფულე და გადახდა</h1>
      <p className="mt-2 text-[var(--muted)]">
        Phantom-compatible Wallet Standard · მხოლოდ Solana Devnet
      </p>

      {flags.demoMode && (
        <div className="mt-4">
          <DemoModeBanner label="შეგიძლიათ გამოიყენოთ დემო საფულის ნაკადი" />
        </div>
      )}

      <div className="mt-6 space-y-3 rounded-xl border border-[var(--line)] bg-white/90 p-5">
        <h2 className="display text-xl">ხელმოწერამდე</h2>
        {preview && (
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">Action</dt>
              <dd className="font-medium">{preview.action}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">Amount</dt>
              <dd className="font-medium">{formatSol(preview.amountSol)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">Recipient</dt>
              <dd className="font-mono text-xs">{shortAddress(preview.recipient || "—", 6)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">Network</dt>
              <dd className="font-medium">{preview.network}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">Audit request ID</dt>
              <dd className="font-mono text-xs">{preview.auditRequestId}</dd>
            </div>
            <p className="pt-2 text-[var(--muted)]">{preview.consequenceKa}</p>
          </dl>
        )}
      </div>

      <div className="mt-6 space-y-3 rounded-xl border border-[var(--line)] bg-white/90 p-5">
        <h2 className="display text-xl">Wallet</h2>
        {!wallet.phantomInstalled && wallet.ready && (
          <p className="text-sm text-[var(--warn)]">
            Phantom არ არის დაყენებული. დააინსტალირეთ ან გამოიყენეთ დემო ნაკადი.
          </p>
        )}
        {wallet.address ? (
          <div className="text-sm">
            <p>
              მისამართი:{" "}
              <span className="font-mono">{shortAddress(wallet.address, 6)}</span>
            </p>
            <p className="mt-1">
              ბალანსი:{" "}
              {wallet.balanceSol === null
                ? "—"
                : formatSol(wallet.balanceSol)}
            </p>
            {wallet.wrongNetwork && (
              <p className="mt-2 text-[var(--danger)]">
                Wrong network — გადართეთ Solana Devnet-ზე.
              </p>
            )}
            {wallet.insufficientBalance(config.priceSol) && (
              <p className="mt-2 text-[var(--danger)]">
                არასაკმარისი Devnet SOL. მოითხოვეთ airdrop ან გამოიყენეთ დემო ნაკადი.
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => void wallet.disconnect()}>
                Disconnect
              </Button>
              <Button
                type="button"
                onClick={() => void payWithWallet()}
                disabled={
                  status === "pending" ||
                  status === "simulating" ||
                  wallet.wrongNetwork ||
                  !flags.enableSolana
                }
              >
                {status === "simulating"
                  ? "Simulation…"
                  : status === "pending"
                    ? "Pending…"
                    : `გადაიხადე ${formatSol(config.priceSol)}`}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void wallet.connect()} disabled={wallet.connecting}>
              {wallet.connecting ? "Connecting…" : "Connect Wallet"}
            </Button>
          </div>
        )}
        {wallet.error && (
          <p className="text-sm text-[var(--danger)]">{wallet.error}</p>
        )}
      </div>

      {flags.demoMode && (
        <div className="mt-4">
          <Button type="button" variant="outline" onClick={useDemoWalletFlow}>
            Use demo wallet flow
          </Button>
        </div>
      )}

      {status === "failed" && (
        <div className="mt-4 rounded-lg border border-[var(--danger)]/30 bg-red-50 p-4 text-sm">
          <p className="font-semibold text-[var(--danger)]">გადახდა ჩაიშალა</p>
          <p className="mt-1">{error}</p>
          <Button type="button" className="mt-3" variant="secondary" onClick={() => void payWithWallet()}>
            Retry payment
          </Button>
        </div>
      )}

      {txSig && (
        <p className="mt-4 text-sm">
          Signature: <span className="font-mono text-xs">{txSig}</span>
          {!txSig.startsWith("demo_") && (
            <>
              {" · "}
              <a
                className="underline"
                href={explorerTxUrl(txSig)}
                target="_blank"
                rel="noreferrer"
              >
                Solana Explorer
              </a>
            </>
          )}
        </p>
      )}

      {verifyNote && (
        <p className="mt-3 text-xs text-[var(--muted)]">{verifyNote}</p>
      )}

      <div className="mt-8">
        <LimitationNotice />
      </div>
    </div>
  );
}
