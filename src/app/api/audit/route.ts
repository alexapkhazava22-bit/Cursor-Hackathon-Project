import { NextResponse } from "next/server";
import { getFeatureFlags } from "@/lib/config";
import { fetchExternalPageHtml } from "@/lib/audit/fetch-page";
import { runAxeOnHtmlString } from "@/lib/audit/run-html-axe";
import { getDeterministicDemoAudit } from "@/lib/demo/demo-audit";
import { assertSafeAuditUrl, isDemoSiteUrl } from "@/lib/utils/ids";
import { DEMO_SITE_PATH } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const flags = getFeatureFlags();
  let body: { url?: string } = {};
  try {
    body = (await request.json()) as { url?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawUrl = body.url?.trim();
  if (!rawUrl) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  try {
    if (isDemoSiteUrl(rawUrl) || rawUrl.startsWith("/demo/")) {
      const demoUrl = rawUrl.startsWith("/demo/")
        ? rawUrl.split("?")[0]
        : DEMO_SITE_PATH;
      return NextResponse.json({
        source: "demo",
        result: getDeterministicDemoAudit(demoUrl, new Date().toISOString()),
      });
    }

    if (!flags.enableExternalAudit) {
      return NextResponse.json(
        {
          error: "External URL auditing is disabled",
          fallback: getDeterministicDemoAudit(
            DEMO_SITE_PATH,
            new Date().toISOString(),
          ),
        },
        { status: 403 },
      );
    }

    const safeUrl = assertSafeAuditUrl(rawUrl, {
      allowDemoRoute: true,
      enableExternal: true,
    });

    const page = await fetchExternalPageHtml(safeUrl);
    const result = await runAxeOnHtmlString(page.html, page.finalUrl);
    return NextResponse.json({
      source: "external",
      result,
    });
  } catch (error) {
    // Never let external failures break the product — offer demo fallback payload
    const message =
      error instanceof Error ? error.message : "External audit failed";
    return NextResponse.json(
      {
        error: message,
        fallback: getDeterministicDemoAudit(
          DEMO_SITE_PATH,
          new Date().toISOString(),
        ),
        usedFallback: true,
      },
      { status: 422 },
    );
  }
}
