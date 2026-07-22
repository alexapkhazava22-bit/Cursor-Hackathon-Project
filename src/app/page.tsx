"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LimitationNotice } from "@/components/shared/notices";
import { useI18n } from "@/lib/i18n/context";

export default function LandingPage() {
  const { t } = useI18n();
  const steps = [
    { n: "01", text: t("step1") },
    { n: "02", text: t("step2") },
    { n: "03", text: t("step3") },
    { n: "04", text: t("step4") },
  ];

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
              {t("brand")}
            </p>
            <h1 className="animate-rise-delay mt-4 max-w-2xl text-4xl leading-tight text-[var(--ink)] sm:text-5xl lg:text-[3.25rem]">
              {t("landingHeadline")}
            </h1>
            <p className="animate-rise-delay-2 mt-6 max-w-xl text-lg text-[var(--muted)]">
              {t("landingSupport")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/audit/new">{t("landingCtaPrimary")}</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/audit/ac_demo_sample_001/report">
                  {t("landingCtaSecondary")}
                </Link>
              </Button>
            </div>
          </div>

          <div className="animate-rise-delay relative min-h-[280px] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--brand)] text-white shadow-xl">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[var(--accent)]/30 animate-pulse-soft" />
            <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                  {t("landingCardEyebrow")}
                </p>
                <p className="display mt-4 text-3xl">{t("landingCardTitle")}</p>
                <p className="mt-3 text-sm text-white/80">{t("landingCardBody")}</p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-white/10 p-3 backdrop-blur">
                  {t("landingViewOwner")}
                </div>
                <div className="rounded-lg bg-white/10 p-3 backdrop-blur">
                  {t("landingViewDev")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="display text-3xl text-[var(--ink)]">{t("howItWorks")}</h2>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          {t("howItWorksSupport")}
        </p>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <li key={s.n} className="border-t-2 border-[var(--brand)] pt-4">
              <p className="text-xs font-semibold tracking-[0.2em] text-[var(--accent)]">
                {s.n}
              </p>
              <p className="display mt-2 text-xl text-[var(--ink)]">{s.text}</p>
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
