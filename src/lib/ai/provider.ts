import type {
  AIExplanationResult,
  AuditViolation,
  DeveloperExplanation,
  ExplainedIssue,
  OwnerExplanation,
  Severity,
} from "@/lib/types";

export interface AIProvider {
  readonly name: string;
  explainViolations(
    violations: AuditViolation[],
    context: { auditedUrl: string; businessName?: string },
  ): Promise<AIExplanationResult>;
}

const PRIORITY: Record<Severity, string> = {
  CRITICAL: "მაღალი — დაუყოვნებლივ",
  SERIOUS: "მაღალი",
  MODERATE: "საშუალო",
  MINOR: "დაბალი",
};

const DIFFICULTY: Record<Severity, string> = {
  CRITICAL: "საშუალო",
  SERIOUS: "საშუალო",
  MODERATE: "მარტივი–საშუალო",
  MINOR: "მარტივი",
};

function ownerFallback(v: AuditViolation): OwnerExplanation {
  return {
    problemKa: `${v.help}. ${v.description}`,
    whoAffectedKa:
      "მომხმარებლები, რომლებიც იყენებენ ეკრანის წამკითხველს, კლავიატურას ან უკეთეს კონტრასტს საჭიროებენ.",
    businessImpactKa:
      "შეიძლება დაკარგოთ კლიენტები, შეამციროთ ნდობა და გაგიჭირდეთ ხელმისაწვდომობის მოთხოვნების დაკმაყოფილება.",
    priorityKa: PRIORITY[v.impact],
    difficultyKa: DIFFICULTY[v.impact],
    askDeveloperKa: `გთხოვთ გამოასწოროთ axe-core წესი „${v.ruleId}“ გვერდზე. დეტალები: ${v.failureSummary ?? v.help}`,
    retestKa:
      "გამოსწორების შემდეგ ხელახლა გაუშვით AccessChain აუდიტი იმავე URL-ზე და შეამოწმეთ, რომ ეს პრობლემა აღარ ჩანს.",
  };
}

function developerFallback(v: AuditViolation): DeveloperExplanation {
  const selector = v.nodes[0]?.target?.join(" ") ?? undefined;
  return {
    technicalCause: v.description,
    affectedElement: v.nodes[0]?.html ?? selector ?? "unknown element",
    suggestedFix: `Address axe rule "${v.ruleId}": ${v.help}. ${v.failureSummary ?? ""}`.trim(),
    codeExample: suggestCodeExample(v.ruleId),
    acceptanceCriteria: [
      `axe-core rule "${v.ruleId}" no longer reports a violation on the affected node(s)`,
      "Manual keyboard / screen-reader smoke check passes for the fixed control",
    ],
    retestingSteps: [
      "Reload the audited page",
      "Re-run AccessChain or axe-core against the same URL",
      "Confirm the rule ID is absent from violations",
    ],
    selector,
    wcagReference: v.wcagReferences[0] ?? v.helpUrl,
    severity: v.impact,
    ruleId: v.ruleId,
  };
}

function suggestCodeExample(ruleId: string): string | undefined {
  switch (ruleId) {
    case "image-alt":
      return `<img src="/hero.jpg" alt="პროდუქტის მთავარი ვიზუალი" />`;
    case "label":
      return `<label htmlFor="email">ელფოსტა</label>\n<input id="email" name="email" type="email" />`;
    case "button-name":
      return `<button type="button">გაგზავნა</button>`;
    case "html-has-lang":
      return `<html lang="ka">`;
    case "color-contrast":
      return `/* Ensure text/background contrast ≥ 4.5:1 for normal text */\n.low-contrast { color: #1a1a1a; background: #ffffff; }`;
    case "heading-order":
      return `<h1>მთავარი</h1>\n<h2>სექცია</h2>\n<h3>ქვესექცია</h3>`;
    default:
      return undefined;
  }
}

function explainOne(v: AuditViolation): ExplainedIssue {
  // Richer deterministic Georgian copy for known demo rules
  const owner = enrichOwner(v);
  const developer = developerFallback(v);
  return {
    violationId: v.id,
    ruleId: v.ruleId,
    impact: v.impact,
    owner,
    developer,
    source: "fallback",
  };
}

function enrichOwner(v: AuditViolation): OwnerExplanation {
  const base = ownerFallback(v);
  const map: Record<string, Partial<OwnerExplanation>> = {
    "image-alt": {
      problemKa: "სურათს არ აქვს ალტერნატიული ტექსტი (alt).",
      whoAffectedKa: "უპირველესად უსინათლო ან სუსტად მხედველი მომხმარებლები, რომლებიც ეკრანის წამკითხველს იყენებენ.",
      businessImpactKa: "მნიშვნელოვანი ვიზუალური კონტენტი მათთვის უხილავია — შეიძლება დაკარგოთ კონვერსია და ნდობა.",
      askDeveloperKa: "დაამატეთ ყველა ინფორმაციულ სურათს მოკლე, შინაარსიანი alt ტექსტი.",
    },
    "color-contrast": {
      problemKa: "ტექსტისა და ფონის კონტრასტი საკმარისი არ არის.",
      whoAffectedKa: "სუსტად მხედველი მომხმარებლები და მზიან გარემოში მომუშავე ადამიანები.",
      businessImpactKa: "მნიშვნელოვანი ტექსტი შეიძლება წაუკითხავი დარჩეს და გამოიწვიოს შეცდომები ან უარყოფითი გამოცდილება.",
      askDeveloperKa: "გაზარდეთ ტექსტის კონტრასტი მინიმუმ WCAG AA დონემდე (ჩვეულებრივ 4.5:1).",
    },
    label: {
      problemKa: "ფორმის ველს არ აქვს ხილული ან დაკავშირებული ლეიბლი.",
      whoAffectedKa: "ეკრანის წამკითხველის მომხმარებლები და ყველა, ვისაც სჭირდება მკაფიო ფორმის ინსტრუქცია.",
      businessImpactKa: "ფორმის შევსების შეცდომები იზრდება — კონტაქტი/გადახდა შეიძლება ჩავარდეს.",
      askDeveloperKa: "დააკავშირეთ <label> თითოეულ input-თან (htmlFor/id) ან გამოიყენეთ aria-label.",
    },
    "button-name": {
      problemKa: "ღილაკს არ აქვს გასაგები სახელი.",
      whoAffectedKa: "ეკრანის წამკითხველისა და კლავიატურის მომხმარებლები.",
      businessImpactKa: "მოქმედების ღილაკები გამოუყენებელი ხდება — კრიტიკული CTA შეიძლება დაიკარგოს.",
      askDeveloperKa: "დაამატეთ ღილაკს ტექსტი ან aria-label, რომელიც მოქმედებას აღწერს.",
    },
    "html-has-lang": {
      problemKa: "გვერდს არ აქვს მითითებული ენის ატრიბუტი (lang).",
      whoAffectedKa: "ეკრანის წამკითხველის მომხმარებლები, რომლებსაც სწორი გამოთქმა/ენა სჭირდებათ.",
      businessImpactKa: "კონტენტი შეიძლება არასწორ ენაზე წაიკითხოს — ცუდი პირველი შთაბეჭდილება.",
      askDeveloperKa: "დაამატეთ <html lang=\"ka\"> (ან შესაბამისი ენის კოდი).",
    },
    "heading-order": {
      problemKa: "სათაურების იერარქია გამოტოვებულია (მაგ. h1-დან h4-ზე).",
      whoAffectedKa: "მომხმარებლები, რომლებიც სათაურებით ნავიგაციას აკეთებენ.",
      businessImpactKa: "გვერდის სტრუქტურა გაუგებარია — რთულდება ინფორმაციის მოძებნა.",
      askDeveloperKa: "გამოასწორეთ სათაურების თანმიმდევრობა ერთი დონით ერთდროულად.",
    },
    "nested-interactive": {
      problemKa: "ინტერაქტიული ელემენტი კლავიატურით მიუწვდომელია ან არასწორადაა აგებული.",
      whoAffectedKa: "კლავიატურის მომხმარებლები და მოტორული შეზღუდვის მქონე ადამიანები.",
      businessImpactKa: "ნაწილი მომხმარებლების ვერ შეძლებს მთავარ მოქმედებებს საიტზე.",
      askDeveloperKa: "გამოიყენეთ ნამდვილი <button> ან <a>, დაამატეთ tabindex/role საჭიროებისამებრ, უზრუნველყავით ფოკუსი.",
    },
  };
  return { ...base, ...map[v.ruleId] };
}

/**
 * Deterministic MockAIProvider — default for the hackathon MVP.
 * Never invents violations; only explains axe-core findings.
 */
export class MockAIProvider implements AIProvider {
  readonly name = "MockAIProvider";

  async explainViolations(
    violations: AuditViolation[],
    _context: { auditedUrl: string; businessName?: string },
  ): Promise<AIExplanationResult> {
    const issues = violations.map(explainOne);
    return {
      issues,
      provider: this.name,
      generatedAt: new Date().toISOString(),
      usedFallback: false,
    };
  }
}

/**
 * Optional production provider stub — server-only wiring.
 * Falls back to MockAIProvider explanations if not configured.
 */
export class ProductionAIProvider implements AIProvider {
  readonly name = "ProductionAIProvider";

  async explainViolations(
    violations: AuditViolation[],
    context: { auditedUrl: string; businessName?: string },
  ): Promise<AIExplanationResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || process.env.NEXT_PUBLIC_ENABLE_REAL_AI !== "true") {
      const mock = new MockAIProvider();
      const result = await mock.explainViolations(violations, context);
      return { ...result, provider: `${this.name}->MockAIProvider`, usedFallback: true };
    }

    // Real provider would call an LLM with ONLY the provided violations.
    // For the MVP we still route through deterministic explanations to avoid invention.
    const mock = new MockAIProvider();
    const result = await mock.explainViolations(violations, context);
    return { ...result, provider: this.name, usedFallback: true };
  }
}

export function getAIProvider(): AIProvider {
  if (
    process.env.NEXT_PUBLIC_ENABLE_REAL_AI === "true" &&
    typeof window === "undefined"
  ) {
    return new ProductionAIProvider();
  }
  return new MockAIProvider();
}

export async function explainWithFallback(
  violations: AuditViolation[],
  context: { auditedUrl: string; businessName?: string },
): Promise<AIExplanationResult> {
  try {
    return await getAIProvider().explainViolations(violations, context);
  } catch {
    const issues = violations.map((v) => ({
      violationId: v.id,
      ruleId: v.ruleId,
      impact: v.impact,
      owner: ownerFallback(v),
      developer: developerFallback(v),
      source: "fallback" as const,
    }));
    return {
      issues,
      provider: "fallback",
      generatedAt: new Date().toISOString(),
      usedFallback: true,
    };
  }
}
