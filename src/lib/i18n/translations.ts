export type Locale = "ka" | "en";

export const locales: Locale[] = ["ka", "en"];

export const localeLabels: Record<Locale, string> = {
  ka: "ქართული",
  en: "English",
};

const dict = {
  brand: { ka: "AccessChain", en: "AccessChain" },
  navNewAudit: { ka: "ახალი აუდიტი", en: "New Audit" },
  navHistory: { ka: "ისტორია", en: "History" },
  navDemo: { ka: "დემო საიტი", en: "Demo Site" },
  navCheckSite: { ka: "შეამოწმე საიტი", en: "Check website" },
  language: { ka: "ენა", en: "Language" },
  theme: { ka: "თემა", en: "Theme" },
  themeLight: { ka: "ღია", en: "Light" },
  themeDark: { ka: "მუქი", en: "Dark" },
  footerBlurb: {
    ka: "AI-ზე დაფუძნებული accessibility აუდიტი ბიზნესებისთვის — Solana Devnet გადახდით და ანგარიშის მთლიანობის დამოწმებით.",
    en: "AI-powered accessibility audit for business owners — with Solana Devnet payments and verifiable report integrity.",
  },
  footerHonesty: {
    ka: "Solana ჰეში ადასტურებს ანგარიშის მთლიანობას და ტრანზაქციის ისტორიას — არა დასკვნების სისწორეს.",
    en: "Solana hash proves report integrity and transaction history — not that audit conclusions are correct.",
  },
  landingHeadline: {
    ka: "გაიგე რამდენად ხელმისაწვდომია შენი საიტი — ტექნიკური ცოდნის გარეშე",
    en: "See how accessible your website is — without technical knowledge",
  },
  landingSupport: {
    ka: "AI აღმოაჩენს accessibility პრობლემებს, აგიხსნის მათ მარტივი ენით და დეველოპერს მისცემს გამოსასწორებელ ტექნიკურ დავალებას. ანგარიშის ჰეში დამოწმდება Solana-ზე.",
    en: "AI finds accessibility issues, explains them in plain language, and gives developers a technical fix plan. The report hash is attested on Solana.",
  },
  landingCtaPrimary: { ka: "შეამოწმე საიტი", en: "Check website" },
  landingCtaSecondary: { ka: "იხილე დემო ანგარიში", en: "View demo report" },
  landingCardEyebrow: {
    ka: "Solana Devnet · Report Integrity",
    en: "Solana Devnet · Report Integrity",
  },
  landingCardTitle: {
    ka: "აუდიტი → ჰეში → ანაბეჭდი",
    en: "Audit → Hash → Attestation",
  },
  landingCardBody: {
    ka: "გადახდა 0.01 SOL · axe-core · SHA-256 · Memo attestation",
    en: "Pay 0.01 SOL · axe-core · SHA-256 · Memo attestation",
  },
  landingViewOwner: { ka: "ბიზნესის ხედი", en: "Business view" },
  landingViewDev: { ka: "დეველოპერის ხედი", en: "Developer view" },
  howItWorks: { ka: "როგორ მუშაობს", en: "How it works" },
  howItWorksSupport: {
    ka: "ერთი საიმედო ნაკადი — URL-დან გადამოწმებად სერტიფიკატამდე.",
    en: "One reliable flow — from URL to a verifiable certificate.",
  },
  step1: { ka: "მიუთითე საიტი", en: "Enter your site" },
  step2: { ka: "გადაიხადე Devnet SOL", en: "Pay Devnet SOL" },
  step3: { ka: "მიიღე AI აუდიტი", en: "Get an AI audit" },
  step4: {
    ka: "გადაამოწმე სერტიფიკატი Solana-ზე",
    en: "Verify the certificate on Solana",
  },
  limitationNotice: {
    ka: "ავტომატური აუდიტი ვერ აღმოაჩენს accessibility პრობლემების 100%-ს. შედეგი წარმოადგენს ავტომატურ ტექნიკურ შეფასებას და არა ოფიციალურ იურიდიულ სერტიფიცირებას.",
    en: "Automated auditing cannot find 100% of accessibility issues. The result is an automated technical assessment, not an official legal certification.",
  },
  demoModePrefix: { ka: "DEMO_MODE:", en: "DEMO_MODE:" },
  demoModeNotReal: {
    ka: "არ არის რეალური blockchain ვერიფიკაცია.",
    en: "This is not real blockchain verification.",
  },
  newAuditTitle: { ka: "ახალი აუდიტი", en: "New Audit" },
  newAuditSupport: {
    ka: "მიუთითე საიტი, გადაიხადე Devnet SOL და მიიღე AI ახსნადი ანგარიში.",
    en: "Enter a site, pay Devnet SOL, and receive an AI-explained report.",
  },
  demoSiteLabel: {
    ka: "AccessChain Demo (ლოკალური მიუწვდომელი საიტი)",
    en: "AccessChain Demo (local inaccessible site)",
  },
  demoSiteHelp: {
    ka: "ლოკალური დემო — არ დამოკიდებულა გარე საიტებზე.",
    en: "Local demo — does not depend on third-party sites.",
  },
  viewDemo: { ka: "იხილე დემო", en: "View demo" },
  websiteUrl: { ka: "საიტის URL", en: "Website URL" },
  externalDisabled: {
    ka: "გარე URL აუდიტი გამორთულია (NEXT_PUBLIC_ENABLE_EXTERNAL_AUDIT=false).",
    en: "External URL auditing is disabled (NEXT_PUBLIC_ENABLE_EXTERNAL_AUDIT=false).",
  },
  externalEnabledHint: {
    ka: "გარე URL-ები აუდიტდება სერვერზე SSRF დაცვით. შეცდომისას AccessChain დემო შედეგზე გადადის.",
    en: "External URLs are audited server-side with SSRF protections. On failure, AccessChain falls back to demo findings.",
  },
  businessName: {
    ka: "ბიზნესის სახელი (არასავალდებულო)",
    en: "Business name (optional)",
  },
  emailMeta: {
    ka: "Email — მხოლოდ ლოკალური დემო მეტამონაცემი",
    en: "Email — local demo metadata only",
  },
  ackLimitations: {
    ka: "ვადასტურებ, რომ ავტომატური ტესტირება ვერ აღმოაჩენს ყველა accessibility პრობლემას.",
    en: "I acknowledge that automated testing cannot find every accessibility issue.",
  },
  continuePayment: {
    ka: "გაგრძელება — საფულე და გადახდა",
    en: "Continue — wallet & payment",
  },
  ackRequired: {
    ka: "გთხოვთ დაადასტუროთ შეზღუდვების შესახებ.",
    en: "Please acknowledge the limitations.",
  },
  paymentTitle: { ka: "საფულე და გადახდა", en: "Wallet & payment" },
  paymentSupport: {
    ka: "Phantom-compatible Wallet Standard · მხოლოდ Solana Devnet",
    en: "Phantom-compatible Wallet Standard · Solana Devnet only",
  },
  demoWalletHint: {
    ka: "შეგიძლიათ გამოიყენოთ დემო საფულის ნაკადი",
    en: "You can use the demo wallet flow",
  },
  beforeSigning: { ka: "ხელმოწერამდე", en: "Before signing" },
  action: { ka: "მოქმედება", en: "Action" },
  amount: { ka: "თანხა", en: "Amount" },
  recipient: { ka: "მიმღები", en: "Recipient" },
  network: { ka: "ქსელი", en: "Network" },
  auditRequestId: { ka: "აუდიტის მოთხოვნის ID", en: "Audit request ID" },
  wallet: { ka: "საფულე", en: "Wallet" },
  phantomMissing: {
    ka: "Phantom არ არის დაყენებული. დააინსტალირეთ ან გამოიყენეთ დემო ნაკადი.",
    en: "Phantom is not installed. Install it or use the demo flow.",
  },
  address: { ka: "მისამართი", en: "Address" },
  balance: { ka: "ბალანსი", en: "Balance" },
  wrongNetwork: {
    ka: "არასწორი ქსელი — გადართეთ Solana Devnet-ზე.",
    en: "Wrong network — switch to Solana Devnet.",
  },
  insufficientSol: {
    ka: "არასაკმარისი Devnet SOL. მოითხოვეთ airdrop ან გამოიყენეთ დემო ნაკადი.",
    en: "Insufficient Devnet SOL. Request an airdrop or use the demo flow.",
  },
  disconnect: { ka: "გათიშვა", en: "Disconnect" },
  connectWallet: { ka: "საფულის დაკავშირება", en: "Connect Wallet" },
  connecting: { ka: "ინება…", en: "Connecting…" },
  pay: { ka: "გადაიხადე", en: "Pay" },
  simulating: { ka: "სიმულაცია…", en: "Simulation…" },
  pending: { ka: "მიმდინარეობს…", en: "Pending…" },
  useDemoWallet: {
    ka: "დემო საფულის ნაკადი",
    en: "Use demo wallet flow",
  },
  paymentFailed: { ka: "გადახდა ჩაიშალა", en: "Payment failed" },
  retryPayment: { ka: "ხელახლა გადახდა", en: "Retry payment" },
  loading: { ka: "იტვირთება…", en: "Loading…" },
  auditNotFound: { ka: "აუდიტი ვერ მოიძებნა.", en: "Audit not found." },
  progressTitle: { ka: "აუდიტი მიმდინარეობს", en: "Audit in progress" },
  progressSupport: {
    ka: "Deterministic axe-core · AI ახსნა · canonical SHA-256",
    en: "Deterministic axe-core · AI explanation · canonical SHA-256",
  },
  stepPaymentConfirmed: { ka: "გადახდა დადასტურდა", en: "Payment confirmed" },
  stepRunningAudit: { ka: "axe-core აუდიტი", en: "Running axe-core audit" },
  stepAi: { ka: "AI ახსნების გენერაცია", en: "Generating AI explanations" },
  stepCanonical: {
    ka: "კანონიკური ანგარიშის შექმნა",
    en: "Creating canonical report",
  },
  stepHash: { ka: "SHA-256 ჰეშის გამოთვლა", en: "Calculating SHA-256 hash" },
  backToPayment: { ka: "უკან გადახდაზე", en: "Back to payment" },
  reportTitle: { ka: "AccessChain ანგარიში", en: "AccessChain Report" },
  paymentVerified: { ka: "გადახდა დადასტურებულია", en: "Payment verified" },
  solanaAnchored: { ka: "Solana-ზე დამაგრებული", en: "Solana anchored" },
  developerFixPlan: {
    ka: "დეველოპერის გეგმა",
    en: "Developer Fix Plan",
  },
  certificate: { ka: "სერტიფიკატი", en: "Certificate" },
  tabOwner: { ka: "ბიზნესისთვის", en: "For business" },
  tabDev: { ka: "დეველოპერისთვის", en: "For developers" },
  tabTech: { ka: "ტექნიკური შედეგები", en: "Technical results" },
  tabSolana: { ka: "Solana მტკიცებულება", en: "Solana evidence" },
  aiExplanationNote: {
    ka: "AI ახსნა · მხოლოდ axe-core-ის დეტერმინისტულ დარღვევებზე დაყრდნობით",
    en: "AI-generated explanation · based only on deterministic axe-core violations",
  },
  whatProblem: { ka: "რა პრობლემაა?", en: "What is the problem?" },
  whoAffected: { ka: "ვის ეხება?", en: "Who is affected?" },
  businessImpact: {
    ka: "ბიზნესზე რა გავლენა აქვს?",
    en: "What is the business impact?",
  },
  howPriority: {
    ka: "რამდენად პრიორიტეტულია?",
    en: "How high is the priority?",
  },
  askDeveloper: {
    ka: "რა უთხრას დეველოპერს?",
    en: "What should you ask the developer?",
  },
  howRetest: {
    ka: "როგორ შევამოწმო გამოსწორება?",
    en: "How do I retest the fix?",
  },
  difficulty: { ka: "სირთულე", en: "Difficulty" },
  suggestedFix: { ka: "შემოთავაზებული გამოსწორება", en: "Suggested fix" },
  acceptanceCriteria: {
    ka: "მიღების კრიტერიუმები",
    en: "Acceptance criteria",
  },
  healthScoreNote: {
    ka: "(გამჭვირვალე ფორმულა მხოლოდ ავტომატური აღმოჩენებიდან — არა ოფიციალური ქულა)",
    en: "(transparent formula from automated findings only — not an official score)",
  },
  reportNotReady: {
    ka: "ანგარიში ჯერ არ არის მზად.",
    en: "Report is not ready yet.",
  },
  reportLoading: {
    ka: "ანგარიში იტვირთება…",
    en: "Loading report…",
  },
  techPassed: { ka: "გავლილი შემოწმებები", en: "passed checks" },
  helpUrl: { ka: "დახმარების ბმული", en: "Help URL" },
  mockPaymentAttestation: {
    ka: "Mock გადახდა/ატესტაცია",
    en: "Mock payment/attestation",
  },
  connectedWallet: {
    ka: "დაკავშირებული / გადამხდელი საფულე",
    en: "Connected / payer wallet",
  },
  auditPrice: { ka: "აუდიტის ფასი", en: "Audit price" },
  paymentStatus: { ka: "გადახდის სტატუსი", en: "Payment status" },
  paymentSignature: { ka: "გადახდის ხელმოწერა", en: "Payment signature" },
  reportSha: { ka: "ანგარიშის SHA-256", en: "Report SHA-256" },
  attestationStatus: {
    ka: "ატესტაციის სტატუსი",
    en: "Attestation status",
  },
  attestationSignature: {
    ka: "ატესტაციის ხელმოწერა",
    en: "Attestation signature",
  },
  attestExplain: {
    ka: "ეს მოქმედება Solana-ზე დააფიქსირებს ანგარიშის ციფრულ ანაბეჭდს. სრული ანგარიში საჯაროდ არ აიტვირთება.",
    en: "This action will record the report’s digital fingerprint on Solana. The full report is not uploaded publicly.",
  },
  anchorHash: {
    ka: "ჰეშის დამაგრება Solana-ზე",
    en: "Anchor hash on Solana",
  },
  anchoring: { ka: "მიმაგრება…", en: "Anchoring…" },
  useDemoAttestation: {
    ka: "დემო ატესტაცია",
    en: "Use demo attestation",
  },
  reverifySolana: {
    ka: "ხელახლა გადამოწმება Solana-ზე",
    en: "Reverify on Solana",
  },
  developerTitle: {
    ka: "ტექნიკური დავალებები",
    en: "Technical tasks",
  },
  developerSupport: {
    ka: "მხოლოდ axe-core დარღვევები",
    en: "axe-core violations only",
  },
  affectedUrl: { ka: "დაზარალებული URL", en: "Affected URL" },
  affectedElement: { ka: "დაზარალებული ელემენტი", en: "Affected element" },
  selector: { ka: "სელექტორი", en: "Selector" },
  violatedRule: {
    ka: "დარღვეული წესი / WCAG",
    en: "Violated rule / WCAG",
  },
  technicalExplanation: {
    ka: "ტექნიკური ახსნა",
    en: "Technical explanation",
  },
  codeExample: { ka: "კოდის მაგალითი", en: "Code example" },
  retestingSteps: {
    ka: "ხელახალი შემოწმების ნაბიჯები",
    en: "Retesting steps",
  },
  fixPlanNotReady: {
    ka: "Developer fix plan ჯერ არ არის მზად.",
    en: "Developer fix plan is not ready yet.",
  },
  backToReport: { ka: "უკან ანგარიშზე", en: "Back to report" },
  report: { ka: "ანგარიში", en: "Report" },
  certificateLoading: {
    ka: "სერტიფიკატი იტვირთება…",
    en: "Loading certificate…",
  },
  certificateNotReady: {
    ka: "სერტიფიკატი ჯერ არ არის მზად.",
    en: "Certificate is not ready yet.",
  },
  certificateDemoBanner: {
    ka: "სერტიფიკატი შეიცავს დემო mock chain მტკიცებულებას",
    en: "Certificate includes demo mock chain evidence",
  },
  business: { ka: "ბიზნესი", en: "Business" },
  auditedDomain: { ka: "შემოწმებული დომენი", en: "Audited domain" },
  auditId: { ka: "აუდიტის ID", en: "Audit ID" },
  auditDate: { ka: "აუდიტის თარიღი", en: "Audit date" },
  automatedIssues: {
    ka: "ავტომატური პრობლემები",
    en: "Automated issues",
  },
  payerAttester: {
    ka: "გადამხდელი / ატესტატორი",
    en: "Payer / attester",
  },
  paymentTx: { ka: "გადახდის tx", en: "Payment tx" },
  attestationTx: { ka: "ატესტაციის tx", en: "Attestation tx" },
  verificationUrl: {
    ka: "გადამოწმების ბმული",
    en: "Verification URL",
  },
  openVerification: {
    ka: "გადამოწმების გახსნა",
    en: "Open verification",
  },
  certificateDisclaimer: {
    ka: "Solana ატესტაცია ადასტურებს ანგარიშის მთლიანობას და ტრანზაქციის ისტორიას — არა accessibility დასკვნების სისწორეს. ეს არ არის WCAG Certified, Government Approved ან Official Compliance Certificate.",
    en: "Solana attestation proves report integrity and transaction history — not that accessibility conclusions are correct. This is not a WCAG Certified, Government Approved, or Official Compliance Certificate.",
  },
  verifyTitle: { ka: "გადამოწმება", en: "Verification" },
  verifyNotFound: {
    ka: "აუდიტი ამ მოწყობილობის localStorage-ში ვერ მოიძებნა.",
    en: "Audit was not found in local storage on this device.",
  },
  startAudit: { ka: "დაიწყე აუდიტი", en: "Start an audit" },
  verifyDemoBanner: {
    ka: "გადამოწმება იყენებს დემო mock ატესტაციას",
    en: "Verification used demo mock attestation",
  },
  expectedHash: { ka: "მოსალოდნელი ჰეში", en: "Expected hash" },
  calculatedHash: { ka: "გამოთვლილი ჰეში", en: "Calculated hash" },
  txSignature: {
    ka: "ტრანზაქციის ხელმოწერა",
    en: "Transaction signature",
  },
  verificationTime: {
    ka: "გადამოწმების დრო",
    en: "Verification time",
  },
  openExplorer: {
    ka: "გახსენი Solana Explorer-ში",
    en: "Open in Solana Explorer",
  },
  retryVerification: {
    ka: "ხელახალი გადამოწმება",
    en: "Retry verification",
  },
  verifying: { ka: "მოწმდება…", en: "Verifying…" },
  updated: { ka: "განახლდა", en: "Updated" },
  historyTitle: { ka: "აუდიტების ისტორია", en: "Audit history" },
  historySupport: {
    ka: "ლოკალური შენახვა ამ მოწყობილობაზე (localStorage).",
    en: "Local storage on this device (localStorage).",
  },
  useSampleAudit: {
    ka: "სამაგალითო აუდიტი",
    en: "Use sample audit",
  },
  resetDemo: { ka: "დემოს განულება", en: "Reset demo" },
  historyEmpty: {
    ka: "ჯერ არ არის აუდიტი. დაიწყეთ ახალი ან ჩატვირთეთ sample audit.",
    en: "No audits yet. Start a new one or load a sample audit.",
  },
  verify: { ka: "გადამოწმება", en: "Verify" },
  demoShopTitle: { ka: "დემო მაღაზია", en: "Demo Shop" },
  demoPrices: { ka: "ფასები", en: "Prices" },
  demoCarouselHint: {
    ka: "რეალური გვერდების მაგალითები · ავტომატური კარუსელი",
    en: "Real page examples · automatic carousel",
  },
  demoDisclaimer: {
    ka: "AccessChain bundled demo — intentionally inaccessible. Do not copy these patterns.",
    en: "AccessChain bundled demo — intentionally inaccessible. Do not copy these patterns.",
  },
  demoLowContrast: {
    ka: "მნიშვნელოვანი ინფორმაცია თითქმის უხილავია",
    en: "Important information is almost invisible",
  },
  demoSubscribe: {
    ka: "გამოწერა / კონტაქტი",
    en: "Subscribe / Contact",
  },
  demoClickHere: { ka: "დაწკაპუნეთ აქ", en: "Click here" },
  demoProduct: { ka: "პროდუქტი", en: "Product" },
  emailPlaceholder: { ka: "ელფოსტა", en: "Email" },
} as const;

export type TranslationKey = keyof typeof dict;

export function translate(locale: Locale, key: TranslationKey): string {
  return dict[key][locale];
}

export { dict };
