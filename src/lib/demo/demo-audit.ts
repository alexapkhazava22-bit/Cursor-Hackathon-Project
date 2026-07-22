import { DEMO_SITE_PATH } from "@/lib/types";
import type { AuditViolation, DeterministicAuditResult } from "@/lib/types";
import { buildDeterministicResult } from "@/lib/audit/engine";
import { AUDIT_ENGINE_VERSION } from "@/lib/audit/engine";

/**
 * Deterministic demo audit matching the bundled inaccessible demo website.
 * Stable IDs/order so hashes remain reproducible across runs of the same fixture.
 */
export function getDemoViolations(): AuditViolation[] {
  return [
    {
      id: "html-has-lang-0",
      ruleId: "html-has-lang",
      help: "Document must have a lang attribute",
      description:
        "Ensures every HTML document has a lang attribute so assistive technologies can determine the language.",
      impact: "SERIOUS",
      helpUrl: "https://dequeuniversity.com/rules/axe/4.10/html-has-lang",
      tags: ["cat.language", "wcag2a", "wcag311", "ACT"],
      wcagReferences: ["WCAG2A", "WCAG311"],
      failureSummary: "Fix any of the following: The <html> element does not have a lang attribute",
      nodes: [
        {
          target: ["html"],
          html: "<html>",
          failureSummary:
            "Fix any of the following: The <html> element does not have a lang attribute",
        },
      ],
    },
    {
      id: "image-alt-0",
      ruleId: "image-alt",
      help: "Images must have alternate text",
      description:
        "Ensures <img> elements have alternate text or a role of none or presentation.",
      impact: "CRITICAL",
      helpUrl: "https://dequeuniversity.com/rules/axe/4.10/image-alt",
      tags: ["cat.text-alternatives", "wcag2a", "wcag111", "section508"],
      wcagReferences: ["WCAG2A", "WCAG111"],
      failureSummary: "Fix any of the following: Element does not have an alt attribute",
      nodes: [
        {
          target: ['img[src="/demo-hero.svg"]'],
          html: '<img src="/demo-hero.svg">',
          failureSummary:
            "Fix any of the following: Element does not have an alt attribute",
        },
      ],
    },
    {
      id: "color-contrast-0",
      ruleId: "color-contrast",
      help: "Elements must meet minimum color contrast ratio thresholds",
      description:
        "Ensures the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds.",
      impact: "SERIOUS",
      helpUrl: "https://dequeuniversity.com/rules/axe/4.10/color-contrast",
      tags: ["cat.color", "wcag2aa", "wcag143"],
      wcagReferences: ["WCAG2AA", "WCAG143"],
      failureSummary:
        "Fix any of the following: Element has insufficient color contrast of 2.1",
      nodes: [
        {
          target: [".low-contrast"],
          html: '<p class="low-contrast">მნიშვნელოვანი ინფორმაცია თითქმის უხილავია</p>',
          failureSummary:
            "Fix any of the following: Element has insufficient color contrast of 2.1",
        },
      ],
    },
    {
      id: "label-0",
      ruleId: "label",
      help: "Form elements must have labels",
      description: "Ensures every form element has a label.",
      impact: "CRITICAL",
      helpUrl: "https://dequeuniversity.com/rules/axe/4.10/label",
      tags: ["cat.forms", "wcag2a", "wcag412"],
      wcagReferences: ["WCAG2A", "WCAG412"],
      failureSummary: "Fix any of the following: Form element does not have an associated label",
      nodes: [
        {
          target: ['input[name="email"]'],
          html: '<input name="email" type="email" placeholder="ელფოსტა">',
          failureSummary:
            "Fix any of the following: Form element does not have an associated label",
        },
      ],
    },
    {
      id: "button-name-0",
      ruleId: "button-name",
      help: "Buttons must have discernible text",
      description:
        "Ensures buttons have discernible text for screen reader users.",
      impact: "CRITICAL",
      helpUrl: "https://dequeuniversity.com/rules/axe/4.10/button-name",
      tags: ["cat.name-role-value", "wcag2a", "wcag412"],
      wcagReferences: ["WCAG2A", "WCAG412"],
      failureSummary: "Fix any of the following: Element does not have inner text that is visible to screen readers",
      nodes: [
        {
          target: ["button.empty-btn"],
          html: '<button class="empty-btn" type="button"></button>',
          failureSummary:
            "Fix any of the following: Element does not have inner text that is visible to screen readers",
        },
      ],
    },
    {
      id: "heading-order-0",
      ruleId: "heading-order",
      help: "Heading levels should only increase by one",
      description:
        "Ensures the order of headings is semantically correct (no skipped levels).",
      impact: "MODERATE",
      helpUrl: "https://dequeuniversity.com/rules/axe/4.10/heading-order",
      tags: ["cat.semantics", "best-practice"],
      wcagReferences: [],
      failureSummary: "Fix any of the following: Heading order is invalid",
      nodes: [
        {
          target: ["h4.skipped-heading"],
          html: "<h4 class=\"skipped-heading\">ფასები</h4>",
          failureSummary: "Fix any of the following: Heading order is invalid",
        },
      ],
    },
    {
      id: "nested-interactive-0",
      ruleId: "nested-interactive",
      help: "Interactive controls must not be nested",
      description:
        "Ensures interactive controls are not nested so they can be operated independently with assistive tech and keyboards.",
      impact: "SERIOUS",
      helpUrl: "https://dequeuniversity.com/rules/axe/4.10/nested-interactive",
      tags: ["cat.keyboard", "wcag2a", "wcag412"],
      wcagReferences: ["WCAG2A", "WCAG412"],
      failureSummary:
        "Demo also includes a clickable div without role/tabindex — keyboard inaccessible pattern",
      nodes: [
        {
          target: [".fake-link"],
          html: '<div class="fake-link" onclick="alert(\'clicked\')">დაწკაპუნეთ აქ</div>',
          failureSummary:
            "Element is not keyboard accessible: no tabindex / role / button semantics",
        },
      ],
    },
  ];
}

export function getDeterministicDemoAudit(
  auditedUrl: string = DEMO_SITE_PATH,
  timestamp = "2026-07-22T12:00:00.000Z",
): DeterministicAuditResult {
  const result = buildDeterministicResult({
    auditedUrl,
    violations: getDemoViolations(),
    passes: 12,
    incomplete: 1,
    inapplicable: 40,
    timestamp,
  });
  // Pin engine version string used in canonical hashing for demo stability in tests
  return {
    ...result,
    engineVersion: AUDIT_ENGINE_VERSION,
  };
}

export const SAMPLE_AUDIT_ID = "ac_demo_sample_001";
