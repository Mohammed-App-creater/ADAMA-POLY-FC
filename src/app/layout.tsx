import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, Noto_Sans_Ethiopic } from "next/font/google";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { LangProvider } from "@/components/client";
import { Footer, Nav } from "@/components/chrome";
import { ScrollFx } from "@/components/fx";
import type { Lang } from "@/lib/i18n";
import { OG, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const body = Barlow({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--f-body" });
const display = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--f-display" });
const ethiopic = Noto_Sans_Ethiopic({ subsets: ["ethiopic"], weight: ["400", "600", "700"], variable: "--f-eth" });

const description = "Youth football academy in Adama, Ethiopia: programs from U10 to U17, squads, training schedule, fixtures, registration and fee payment.";
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} | Youth football in Adama, Ethiopia`, template: `%s · ${SITE_NAME}` },
  description,
  applicationName: SITE_NAME,
  keywords: ["College Adama Football Academy", "Adama football academy", "youth football Adama", "football academy Ethiopia", "ኮሌጅ አዳማ እግር ኳስ አካዳሚ"],
  alternates: { canonical: "/" },
  icons: { icon: "/images/crest.png", apple: "/images/crest.png" },
  openGraph: { ...OG, url: "/", title: SITE_NAME, description },
  twitter: { card: "summary_large_image" },
  // Paste the code from Google Search Console into GOOGLE_SITE_VERIFICATION to prove ownership.
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
};
// Tells Google what kind of organisation this is (shown in the knowledge panel).
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  name: SITE_NAME,
  alternateName: "ኮሌጅ አዳማ እግር ኳስ አካዳሚ",
  url: SITE_URL,
  logo: `${SITE_URL}/images/crest.png`,
  image: `${SITE_URL}/images/hero.jpg`,
  description,
  sport: "Football",
  foundingDate: "2013",
  address: { "@type": "PostalAddress", addressLocality: "Adama", addressRegion: "Oromia", addressCountry: "ET" },
};
export const viewport: Viewport = { themeColor: "#0d0d0d" };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const saved = (await cookies()).get("lang")?.value;
  const lang: Lang = saved === "am" || saved === "om" ? saved : "en";
  return (
    <html lang={lang} className={`${body.variable} ${display.variable} ${ethiopic.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <LangProvider initial={lang}>
          <a className="skip" href="#main">Skip to content</a>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
          <ScrollFx />
        </LangProvider>
      </body>
    </html>
  );
}
