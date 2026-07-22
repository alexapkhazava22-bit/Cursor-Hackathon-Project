# AccessChain

AI-powered website accessibility auditor for non-technical business owners, with Solana Devnet payments and verifiable audit-report integrity.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo happy path (no Phantom required)

1. Landing → **შეამოწმე საიტი**
2. Keep **AccessChain Demo** selected → continue
3. On payment page → **Use demo wallet flow**
4. Wait for audit progress → open Business / Developer tabs
5. On Solana tab → **Use demo attestation** (or connect Phantom for real Devnet)
6. Open **Certificate** and **/verify/[auditId]**

Bundled inaccessible demo site: [/demo/inaccessible](http://localhost:3000/demo/inaccessible)

Sample report shortcut: [/audit/ac_demo_sample_001/report](http://localhost:3000/audit/ac_demo_sample_001/report)

## Real Solana Devnet flow

1. Install [Phantom](https://phantom.app/) and switch to **Devnet**
2. Fund the wallet with Devnet SOL (airdrop)
3. Set `NEXT_PUBLIC_AUDIT_RECIPIENT` in `.env.local` to your recipient pubkey
4. Connect wallet → pay **0.01 SOL** (transfer + memo in one transaction)
5. After audit, sign the attestation memo transaction

## Scripts

```bash
npm run dev
npm run typecheck
npm test
npm run build
```

## Feature flags

| Flag | Default | Meaning |
|------|---------|---------|
| `NEXT_PUBLIC_DEMO_MODE` | `true` | Mock wallet/attestation helpers |
| `NEXT_PUBLIC_ENABLE_SOLANA` | `true` | Real wallet signing enabled |
| `NEXT_PUBLIC_ENABLE_REAL_AI` | `false` | Uses `MockAIProvider` by default |
| `NEXT_PUBLIC_ENABLE_EXTERNAL_AUDIT` | `true` | Safe server-side external URL audits (demo fallback on failure) |

## Architecture modules

- `src/lib/audit` — axe-core engine + pipeline
- `src/lib/ai` — `AIProvider` / `MockAIProvider`
- `src/lib/report` — canonical JSON + SHA-256
- `src/lib/wallet` — Wallet Standard (Phantom)
- `src/lib/solana` — payment + memo attestation (`@solana/kit`, `@solana-program/memo`)
- `src/lib/payment` — `PaymentVerifier` (client-side, swappable)
- `src/lib/certificate` — certificate model + verification
- `src/lib/state` — audit state machine
- `src/lib/demo` — deterministic demo audit fixture

## Honesty / limitations

- Automated audits cannot find 100% of accessibility issues
- Not a WCAG / government / legal compliance certificate
- Solana hash proves **report integrity**, not correctness of conclusions
- Demo mock payments/attestations are clearly labeled and are **not** real chain verification
- Client-side payment verification is isolated behind `PaymentVerifier` for later server replacement
