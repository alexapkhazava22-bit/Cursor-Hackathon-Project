"use client";

import { useEffect, useRef } from "react";

/**
 * Intentionally keyboard-inaccessible clickable div for the demo site.
 * Uses a client effect instead of a <script> tag (which React warns about).
 */
export function FakeClickableLink({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onClick = () => {
      alert("clicked");
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, []);

  return (
    <div
      ref={ref}
      className="fake-link"
      style={{
        marginTop: 24,
        color: "blue",
        textDecoration: "underline",
        cursor: "pointer",
      }}
    >
      {children}
    </div>
  );
}
