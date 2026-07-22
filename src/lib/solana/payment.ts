import {
  address,
  appendTransactionMessageInstruction,
  compileTransaction,
  createNoopSigner,
  createSolanaRpc,
  createTransactionMessage,
  getBase64EncodedWireTransaction,
  getSignatureFromTransaction,
  lamports,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  type Signature,
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";
import { getAddMemoInstruction } from "@solana-program/memo";
import { getSolanaConfig, solToLamports } from "@/lib/config";
import { createPaymentMemo } from "@/lib/solana/memo";

export type WalletSignAndSend = (input: {
  wireTransactionBase64: string;
}) => Promise<string>;

export interface BuildPaymentTxInput {
  auditId: string;
  payerAddress: string;
}

export async function buildPaymentTransactionMessage(
  input: BuildPaymentTxInput,
) {
  const config = getSolanaConfig();
  if (!config.recipient) {
    throw new Error("NEXT_PUBLIC_AUDIT_RECIPIENT is not configured");
  }

  const rpc = createSolanaRpc(config.rpcUrl);
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  const payerAddress = address(input.payerAddress);
  const payerSigner = createNoopSigner(payerAddress);
  const recipient = address(config.recipient);
  const amount = lamports(solToLamports(config.priceSol));
  const memo = createPaymentMemo(input.auditId);

  const transferIx = getTransferSolInstruction({
    amount,
    destination: recipient,
    source: payerSigner,
  });

  const memoIx = getAddMemoInstruction({ memo });

  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayer(payerAddress, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
    (m) => appendTransactionMessageInstruction(transferIx, m),
    (m) => appendTransactionMessageInstruction(memoIx, m),
  );

  const transaction = compileTransaction(message);
  const wireTransactionBase64 = getBase64EncodedWireTransaction(transaction);

  return {
    message,
    transaction,
    wireTransactionBase64,
    memo,
    amountSol: config.priceSol,
    recipient: config.recipient,
    latestBlockhash,
  };
}

export async function simulatePaymentTransaction(
  wireTransactionBase64: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const config = getSolanaConfig();
    const rpc = createSolanaRpc(config.rpcUrl);
    const result = await rpc
      .simulateTransaction(wireTransactionBase64 as never, {
        encoding: "base64",
        commitment: "confirmed",
      } as never)
      .send();
    const err = (result as { value?: { err?: unknown } })?.value?.err;
    if (err) {
      return { ok: false, error: JSON.stringify(err) };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Simulation failed",
    };
  }
}

export async function confirmSignature(
  signature: string,
): Promise<{ confirmed: boolean; err?: string }> {
  const config = getSolanaConfig();
  const rpc = createSolanaRpc(config.rpcUrl);
  try {
    const status = await rpc
      .getSignatureStatuses([signature as Signature])
      .send();
    const value = status.value[0];
    if (!value) return { confirmed: false };
    if (value.err) {
      return { confirmed: false, err: JSON.stringify(value.err) };
    }
    const conf = value.confirmationStatus;
    return {
      confirmed: conf === "confirmed" || conf === "finalized",
    };
  } catch (error) {
    return {
      confirmed: false,
      err: error instanceof Error ? error.message : "RPC error",
    };
  }
}

export function createDemoPayment(auditId: string, payer: string) {
  const config = getSolanaConfig();
  return {
    status: "demo_mock" as const,
    signature: `demo_pay_${auditId}`,
    amountSol: config.priceSol,
    recipient: config.recipient || "DemoRecipient111111111111111111111111111",
    payer,
    memo: createPaymentMemo(auditId),
    network: "devnet",
    confirmedAt: new Date().toISOString(),
    isDemoMock: true,
  };
}

export { getSignatureFromTransaction };
