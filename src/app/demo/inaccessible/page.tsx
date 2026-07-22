export const metadata = {
  title: "Demo Inaccessible Site — AccessChain",
  description: "Intentionally inaccessible local demo website for AccessChain audits.",
};

/**
 * Intentionally inaccessible demo page for axe-core.
 * Contains: missing alt, low contrast, unlabeled input, empty button,
 * broken heading hierarchy, missing document language (via iframe note — page itself sets lang=und intentionally via attribute override),
 * keyboard-inaccessible interactive element.
 */
export default function InaccessibleDemoPage() {
  return (
    // Intentionally poor accessibility for demo purposes
    <div lang={undefined as unknown as string}>
      <div
        style={{
          fontFamily: "Georgia, serif",
          maxWidth: 720,
          margin: "0 auto",
          padding: "2rem 1rem",
        }}
      >
        <p style={{ color: "#888", fontSize: 12 }}>
          AccessChain bundled demo — intentionally inaccessible. Do not copy these patterns.
        </p>

        {/* Missing heading hierarchy: h1 then h4 */}
        <h1>დემო მაღაზია</h1>
        <h4 className="skipped-heading">ფასები</h4>

        {/* Missing image alt */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {/* Missing alt text — intentional */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/demo-hero.svg"
          width={640}
          height={240}
          style={{ width: "100%", height: "auto", marginTop: 16 }}
        />

        {/* Insufficient color contrast */}
        <p className="low-contrast" style={{ color: "#c8c8c8", background: "#ededed", padding: 12 }}>
          მნიშვნელოვანი ინფორმაცია თითქმის უხილავია
        </p>

        {/* Unlabeled form field */}
        <form style={{ marginTop: 24 }}>
          <input name="email" type="email" placeholder="ელფოსტა" />
          {/* Empty button */}
          <button className="empty-btn" type="button" style={{ marginLeft: 8, width: 40, height: 32 }} />
        </form>

        {/* Keyboard-inaccessible interactive element (inline handler via script for SSR safety) */}
        <div
          className="fake-link"
          data-demo-clickable="true"
          style={{
            marginTop: 24,
            color: "blue",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          დაწკაპუნეთ აქ
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.querySelector('[data-demo-clickable]')?.addEventListener('click',function(){alert('clicked')});`,
          }}
        />

        <p style={{ marginTop: 32, fontSize: 13, color: "#666" }}>
          This page is the primary AccessChain audit target. Open{" "}
          <a href="/audit/new">New Audit</a> and select the demo site.
        </p>
      </div>
    </div>
  );
}
