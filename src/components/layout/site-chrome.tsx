"use client";

import Link from "next/link";
import { Moon, Sun, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import { useTheme } from "@/lib/theme/context";
import { localeLabels, type Locale } from "@/lib/i18n/translations";

export function SiteHeader() {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();

  function cycleLocale() {
    const next: Locale = locale === "ka" ? "en" : "ka";
    setLocale(next);
  }

  return (
    <header className="relative z-20 border-b border-[var(--line)]/70 bg-[var(--header-bg)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--brand)] text-sm font-bold text-white transition group-hover:scale-105">
            AC
          </span>
          <span className="display text-xl text-[var(--brand)]">{t("brand")}</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-[var(--muted)] md:flex">
          <Link href="/audit/new" className="hover:text-[var(--brand)]">
            {t("navNewAudit")}
          </Link>
          <Link href="/history" className="hover:text-[var(--brand)]">
            {t("navHistory")}
          </Link>
          <Link href="/demo/inaccessible" className="hover:text-[var(--brand)]">
            {t("navDemo")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={cycleLocale}
            aria-label={`${t("language")}: ${localeLabels[locale]}`}
            title={`${t("language")}: ${localeLabels[locale]}`}
          >
            <Languages className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">{locale === "ka" ? "KA" : "EN"}</span>
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={toggleTheme}
            aria-label={`${t("theme")}: ${theme === "light" ? t("themeLight") : t("themeDark")}`}
            title={`${t("theme")}: ${theme === "light" ? t("themeLight") : t("themeDark")}`}
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" aria-hidden />
            ) : (
              <Sun className="h-4 w-4" aria-hidden />
            )}
            <span className="hidden sm:inline">
              {theme === "light" ? t("themeDark") : t("themeLight")}
            </span>
          </Button>
          <Button asChild size="sm">
            <Link href="/audit/new">{t("navCheckSite")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-[var(--footer-bg)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-[var(--muted)] sm:px-6">
        <p className="display text-base text-[var(--brand)]">{t("brand")}</p>
        <p>{t("footerBlurb")}</p>
        <p className="text-xs">{t("footerHonesty")}</p>
      </div>
    </footer>
  );
}
