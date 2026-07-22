"use client";

import { LimitationNotice as BaseNotice, DemoModeBanner as BaseDemo } from "@/components/shared/notices-base";
import { useI18n } from "@/lib/i18n/context";

export function LimitationNotice({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  return <BaseNotice className={className} text={t("limitationNotice")} />;
}

export function DemoModeBanner({ label }: { label: string }) {
  const { t } = useI18n();
  return (
    <BaseDemo
      prefix={t("demoModePrefix")}
      label={label}
      suffix={t("demoModeNotReal")}
    />
  );
}
