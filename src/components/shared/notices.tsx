import { LIMITATION_NOTICE_KA } from "@/lib/types";

export function LimitationNotice({ className = "" }: { className?: string }) {
  return (
    <aside className={`limit-banner rounded-r-lg px-4 py-3 text-sm ${className}`}>
      {LIMITATION_NOTICE_KA}
    </aside>
  );
}

export function DemoModeBanner({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-2 text-sm text-[var(--ink)]">
      <strong>DEMO_MODE:</strong> {label} — არ არის რეალური blockchain ვერიფიკაცია.
    </div>
  );
}
