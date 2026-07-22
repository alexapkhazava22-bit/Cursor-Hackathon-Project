export function LimitationNotice({
  className = "",
  text,
}: {
  className?: string;
  text: string;
}) {
  return (
    <aside className={`limit-banner rounded-r-lg px-4 py-3 text-sm ${className}`}>
      {text}
    </aside>
  );
}

export function DemoModeBanner({
  prefix,
  label,
  suffix,
}: {
  prefix: string;
  label: string;
  suffix: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-2 text-sm text-[var(--ink)]">
      <strong>{prefix}</strong> {label} — {suffix}
    </div>
  );
}
