import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { assertSafeAuditUrl } from "@/lib/utils/ids";

const FETCH_TIMEOUT_MS = 12_000;
const MAX_RESPONSE_BYTES = 1_500_000;
const MAX_REDIRECTS = 3;

function isPrivateIp(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v === "::1" || v === "0.0.0.0") return true;
  if (v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80:")) return true;

  const parts = v.split(".").map(Number);
  if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
    const [a, b] = parts;
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
  }
  return false;
}

async function assertPublicHostname(hostname: string): Promise<void> {
  if (isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new Error("Private IP addresses are blocked");
    }
    return;
  }

  const records = await lookup(hostname, { all: true });
  if (!records.length) {
    throw new Error("Unable to resolve hostname");
  }
  for (const record of records) {
    if (isPrivateIp(record.address)) {
      throw new Error("Hostname resolves to a private network address");
    }
  }
}

export interface FetchedPage {
  finalUrl: string;
  html: string;
  contentType: string;
}

/**
 * Safely fetch an external page for accessibility auditing.
 * Blocks private hosts, limits redirects/size/timeout, and only accepts HTML-ish responses.
 */
export async function fetchExternalPageHtml(
  inputUrl: string,
): Promise<FetchedPage> {
  const normalized = assertSafeAuditUrl(inputUrl, {
    allowDemoRoute: false,
    enableExternal: true,
  });

  let current = normalized;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const parsed = new URL(current);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("Unsupported protocol");
    }
    await assertPublicHostname(parsed.hostname);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(current, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
          "User-Agent": "AccessChainAuditor/1.0 (+hackathon; accessibility audit)",
        },
      });

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) throw new Error("Redirect without Location header");
        const nextUrl = new URL(location, current);
        // Re-validate redirect target (no private network bounce)
        current = assertSafeAuditUrl(nextUrl.toString(), {
          allowDemoRoute: false,
          enableExternal: true,
        });
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} while fetching page`);
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (
        contentType &&
        !/text\/html|application\/xhtml\+xml|text\/plain/i.test(contentType)
      ) {
        throw new Error(`Unsupported content type: ${contentType}`);
      }

      const contentLength = Number(response.headers.get("content-length") ?? "0");
      if (contentLength > MAX_RESPONSE_BYTES) {
        throw new Error("Response exceeds size limit");
      }

      const buffer = await response.arrayBuffer();
      if (buffer.byteLength > MAX_RESPONSE_BYTES) {
        throw new Error("Response exceeds size limit");
      }

      const html = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
      return {
        finalUrl: current,
        html,
        contentType,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error("Too many redirects");
}
