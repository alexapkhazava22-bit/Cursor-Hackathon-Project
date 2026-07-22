import {
  address,
  appendTransactionMessageInstruction,
  compileTransaction,
  createSolanaRpc,
  createTransactionMessage,
  getBase64EncodedWireTransaction,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  type Signature,
} from "@solana/kit";
import { getAddMemoInstruction } from "@solana-program/memo";
import { getSolanaConfig } from "@/lib/config";
import { createReportAttestationMemo } from "@/lib/solana/memo";
import type { AttestationRecord } from "@/lib/types";

export async function buildAttestationTransaction(input: {
  auditId: string;
  reportHash: string;
  payerAddress: string;
}) {
  const config = getSolanaConfig();
  const rpc = createSolanaRpc(config.rpcUrl);
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
  const payer = address(input.payerAddress);
  const memo = createReportAttestationMemo(input.auditId, input.reportHash);
  const memoIx = getAddMemoInstruction({ memo });

  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayer(payer, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
    (m) => appendTransactionMessageInstruction(memoIx, m),
  );

  const transaction = compileTransaction(message);
  const wireTransactionBase64 = getBase64EncodedWireTransaction(transaction);

  return { memo, wireTransactionBase64, transaction, latestBlockhash };
}

export function createDemoAttestation(input: {
  auditId: string;
  reportHash: string;
  wallet: string;
}): AttestationRecord {
  const memo = createReportAttestationMemo(input.auditId, input.reportHash);
  return {
    status: "demo_mock",
    signature: `demo_attest_${input.auditId}`,
    reportHash: input.reportHash,
    memo,
    wallet: input.wallet,
    cluster: "devnet",
    confirmedAt: new Date().toISOString(),
    isDemoMock: true,
  };
}

export async function fetchTransactionMemo(
  signature: string,
): Promise<{ memo?: string; err?: unknown; slot?: number; blockTime?: number | null; unavailable?: boolean }> {
  const config = getSolanaConfig();
  const rpc = createSolanaRpc(config.rpcUrl);
  try {
    const tx = await rpc
      .getTransaction(signature as Signature, {
        encoding: "json",
        maxSupportedTransactionVersion: 0,
        commitment: "confirmed",
      } as never)
      .send();

    if (!tx) {
      return { unavailable: false };
    }

    const raw = tx as unknown as {
      meta?: { err?: unknown; logMessages?: readonly string[] | null };
      slot?: bigint | number;
      blockTime?: number | null;
    };
    const metaErr = raw.meta?.err;
    const slot =
      typeof raw.slot === "bigint" ? Number(raw.slot) : raw.slot;
    const blockTime = raw.blockTime;

    // Memo may appear in log messages: "Program log: Memo (len ...): "...""
    const logs = raw.meta?.logMessages ?? [];
    let memo: string | undefined;
    for (const line of logs) {
      const match = /Memo \(len \d+\): ["“](.+)["”]/.exec(line);
      if (match) {
        memo = match[1];
        break;
      }
    }

    return { memo, err: metaErr ?? undefined, slot, blockTime };
  } catch {
    return { unavailable: true };
  }
}
