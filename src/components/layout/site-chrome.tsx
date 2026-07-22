import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="relative z-20 border-b border-[var(--line)]/70 bg-white/50 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--brand)] text-sm font-bold text-white transition group-hover:scale-105">
            AC
          </span>
          <span className="display text-xl text-[var(--brand)]">AccessChain</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-[var(--muted)] md:flex">
          <Link href="/audit/new" className="hover:text-[var(--brand)]">
            ახალი აუდიტი
          </Link>
          <Link href="/history" className="hover:text-[var(--brand)]">
            ისტორია
          </Link>
          <Link href="/demo/inaccessible" className="hover:text-[var(--brand)]">
            დემო საიტი
          </Link>
        </nav>
        <Button asChild size="sm">
          <Link href="/audit/new">შეამოწმე საიტი</Link>
        </Button>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-white/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-[var(--muted)] sm:px-6">
        <p className="display text-base text-[var(--brand)]">AccessChain</p>
        <p>
          AI-powered accessibility audit for business owners — with Solana Devnet
          report integrity attestation.
        </p>
        <p className="text-xs">
          Solana hash proves report integrity and transaction history — not that
          audit conclusions are correct.
        </p>
      </div>
    </footer>
  );
}
