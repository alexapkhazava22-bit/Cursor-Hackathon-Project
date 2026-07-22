import { customAlphabet } from "nanoid";

const alphabet = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12);

export function createAuditId(): string {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `ac_${stamp}_${alphabet()}`;
}

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("URL is required");
  }

  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate) && !candidate.startsWith("/")) {
    candidate = `https://${candidate}`;
  }

  if (candidate.startsWith("/")) {
    return candidate.split("?")[0].split("#")[0];
  }

  const url = new URL(candidate);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https URLs are supported");
  }

  url.hash = "";
  // Stable normalization: lowercase host, drop default ports, drop trailing slash (except root)
  url.hostname = url.hostname.toLowerCase();
  if (
    (url.protocol === "https:" && url.port === "443") ||
    (url.protocol === "http:" && url.port === "80")
  ) {
    url.port = "";
  }

  let normalized = url.toString();
  if (normalized.endsWith("/") && url.pathname === "/") {
    return normalized.slice(0, -1) + "/";
  }
  if (normalized.endsWith("/") && url.pathname !== "/") {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

export function isDemoSiteUrl(url: string): boolean {
  try {
    if (url.startsWith("/demo/")) return true;
    const parsed = new URL(url, "http://localhost:3000");
    return parsed.pathname.startsWith("/demo/");
  } catch {
    return false;
  }
}

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^0\.0\.0\.0$/,
  /^\[::1\]$/,
  /^::1$/,
  /^169\.254\./,
  /^fc00:/i,
  /^fd/i,
  /^fe80:/i,
];

export function assertSafeAuditUrl(
  input: string,
  options?: { allowDemoRoute?: boolean; enableExternal?: boolean },
): string {
  const allowDemo = options?.allowDemoRoute !== false;
  const enableExternal = options?.enableExternal === true;

  if (input.startsWith("file:")) {
    throw new Error("file:// URLs are not allowed");
  }

  if (input.startsWith("/demo/") && allowDemo) {
    return normalizeUrl(input);
  }

  const normalized = normalizeUrl(input);
  const url = new URL(normalized, "http://localhost:3000");

  if (url.pathname.startsWith("/demo/") && allowDemo) {
    return url.pathname;
  }

  if (!enableExternal) {
    throw new Error(
      "External URL auditing is disabled. Use the bundled demo site.",
    );
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Unsupported protocol");
  }

  const host = url.hostname;
  if (PRIVATE_HOST_PATTERNS.some((re) => re.test(host))) {
    throw new Error("Private or local network hosts are blocked");
  }

  return normalized;
}

export function sanitizeMetadata(value: string | undefined, max = 120): string | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(/[<>]/g, "").trim().slice(0, max);
  return cleaned || undefined;
}
