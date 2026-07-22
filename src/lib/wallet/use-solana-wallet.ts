"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getWallets } from "@wallet-standard/app";
import type { Wallet, WalletAccount } from "@wallet-standard/base";
import { getSolanaConfig } from "@/lib/config";

const SOLANA_MAINNET = "solana:mainnet";
const SOLANA_DEVNET = "solana:devnet";

function isSolanaWallet(wallet: Wallet): boolean {
  const chains = wallet.chains ?? [];
  return chains.some((c) => c.startsWith("solana:"));
}

function getFeature<T>(wallet: Wallet, name: string): T | null {
  const features = wallet.features as Record<string, T>;
  return features[name] ?? null;
}

export interface WalletState {
  ready: boolean;
  wallets: Wallet[];
  wallet: Wallet | null;
  account: WalletAccount | null;
  address: string | null;
  connecting: boolean;
  balanceSol: number | null;
  wrongNetwork: boolean;
  error: string | null;
  phantomInstalled: boolean;
}

export function useSolanaWallet() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [balanceSol, setBalanceSol] = useState<number | null>(null);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const api = getWallets();
    const refresh = () => {
      const list = api.get().filter(isSolanaWallet);
      setWallets(list);
      setReady(true);
    };
    refresh();
    const offRegister = api.on("register", refresh);
    const offUnregister = api.on("unregister", refresh);
    return () => {
      offRegister();
      offUnregister();
    };
  }, []);

  const phantomInstalled = useMemo(
    () =>
      wallets.some((w) => {
        const name = w.name.toLowerCase();
        const icon = (w.icon ?? "").toLowerCase();
        return name.includes("phantom") || icon.includes("phantom");
      }),
    [wallets],
  );

  const refreshBalance = useCallback(async (address: string) => {
    try {
      const config = getSolanaConfig();
      const res = await fetch(config.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getBalance",
          params: [address],
        }),
      });
      const json = (await res.json()) as {
        result?: { value: number };
      };
      if (json.result) {
        setBalanceSol(json.result.value / 1_000_000_000);
      }
    } catch {
      setBalanceSol(null);
    }
  }, []);

  const connect = useCallback(async (preferred?: Wallet) => {
    setConnecting(true);
    setError(null);
    try {
      const target =
        preferred ??
        wallets.find((w) => w.name.toLowerCase().includes("phantom")) ??
        wallets[0];
      if (!target) {
        throw new Error(
          "Solana wallet not found. Install Phantom or use the demo wallet flow.",
        );
      }

      const connectFeature = getFeature<{
        connect: () => Promise<{ accounts: WalletAccount[] }>;
      }>(target, "standard:connect");

      if (!connectFeature?.connect) {
        throw new Error("Wallet does not support standard:connect");
      }

      const { accounts } = await connectFeature.connect();
      const selected = accounts[0];
      if (!selected) throw new Error("No account returned by wallet");

      const chains = selected.chains ?? target.chains ?? [];
      const onDevnet = chains.includes(SOLANA_DEVNET) || chains.length === 0;
      const onMainnetOnly =
        chains.includes(SOLANA_MAINNET) && !chains.includes(SOLANA_DEVNET);
      setWrongNetwork(Boolean(onMainnetOnly && !onDevnet));

      setWallet(target);
      setAccount(selected);
      await refreshBalance(selected.address);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection rejected");
      setWallet(null);
      setAccount(null);
    } finally {
      setConnecting(false);
    }
  }, [wallets, refreshBalance]);

  const disconnect = useCallback(async () => {
    try {
      if (wallet) {
        const disconnectFeature = getFeature<{
          disconnect: () => Promise<void>;
        }>(wallet, "standard:disconnect");
        await disconnectFeature?.disconnect?.();
      }
    } catch {
      // ignore
    }
    setWallet(null);
    setAccount(null);
    setBalanceSol(null);
    setWrongNetwork(false);
  }, [wallet]);

  const signAndSendTransaction = useCallback(
    async (wireTransactionBase64: string): Promise<string> => {
      if (!wallet || !account) {
        throw new Error("Wallet not connected");
      }

      // Wallet Standard solana:signAndSendTransaction
      const feature = getFeature<{
        signAndSendTransaction: (inputs: unknown[]) => Promise<{ signature: Uint8Array }[]>;
      }>(wallet, "solana:signAndSendTransaction");

      if (!feature?.signAndSendTransaction) {
        // Fallback: solana:signTransaction then send via RPC
        const signFeature = getFeature<{
          signTransaction: (inputs: unknown[]) => Promise<{ signedTransaction: Uint8Array }[]>;
        }>(wallet, "solana:signTransaction");
        if (!signFeature?.signTransaction) {
          throw new Error("Wallet cannot sign Solana transactions");
        }
        const bytes = Uint8Array.from(atob(wireTransactionBase64), (c) =>
          c.charCodeAt(0),
        );
        const signed = await signFeature.signTransaction([
          {
            account,
            transaction: bytes,
            chain: SOLANA_DEVNET,
          },
        ]);
        const signedTx = signed[0]?.signedTransaction;
        if (!signedTx) throw new Error("Signing failed");

        const config = getSolanaConfig();
        const encoded = btoa(String.fromCharCode(...signedTx));
        const res = await fetch(config.rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "sendTransaction",
            params: [encoded, { encoding: "base64", skipPreflight: false }],
          }),
        });
        const json = (await res.json()) as { result?: string; error?: { message: string } };
        if (json.error) throw new Error(json.error.message);
        if (!json.result) throw new Error("No signature returned");
        return json.result;
      }

      const bytes = Uint8Array.from(atob(wireTransactionBase64), (c) =>
        c.charCodeAt(0),
      );
      const results = await feature.signAndSendTransaction([
        {
          account,
          transaction: bytes,
          chain: SOLANA_DEVNET,
          options: { commitment: "confirmed" },
        },
      ]);
      const sigBytes = results[0]?.signature;
      if (!sigBytes) throw new Error("No signature returned");
      // encode signature as base58
      const bs58 = await import("bs58");
      return bs58.default.encode(sigBytes);
    },
    [wallet, account],
  );

  return {
    ready,
    wallets,
    wallet,
    account,
    address: account?.address ?? null,
    connecting,
    balanceSol,
    wrongNetwork,
    error,
    phantomInstalled,
    connect,
    disconnect,
    refreshBalance,
    signAndSendTransaction,
    insufficientBalance: (price: number) =>
      balanceSol !== null && balanceSol < price,
  } satisfies WalletState & Record<string, unknown>;
}
