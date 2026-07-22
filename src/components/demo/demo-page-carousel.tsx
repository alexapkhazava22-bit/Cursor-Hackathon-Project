"use client";

import { useEffect, useState, useCallback, type CSSProperties } from "react";

export interface DemoSlide {
  id: string;
  titleKa: string;
  titleEn: string;
  subtitleKa: string;
  badge: string;
  /** Decorative gradient stops for a realistic hero look */
  from: string;
  to: string;
  accent: string;
  /** Optional product/scene chips shown on the slide */
  chips: string[];
}

const SLIDES: DemoSlide[] = [
  {
    id: "home",
    titleKa: "ახალი კოლექცია 2026",
    titleEn: "Home · New Collection",
    subtitleKa: "ხელნაკეთი პროდუქტები თბილისიდან — მიწოდება მთელ საქართველოში",
    badge: "მთავარი",
    from: "#0b5f63",
    to: "#1a8f7a",
    accent: "#f0c75e",
    chips: ["უფასო მიწოდება", "24/7 მხარდაჭერა", "უსაფრთხო გადახდა"],
  },
  {
    id: "catalog",
    titleKa: "კატალოგი და ფასები",
    titleEn: "Catalog · Pricing",
    subtitleKa: "გაფილტრე კატეგორიებით — ტანსაცმელი, აქსესუარები, საჩუქრები",
    badge: "კატალოგი",
    from: "#1e3a5f",
    to: "#3d6b9a",
    accent: "#7dd3c0",
    chips: ["ქურთუკები", "ჩანთები", "საყელეები"],
  },
  {
    id: "story",
    titleKa: "ჩვენი ისტორია",
    titleEn: "About · Brand Story",
    subtitleKa: "ლოკალური ხელოსნები · მდგრადი მასალები · გამჭვირვალე წარმოება",
    badge: "შესახებ",
    from: "#5c3d2e",
    to: "#a67c52",
    accent: "#f5d6ba",
    chips: ["2019-დან", "40+ ხელოსანი", "ქართული ბრენდი"],
  },
  {
    id: "contact",
    titleKa: "დაგვიკავშირდი",
    titleEn: "Contact · Support",
    subtitleKa: "შეკითხვა შეკვეთაზე ან პარტნიორობაზე — ვპასუხობთ 1 სამუშაო დღეში",
    badge: "კონტაქტი",
    from: "#2d1b4e",
    to: "#6b3fa0",
    accent: "#e8b4f0",
    chips: ["თბილისი", "ელფოსტა", "ჩატი"],
  },
  {
    id: "checkout",
    titleKa: "გადახდის გვერდი",
    titleEn: "Checkout · Cart",
    subtitleKa: "კალათა, მიწოდების მისამართი და გადახდის მეთოდი ერთ ადგილას",
    badge: "შეკვეთა",
    from: "#0f3d2e",
    to: "#2a9d6a",
    accent: "#c8f5d8",
    chips: ["კალათა: 2", "ჯამი: ₾89", "Devnet demo"],
  },
];

export function DemoPageCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((next: number) => {
    setIndex((current) => {
      const len = SLIDES.length;
      return ((next % len) + len) % len;
    });
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, [paused]);

  const slide = SLIDES[index];

  return (
    <section
      className="demo-carousel"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ marginTop: 16 }}
    >
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 16,
          minHeight: 280,
          background: `linear-gradient(135deg, ${slide.from}, ${slide.to})`,
          color: "#fff",
          boxShadow: "0 18px 40px rgba(15, 28, 30, 0.18)",
          transition: "background 0.6s ease",
        }}
      >
        {/* Intentionally missing alt on decorative scene image — accessibility demo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/demo-hero.svg"
          width={640}
          height={240}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.12,
            mixBlendMode: "luminosity",
          }}
        />

        <div
          key={slide.id}
          className="demo-slide-panel"
          style={{
            position: "relative",
            zIndex: 1,
            padding: "2rem 1.5rem 4.5rem",
            animation: "demoSlideIn 0.55s ease both",
          }}
        >
          <span
            style={{
              display: "inline-block",
              fontSize: 11,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              background: "rgba(255,255,255,0.16)",
              padding: "6px 10px",
              borderRadius: 999,
            }}
          >
            {slide.badge}
          </span>
          <p
            style={{
              marginTop: 14,
              fontSize: 13,
              opacity: 0.8,
              letterSpacing: "0.04em",
            }}
          >
            {slide.titleEn}
          </p>
          <h2
            style={{
              margin: "8px 0 0",
              fontSize: "clamp(1.6rem, 4vw, 2.35rem)",
              lineHeight: 1.15,
              fontWeight: 700,
              maxWidth: 520,
            }}
          >
            {slide.titleKa}
          </h2>
          <p
            style={{
              marginTop: 12,
              maxWidth: 480,
              fontSize: 15,
              lineHeight: 1.5,
              opacity: 0.92,
            }}
          >
            {slide.subtitleKa}
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 20,
            }}
          >
            {slide.chips.map((chip) => (
              <span
                key={chip}
                style={{
                  background: slide.accent,
                  color: "#0f1c1e",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "6px 10px",
                  borderRadius: 8,
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 14,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`გვერდი: ${s.badge}`}
                onClick={() => go(i)}
                style={{
                  width: i === index ? 22 : 8,
                  height: 8,
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  background:
                    i === index ? "#fff" : "rgba(255,255,255,0.45)",
                  transition: "width 0.25s ease, background 0.25s ease",
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              aria-label="წინა სლაიდი"
              onClick={() => go(index - 1)}
              style={navBtnStyle}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="შემდეგი სლაიდი"
              onClick={() => go(index + 1)}
              style={navBtnStyle}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* animation handled via globals.css .demo-slide-panel */}
    </section>
  );
}

const navBtnStyle: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.35)",
  background: "rgba(0,0,0,0.25)",
  color: "#fff",
  cursor: "pointer",
  fontSize: 18,
  lineHeight: 1,
};
