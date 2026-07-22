"use client";

import { useEffect, useState } from "react";

/**
 * Avoid SSR/client hydration mismatches for localStorage-backed UI.
 * Renders `fallback` until mounted on the client.
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
