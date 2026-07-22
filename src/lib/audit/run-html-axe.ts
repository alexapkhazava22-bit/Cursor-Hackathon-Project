import { readFileSync } from "node:fs";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";
import {
  buildDeterministicResult,
  mapAxeViolations,
} from "@/lib/audit/engine";
import type { DeterministicAuditResult } from "@/lib/types";
import type { Result as AxeResult } from "axe-core";

type AxeWindow = Window & {
  axe?: {
    run: (
      context: unknown,
      options?: unknown,
    ) => Promise<{
      violations: AxeResult[];
      passes: AxeResult[];
      incomplete: AxeResult[];
      inapplicable: AxeResult[];
    }>;
  };
};

function loadAxeBrowserSource(): string {
  const minPath = path.join(
    process.cwd(),
    "node_modules",
    "axe-core",
    "axe.min.js",
  );
  return readFileSync(minPath, "utf8");
}

/**
 * Strip scripts and inline handlers so audited pages cannot execute code.
 * We still need runScripts:"dangerously" so our injected axe bundle can run.
 */
export function sanitizeHtmlForAudit(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<script\b[^>]*\/>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(['"])[\s\S]*?\1/gi, "")
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "");
}

/**
 * Run axe-core against fetched HTML inside jsdom without mutating Node globals.
 * Page JavaScript is stripped before parse; only the injected axe bundle runs.
 */
export async function runAxeOnHtmlString(
  html: string,
  auditedUrl: string,
): Promise<DeterministicAuditResult> {
  const pageUrl = auditedUrl.startsWith("http")
    ? auditedUrl
    : `http://localhost${auditedUrl.startsWith("/") ? auditedUrl : `/${auditedUrl}`}`;

  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", () => undefined);
  virtualConsole.on("error", () => undefined);
  virtualConsole.on("warn", () => undefined);

  const dom = new JSDOM(sanitizeHtmlForAudit(html), {
    url: pageUrl,
    pretendToBeVisual: true,
    runScripts: "dangerously",
    virtualConsole,
  });

  try {
    const { window } = dom;
    const doc = window.document;

    // Defense in depth
    doc.querySelectorAll("script").forEach((node) => node.remove());

    const script = doc.createElement("script");
    script.textContent = loadAxeBrowserSource();
    doc.documentElement.appendChild(script);

    const axeWindow = window as unknown as AxeWindow;
    if (!axeWindow.axe?.run) {
      throw new Error("Failed to initialize axe-core inside jsdom");
    }

    const results = await axeWindow.axe.run(doc, {
      resultTypes: ["violations", "passes", "incomplete", "inapplicable"],
    });

    return buildDeterministicResult({
      auditedUrl,
      violations: mapAxeViolations(results.violations),
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      inapplicable: results.inapplicable.length,
      timestamp: new Date().toISOString(),
    });
  } finally {
    try {
      dom.window.close();
    } catch {
      // ignore
    }
  }
}
