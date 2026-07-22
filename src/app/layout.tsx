import { Syne, Manrope, Noto_Sans_Georgian, Noto_Serif_Georgian } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const display = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const notoSansKa = Noto_Sans_Georgian({
  subsets: ["georgian"],
  variable: "--font-noto-sans-ka",
  weight: ["400", "500", "600", "700"],
});

const notoSerifKa = Noto_Serif_Georgian({
  subsets: ["georgian"],
  variable: "--font-noto-serif-ka",
  weight: ["500", "600", "700"],
});

export const metadata = {
  title: "AccessChain — Accessibility Audit on Solana",
  description:
    "AI-powered website accessibility auditor for non-technical business owners, with Solana Devnet payments and verifiable report integrity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ka" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('accesschain.theme');if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');document.documentElement.dataset.theme='dark';document.documentElement.style.colorScheme='dark';}var l=localStorage.getItem('accesschain.locale');if(l==='en'||l==='ka'){document.documentElement.lang=l;}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${display.variable} ${body.variable} ${notoSansKa.variable} ${notoSerifKa.variable} pattern-grid flex min-h-screen flex-col antialiased`}
      >
        <AppProviders>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </AppProviders>
      </body>
    </html>
  );
}
