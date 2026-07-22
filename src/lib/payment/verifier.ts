import { createPaymentMemo, verifyPaymentMemo } from "@/lib/solana/memo";
import { getSolanaConfig, solToLamports } from "@/lib/config";

export interface PaymentVerificationInput {
  signature: string;
  expectedAuditId: string;
  expectedPayer?: string;
  expectedRecipient: string;
  expectedAmountSol: number;
  network: string;
  /** Raw memo extracted from the transaction (client-side or RPC) */
  memo?: string;
  /** Whether the transaction meta reported success */
  transactionSucceeded?: boolean;
  /** Lamports transferred to recipient if known */
  transferredLamports?: bigint;
  sender?: string;
  isDemoMock?: boolean;
}

export interface PaymentVerificationResult {
  ok: boolean;
  reasons: string[];
  limitationNote: string;
}

const CLIENT_SIDE_LIMITATION =
  "Hackathon note: payment verification currently runs client-side via PaymentVerifier. Replace with a server-side verifier before production.";

export interface PaymentVerifier {
  verify(input: PaymentVerificationInput): Promise<PaymentVerificationResult>;
}

/**
 * Client-side PaymentVerifier — isolated so a server implementation can replace it later.
 */
export class ClientPaymentVerifier implements PaymentVerifier {
  async verify(input: PaymentVerificationInput): Promise<PaymentVerificationResult> {
    const reasons: string[] = [];

    if (input.isDemoMock) {
      return {
        ok: false,
        reasons: ["Demo mock payment is not a real blockchain verification"],
        limitationNote: CLIENT_SIDE_LIMITATION,
      };
    }

    if (!input.signature || input.signature.length < 32) {
      reasons.push("Missing or invalid transaction signature");
    }

    if (input.network !== "devnet") {
      reasons.push("Expected Solana Devnet");
    }

    if (input.transactionSucceeded === false) {
      reasons.push("Transaction did not succeed");
    }

    if (input.expectedPayer && input.sender && input.sender !== input.expectedPayer) {
      reasons.push("Sender does not match connected wallet");
    }

    if (input.sender === undefined && input.expectedPayer) {
      // soft: unknown sender from lightweight verify
    }

    const expectedRecipient = input.expectedRecipient;
    if (!expectedRecipient) {
      reasons.push("Recipient is not configured");
    }

    if (input.memo !== undefined) {
      if (!verifyPaymentMemo(input.memo, input.expectedAuditId)) {
        reasons.push("Memo does not match expected ACCESSCHAIN_PAYMENT reference");
      }
    } else {
      reasons.push("Memo could not be read from transaction");
    }

    if (input.transferredLamports !== undefined) {
      const expected = solToLamports(input.expectedAmountSol);
      if (input.transferredLamports !== expected) {
        reasons.push(
          `Amount mismatch: expected ${expected} lamports, got ${input.transferredLamports}`,
        );
      }
    }

    return {
      ok: reasons.length === 0,
      reasons,
      limitationNote: CLIENT_SIDE_LIMITATION,
    };
  }
}

export function buildPaymentPreview(auditId: string) {
  const config = getSolanaConfig();
  return {
    action: "Accessibility Audit Payment",
    amountSol: config.priceSol,
    recipient: config.recipient,
    network: "Solana Devnet",
    auditRequestId: auditId,
    memo: createPaymentMemo(auditId),
    consequenceKa:
      "ხელმოწერის შემდეგ Devnet-ზე გაიგზავნება 0.01 SOL და აუდიტის მოთხოვნა დადასტურდება. მთავარ ქსელზე (Mainnet) გადახდა არ ხდება.",
  };
}

export const defaultPaymentVerifier = new ClientPaymentVerifier();
