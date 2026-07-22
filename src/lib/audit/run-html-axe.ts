import { readFileSync } from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
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
  // Resolve from project root — Next.js externals can break createRequire(import.meta.url)
  const minPath = path.join(
    process.cwd(),
    "node_modules",
    "axe-core",
    "axe.min.js",
  );
  return readFileSync(minPath, "utf8");
}

/**
 * Run axe-core against fetched HTML inside jsdom without mutating Node globals.
 * Loads axe.min.js from disk (Next bundles can strip axe.source).
 */
export async function runAxeOnHtmlString(
  html: string,
  auditedUrl: string,
): Promise<DeterministicAuditResult> {
  const pageUrl = auditedUrl.startsWith("http")
    ? auditedUrl
    : `http://localhost${auditedUrl.startsWith("/") ? auditedUrl : `/${auditedUrl}`}`;

  const dom = new JSDOM(html, {
    url: pageUrl,
    pretendToBeVisual: true,
    runScripts: "dangerously",
  });

  try {
    const { window } = dom;
    const doc = window.document;
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
    dom.window.close();
  }
}
