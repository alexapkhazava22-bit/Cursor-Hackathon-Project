import { describe, expect, it } from "vitest";
import { sanitizeHtmlForAudit } from "@/lib/audit/run-html-axe";

describe("sanitizeHtmlForAudit", () => {
  it("strips script tags and inline handlers", () => {
    const dirty = `<html><body onclick="evil()"><script>window.x=1</script><img src="a" onerror="alert(1)"><button></button></body></html>`;
    const clean = sanitizeHtmlForAudit(dirty);
    expect(clean).not.toMatch(/<script/i);
    expect(clean).not.toMatch(/onclick/i);
    expect(clean).not.toMatch(/onerror/i);
    expect(clean).toContain("<button>");
  });
});
