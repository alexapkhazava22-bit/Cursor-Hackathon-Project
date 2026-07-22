import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LimitationNotice } from "@/components/shared/notices";

const steps = [
  { n: "01", t: "მიუთითე საიტი" },
  { n: "02", t: "გადაიხადე Devnet SOL" },
  { n: "03", t: "მიიღე AI აუდიტი" },
  { n: "04", t: "გადაამოწმე სერტიფიკატი Solana-ზე" },
];

export default function LandingPage() {
  return (
    <div>
      <section className="hero-shell relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <svg className="h-full w-full" aria-hidden>
            <defs>
              <linearGradient id="acLine" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0b5f63" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
            <path
              d="M0,320 C240,180 420,420 720,260 S1200,200 1440,320"
              fill="none"
              stroke="url(#acLine)"
              strokeWidth="2"
              strokeDasharray="120"
              className="animate-[draw-line_2.2s_ease_forwards]"
            />
          </svg>
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div>
            <p className="animate-rise display text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              AccessChain
            </p>
            <h1 className="animate-rise-delay mt-4 max-w-2xl text-4xl leading-tight text-[var(--ink)] sm:text-5xl lg:text-[3.25rem]">
              გაიგე რამდენად ხელმისაწვდომია შენი საიტი — ტექნიკური ცოდნის გარეშე
            </h1>
            <p className="animate-rise-delay-2 mt-6 max-w-xl text-lg text-[var(--muted)]">
              AI აღმოაჩენს accessibility პრობლემებს, აგიხსნის მათ მარტივი ენით და
              დეველოპერს მისცემს გამოსასწორებელ ტექნიკურ დავალებას. ანგარიშის ჰეში
              დამოწმდება Solana-ზე.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/audit/new">შეამოწმე საიტი</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/audit/ac_demo_sample_001/report">იხილე დემო ანგარიში</Link>
              </Button>
            </div>
          </div>

          <div className="animate-rise-delay relative min-h-[280px] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--brand)] text-white shadow-xl">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[var(--accent)]/30 animate-pulse-soft" />
            <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                  Solana Devnet · Report Integrity
                </p>
                <p className="display mt-4 text-3xl">აუდიტი → ჰეში → ანაბეჭდი</p>
                <p className="mt-3 text-sm text-white/80">
                  გადახდა 0.01 SOL · axe-core · SHA-256 · Memo attestation
                </p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-white/10 p-3 backdrop-blur">
                  ბიზნესის ხედი
                </div>
                <div className="rounded-lg bg-white/10 p-3 backdrop-blur">
                  დეველოპერის ხედი
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="display text-3xl text-[var(--ink)]">როგორ მუშაობს</h2>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          ერთი საიმედო ნაკადი — URL-დან გადამოწმებად სერტიფიკატამდე.
        </p>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <li key={s.n} className="border-t-2 border-[var(--brand)] pt-4">
              <p className="text-xs font-semibold tracking-[0.2em] text-[var(--accent)]">
                {s.n}
              </p>
              <p className="display mt-2 text-xl text-[var(--ink)]">{s.t}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10">
          <LimitationNotice />
        </div>
      </section>
    </div>
  );
}
