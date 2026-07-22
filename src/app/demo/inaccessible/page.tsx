import Link from "next/link";
import { FakeClickableLink } from "@/components/demo/fake-clickable-link";
import { DemoPageCarousel } from "@/components/demo/demo-page-carousel";

export const metadata = {
  title: "Demo Shop — AccessChain",
  description:
    "Bundled demo storefront with intentional accessibility issues and rotating page examples.",
};

/**
 * Intentionally inaccessible demo storefront for axe-core.
 * Looks like a real multi-page shop (carousel of page examples) while still
 * containing: missing alt, low contrast, unlabeled input, empty button,
 * broken heading hierarchy, keyboard-inaccessible control.
 */
export default function InaccessibleDemoPage() {
  return (
    <div>
      <div
        style={{
          fontFamily: "Georgia, 'Noto Serif Georgian', serif",
          maxWidth: 880,
          margin: "0 auto",
          padding: "1.5rem 1rem 3rem",
        }}
      >
        {/* Mini site chrome */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            paddingBottom: 14,
            borderBottom: "1px solid #d7e0df",
            marginBottom: 18,
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#0b5f63",
                fontWeight: 700,
              }}
            >
              AccessChain Demo Shop
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#888" }}>
              რეალური გვერდების მაგალითები · ავტომატური კარუსელი
            </p>
          </div>
          <nav style={{ display: "flex", gap: 14, fontSize: 13, color: "#5b6b6d" }}>
            <span>მთავარი</span>
            <span>კატალოგი</span>
            <span>კონტაქტი</span>
          </nav>
        </div>

        <p style={{ color: "#888", fontSize: 12, marginTop: 0 }}>
          AccessChain bundled demo — intentionally inaccessible. Do not copy these patterns.
        </p>

        {/* Missing heading hierarchy: h1 then h4 */}
        <h1 style={{ marginBottom: 4, fontSize: "2rem", color: "#0f1c1e" }}>
          დემო მაღაზია
        </h1>
        <h4 className="skipped-heading" style={{ marginTop: 0, color: "#5b6b6d" }}>
          ფასები
        </h4>

        {/* Auto-rotating real page examples */}
        <DemoPageCarousel />

        {/* Insufficient color contrast */}
        <p
          className="low-contrast"
          style={{
            color: "#c8c8c8",
            background: "#ededed",
            padding: 12,
            marginTop: 20,
            borderRadius: 8,
          }}
        >
          მნიშვნელოვანი ინფორმაცია თითქმის უხილავია
        </p>

        <div
          style={{
            display: "grid",
            gap: 16,
            marginTop: 24,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <div
            style={{
              border: "1px solid #d7e0df",
              borderRadius: 12,
              padding: 16,
              background: "rgba(255,255,255,0.85)",
            }}
          >
            <p style={{ margin: 0, fontSize: 13, color: "#5b6b6d" }}>პროდუქტი</p>
            <p style={{ margin: "6px 0 0", fontWeight: 700 }}>ლინენის ჩანთა</p>
            <p style={{ margin: "4px 0 0", color: "#0b5f63" }}>₾49</p>
          </div>
          <div
            style={{
              border: "1px solid #d7e0df",
              borderRadius: 12,
              padding: 16,
              background: "rgba(255,255,255,0.85)",
            }}
          >
            <p style={{ margin: 0, fontSize: 13, color: "#5b6b6d" }}>პროდუქტი</p>
            <p style={{ margin: "6px 0 0", fontWeight: 700 }}>მატყლის შარფი</p>
            <p style={{ margin: "4px 0 0", color: "#0b5f63" }}>₾36</p>
          </div>
        </div>

        {/* Unlabeled form field + empty button */}
        <form
          style={{
            marginTop: 28,
            padding: 16,
            borderRadius: 12,
            border: "1px solid #d7e0df",
            background: "rgba(255,255,255,0.9)",
          }}
        >
          <p style={{ marginTop: 0, fontWeight: 700 }}>გამოწერა / კონტაქტი</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <input
              name="email"
              type="email"
              placeholder="ელფოსტა"
              style={{
                height: 40,
                minWidth: 200,
                flex: 1,
                borderRadius: 8,
                border: "1px solid #c5d6d4",
                padding: "0 12px",
              }}
            />
            <button
              className="empty-btn"
              type="button"
              style={{ width: 40, height: 40, borderRadius: 8, border: "1px solid #c5d6d4" }}
            />
          </div>
        </form>

        {/* Keyboard-inaccessible interactive element */}
        <FakeClickableLink>დაწკაპუნეთ აქ</FakeClickableLink>

        <p style={{ marginTop: 32, fontSize: 13, color: "#666" }}>
          ეს დემო მაღაზია AccessChain-ის აუდიტის სამიზნეა. სუფთა HTML ვერსია (lang-ის
          გარეშე):{" "}
          <a href="/demo/inaccessible.html">/demo/inaccessible.html</a>. აუდიტის
          დასაწყებად:{" "}
          <Link href="/audit/new" style={{ color: "#0b5f63" }}>
            ახალი აუდიტი
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
