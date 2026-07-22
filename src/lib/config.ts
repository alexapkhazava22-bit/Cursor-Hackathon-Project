import type { FeatureFlags } from "@/lib/types";

export function getFeatureFlags(): FeatureFlags {
  return {
    demoMode: process.env.NEXT_PUBLIC_DEMO_MODE !== "false",
    enableSolana: process.env.NEXT_PUBLIC_ENABLE_SOLANA !== "false",
    enableRealAi: process.env.NEXT_PUBLIC_ENABLE_REAL_AI === "true",
    enableExternalAudit:
      process.env.NEXT_PUBLIC_ENABLE_EXTERNAL_AUDIT === "true",
  };
}

export function getSolanaConfig() {
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet";
  const priceSol = Number(process.env.NEXT_PUBLIC_AUDIT_PRICE_SOL ?? "0.01");
  const recipient = process.env.NEXT_PUBLIC_AUDIT_RECIPIENT ?? "";
  const rpcUrl =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
    "https://api.devnet.solana.com";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (network !== "devnet") {
    throw new Error("AccessChain only supports Solana Devnet in this MVP.");
  }

  return {
    network: "devnet" as const,
    priceSol: Number.isFinite(priceSol) ? priceSol : 0.01,
    recipient,
    rpcUrl,
    appUrl,
    explorerBase: "https://explorer.solana.com",
  };
}

export function explorerTxUrl(signature: string, cluster = "devnet"): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
}

export function explorerAddressUrl(address: string, cluster = "devnet"): string {
  return `https://explorer.solana.com/address/${address}?cluster=${cluster}`;
}

export function solToLamports(sol: number): bigint {
  return BigInt(Math.round(sol * 1_000_000_000));
}
